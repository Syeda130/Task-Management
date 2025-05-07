// src/app/api/tasks/route.js
import { NextResponse } from 'next/server'; // Make sure NextResponse is imported
import dbConnect from '@/lib/dbConnect';
import Task from '@/models/Task'; // Assuming Task model is correctly defined
import Notification from '@/models/Notification';
import { verifyAuth } from '@/lib/auth';
import mongoose from 'mongoose';
 

// GET Tasks (with filtering/searching)
export async function GET(req) {
    const authResult = await verifyAuth(req);
    if (!authResult.user) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    try {
        const { searchParams } = new URL(req.url);
        const searchTerm = searchParams.get('search');
        const status = searchParams.get('status');
        const priority = searchParams.get('priority');
        const dueDateFilter = searchParams.get('dueDate');
        const assignedToMe = searchParams.get('assignedToMe');
        const createdByMe = searchParams.get('createdByMe');
        const overdue = searchParams.get('overdue');
        const sortParam = searchParams.get('sort'); // e.g., 'createdAt:desc' or 'dueDate:asc'

        const page = parseInt(searchParams.get('page') || '1', 10);
        const limit = parseInt(searchParams.get('limit') || '10', 10);

        let query = {}; // Mongoose.FilterQuery<ITask> if using TS

        if (searchTerm) {
            query.$text = { $search: searchTerm };
        }
        if (status) {
            query.status = status;
        }
        if (priority) {
            query.priority = priority;
        }
        if (dueDateFilter) {
             const targetDate = new Date(dueDateFilter);
             if (!isNaN(targetDate.getTime())) {
                const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
                const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));
                query.dueDate = { $gte: startOfDay, $lte: endOfDay };
             }
        }
        if (assignedToMe === 'true') {
            query.assignedTo = authResult.user._id;
        }
        if (createdByMe === 'true') {
            query.createdBy = authResult.user._id;
        }
        if (overdue === 'true') {
            query.dueDate = { $lt: new Date() };
            query.status = { $ne: 'Done' };
        }

        const skip = (page - 1) * limit;

        let sortOption = { createdAt: -1 }; // Default sort
        if (sortParam) {
            const [field, order] = sortParam.split(':');
            if (field && order) {
                sortOption = { [field]: order === 'desc' ? -1 : 1 };
            }
        }


        const tasks = await Task.find(query)
            .populate('createdBy', 'name email')
            .populate('assignedTo', 'name email')
            .sort(sortOption) // Apply sort
            .skip(skip)
            .limit(limit)
            .lean();

        const totalTasks = await Task.countDocuments(query);

        return NextResponse.json({
            tasks,
            totalPages: Math.ceil(totalTasks / limit),
            currentPage: page,
            totalTasks,
        }, { status: 200 });

    } catch (error) {
        console.error("Get Tasks Error:", error);
        return NextResponse.json({ message: 'Error fetching tasks', error: error.message }, { status: 500 });
    }
}

// POST Create Task
export async function POST(req) {
    const authResult = await verifyAuth(req);
    if (!authResult.user) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    try {
        const body = await req.json();
        const { title, description, status, priority, dueDate, assignedTo } = body;

        if (!title || !title.trim()) { // Added trim()
            return NextResponse.json({ message: 'Title is required' }, { status: 400 });
        }

        const newTaskData = {
            title: title.trim(), // Trim title
            description: description ? description.trim() : undefined, // Trim description if exists
            status: status || 'To Do', // Default status
            priority: priority || 'Medium', // Default priority
            createdBy: authResult.user._id,
        };

        if (dueDate) {
            const parsedDueDate = new Date(dueDate);
            if (!isNaN(parsedDueDate.getTime())) { // Check if date is valid
                newTaskData.dueDate = parsedDueDate;
            } else {
                // Optional: return error for invalid date format
                // return NextResponse.json({ message: 'Invalid due date format' }, { status: 400 });
                console.warn("Invalid due date received:", dueDate);
            }
        }

        if (assignedTo && mongoose.Types.ObjectId.isValid(assignedTo)) {
            newTaskData.assignedTo = new mongoose.Types.ObjectId(assignedTo);
        } else if (assignedTo) {
            console.warn(`Invalid assignedTo ID received: ${assignedTo}. Task will be unassigned.`);
            // Or: return NextResponse.json({ message: 'Invalid assignedTo user ID' }, { status: 400 });
        }

        const task = new Task(newTaskData);
        await task.save();

        // --- Socket.IO / Notification Logic ---
        const io = getIoInstance(req);

      if (newTaskData.assignedTo && newTaskData.assignedTo.toString() !== authResult.user._id.toString()) {
    const notificationMessage = `${authResult.user.name} assigned you a new task: "${task.title}"`;
    const notification = await Notification.create({ // Assuming Notification model is imported
        user: newTaskData.assignedTo,
        message: notificationMessage,
        link: `/tasks/${task._id}`
    });

    try {
        // URL of your separate WebSocket server's notification endpoint
        const wsNotifyUrl = `http://localhost:${process.env.WS_PORT || 3001}/send-notification`;

        const response = await fetch(wsNotifyUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                targetUserId: newTaskData.assignedTo.toString(),
                eventName: 'taskAssigned', // The event name client listens for
                data: { // The payload for the event
                    message: notificationMessage,
                    taskId: task._id.toString(),
                    title: task.title,
                    notificationId: notification._id.toString()
                }
            })
        });

        if (!response.ok) {
            const errorData = await response.text();
            console.error(`Failed to send notification event to WS server: ${response.status}`, errorData);
        } else {
            console.log(`🚀 HTTP request to WS server successful for 'taskAssigned' event for user ${newTaskData.assignedTo.toString()}`);
        }
    } catch (e) {
        console.error("Error sending HTTP request to WS server:", e);
    }
}
        // --- End Socket.IO / Notification Logic ---

        // Populate fields before sending response
        const populatedTask = await Task.findById(task._id)
             .populate('createdBy', 'name email')
             .populate('assignedTo', 'name email')
             .lean();

        return NextResponse.json({ message: 'Task created successfully', task: populatedTask }, { status: 201 });

    } catch (error) {
        console.error("Create Task Error:", error);
         if (error.name === 'ValidationError') {
            return NextResponse.json({ message: 'Validation Error', errors: error.errors }, { status: 400 });
        }
        return NextResponse.json({ message: 'Error creating task', error: error.message }, { status: 500 });
    }
}