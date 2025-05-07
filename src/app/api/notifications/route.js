// src/app/api/notifications/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Notification from '@/models/Notification';
import { verifyAuth } from '@/lib/auth';

// GET Notifications for the logged-in user
export async function GET(req) {
    const authResult = await verifyAuth(req);
    if (!authResult.user) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    try {
        const userId = authResult.user._id;

        // Fetch notifications for the user, sorted by creation date descending
        // Optionally limit the number fetched
        const notifications = await Notification.find({ user: userId })
            .sort({ createdAt: -1 })
            .limit(20) // Example limit
            .lean();

        // Optionally get unread count separately or calculate from fetched list
        const unreadCount = await Notification.countDocuments({ user: userId, read: false });

        return NextResponse.json({ notifications, unreadCount }, { status: 200 });

    } catch (error) {
        console.error("Get Notifications Error:", error);
        return NextResponse.json({ message: 'Error fetching notifications', error: error.message }, { status: 500 });
    }
}

// POST to mark notifications as read (example: mark all)
export async function POST(req) {
     const authResult = await verifyAuth(req);
    if (!authResult.user) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
     await dbConnect();

     try {
        const userId = authResult.user._id;
        // Example: Mark all as read. Could also accept specific IDs in the body.
        const updateResult = await Notification.updateMany(
            { user: userId, read: false },
            { $set: { read: true } }
        );

        return NextResponse.json({ message: 'Notifications marked as read', modifiedCount: updateResult.modifiedCount }, { status: 200 });

     } catch (error) {
        console.error("Mark Notifications Read Error:", error);
        return NextResponse.json({ message: 'Error updating notifications', error: error.message }, { status: 500 });
     }
}