// src/app/api/users/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import { verifyAuth } from '@/lib/auth';

// GET list of users (name and ID) for assignment dropdowns
export async function GET(req) {
    const authResult = await verifyAuth(req);
    if (!authResult.user) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    try {
        // Find all users, but only select their name and _id
        // Exclude the currently logged-in user from the list if desired
        const users = await User.find(
            { _id: { $ne: authResult.user._id } }, // Optional: Exclude self
            'name _id' // Select only name and _id fields
        ).lean(); // Use lean for plain JS objects

        return NextResponse.json({ users }, { status: 200 });

    } catch (error) {
        console.error("Get Users Error:", error);
        return NextResponse.json({ message: 'Error fetching users', error: error.message }, { status: 500 });
    }
}