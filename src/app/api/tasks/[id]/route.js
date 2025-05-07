// src/app/api/tasks/[id]/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Task from '@/models/Task'; // Assuming Task model is correct
import Notification from '@/models/Notification'; // Assuming Notification model is correct
import { verifyAuth } from '@/lib/auth';
import mongoose from 'mongoose';

// GET Single Task (remains the same, no WebSocket interaction here)
export async function GET(req, { params }) {
    const authResult = await verifyAuth(req);
    if (!authResult.user) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    await dbConnect();
    const { id } = params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return NextResponse.json({ message: 'Invalid Task ID' }, { status: 400 });
    }

    try {
        const task = await Task.findById(id)
            .populate('createdBy', 'name email')
            .populate('assignedTo', 'name email')
            .lean();

        if (!task) {
            return NextResponse.json({ message: 'Task not found' }, { status: 404 });
        }
        return NextResponse.json({ task }, { status: 200 });
    } catch (error) {
        console.error("Get Task Error:", error);
        return NextResponse.json({ message: 'Error fetching task', error: error.message }, { status: 500 });
    }
}

// PUT Update Task
export async function PUT(req, { params }) {
    const authResult = await verifyAuth(req);
    if (!authResult.user) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    await dbConnect();
    const { id } = params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return NextResponse.json({ message: 'Invalid Task ID' }, { status: 400 });
    }

    try {
        const body = await req.json();
        const { title, description, status, priority, dueDate, assignedTo } = body;

        const updateData = {};
        if (title !== undefined) updateData.title = title.trim();
        if (description !== undefined) updateData.description = description.trim();
        if (status !== undefined) updateData.status = status;
        if (priority !== undefined) updateData.priority = priority;

        if (dueDate !== undefined) {
            if (dueDate) { // If dueDate is provided and not empty string/null
                const parsedDueDate = new Date(dueDate);
                if (!isNaN(parsedDueDate.getTime())) {
                    updateData.dueDate = parsedDueDate;
                } else {
                    console.warn("Invalid due date received on update:", dueDate);
                    // Optionally return error: return NextResponse.json({ message: 'Invalid due date format' }, { status: 400 });
                }
            } else { // If dueDate is explicitly set to null or empty string (to clear it)
                updateData.dueDate = null;
            }
        }

        if (assignedTo !== undefined) { // Check if assignedTo key is present in the request
            if (assignedTo && mongoose.Types.ObjectId.isValid(assignedTo)) {
                updateData.assignedTo = new mongoose.Types.ObjectId(assignedTo);
            } else if (assignedTo) { // It's present but not valid or not null/empty
                console.warn(`Invalid assignedTo ID received on update: ${assignedTo}.`);
                return NextResponse.json({ message: 'Invalid User ID for assignment' }, { status: 400 });
            } else { // assignedTo is null or empty string, meaning unassign
                updateData.assignedTo = null; // Or undefined, Mongoose will remove if undefined
            }
        }


        const existingTask = await Task.findById(id);
        if (!existingTask) {
            return NextResponse.json({ message: 'Task not found' }, { status: 404 });
        }
        // Optional: Add permission checks (e.g., only creator or assignee can update)

        const previousAssigneeId = existingTask.assignedTo?.toString();

        const updatedTask = await Task.findByIdAndUpdate(id, { $set: updateData }, { // Use $set for partial updates
            new: true,
            runValidators: true,
        })
        .populate('createdBy', 'name email')
        .populate('assignedTo', 'name email') // Populate to get new assignee's details if any
        .lean();

        if (!updatedTask) {
            return NextResponse.json({ message: 'Task not found after update attempt' }, { status: 404 });
        }

        // --- Socket.IO / Notification Logic (NEW WAY) ---
        let notificationTargetUserId = null;
        let notificationMessage = "";
        const newAssigneeId = updatedTask.assignedTo?._id?.toString(); // Get ID from populated assignedTo

        // Case 1: Task assignment changed to a NEW user (and it's not the updater themselves)
        if (newAssigneeId && newAssigneeId !== previousAssigneeId && newAssigneeId !== authResult.user._id.toString()) {
            notificationTargetUserId = newAssigneeId;
            notificationMessage = `${authResult.user.name} assigned you the task: "${updatedTask.title}"`;
        }
        // Case 2: Task was updated (not an assignment change to a new user), notify current assignee (if not the updater)
        else if (newAssigneeId && newAssigneeId !== authResult.user._id.toString()) {
            notificationTargetUserId = newAssigneeId;
            notificationMessage = `${authResult.user.name} updated the task assigned to you: "${updatedTask.title}"`;
        }
        // Case 3: Task was updated, notify creator (if not assigned and not the updater)
        else if (!newAssigneeId && updatedTask.createdBy._id.toString() !== authResult.user._id.toString()) {
            notificationTargetUserId = updatedTask.createdBy._id.toString();
            notificationMessage = `${authResult.user.name} updated the task you created: "${updatedTask.title}"`;
        }

        if (notificationTargetUserId && notificationMessage) {
            const notificationDoc = await Notification.create({
                user: notificationTargetUserId,
                message: notificationMessage,
                link: `/tasks/${updatedTask._id}`
            });

            try {
                const wsNotifyUrl = `http://localhost:${process.env.WS_PORT || 3001}/send-notification`;
                const response = await fetch(wsNotifyUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        targetUserId: notificationTargetUserId,
                        eventName: 'taskUpdated', // Client listens for this event
                        data: {
                            message: notificationMessage,
                            taskId: updatedTask._id.toString(),
                            title: updatedTask.title,
                            status: updatedTask.status, // Send other relevant updated fields
                            priority: updatedTask.priority,
                            notificationId: notificationDoc._id.toString()
                        }
                    })
                });
                if (!response.ok) {
                    const errorData = await response.text();
                    console.error(`Failed to send 'taskUpdated' event to WS server: ${response.status}`, errorData);
                } else {
                     console.log(`🚀 HTTP request to WS server successful for 'taskUpdated' event for user ${notificationTargetUserId}`);
                }
            } catch (e) {
                console.error("Error sending HTTP request to WS server for task update:", e);
            }
        }
        // --- End Socket.IO / Notification Logic ---

        return NextResponse.json({ message: 'Task updated successfully', task: updatedTask }, { status: 200 });

    } catch (error) {
        console.error("Update Task Error:", error);
        if (error.name === 'ValidationError') {
            return NextResponse.json({ message: 'Validation Error', errors: error.errors }, { status: 400 });
        }
        if (error.name === 'CastError' && error.path === 'assignedTo') {
            return NextResponse.json({ message: 'Invalid User ID for assignment' }, { status: 400 });
        }
        return NextResponse.json({ message: 'Error updating task', error: error.message }, { status: 500 });
    }
}

// DELETE Task (remains largely the same, no WebSocket interaction needed unless you want to notify about deletions)
export async function DELETE(req, { params }) {
    const authResult = await verifyAuth(req);
    if (!authResult.user) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    await dbConnect();
    const { id } = params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return NextResponse.json({ message: 'Invalid Task ID' }, { status: 400 });
    }

    try {
        const task = await Task.findById(id);
        if (!task) {
            return NextResponse.json({ message: 'Task not found' }, { status: 404 });
        }

        if (task.createdBy.toString() !== authResult.user._id.toString()) {
            return NextResponse.json({ message: 'Forbidden: Only the creator can delete this task' }, { status: 403 });
        }

        await Task.findByIdAndDelete(id);
        // Optional: Delete related notifications for this task
        // await Notification.deleteMany({ link: `/tasks/${id}` });

        return NextResponse.json({ message: 'Task deleted successfully' }, { status: 200 });
    } catch (error) {
        console.error("Delete Task Error:", error);
        return NextResponse.json({ message: 'Error deleting task', error: error.message }, { status: 500 });
    }
}