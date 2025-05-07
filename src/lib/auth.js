// src/lib/auth.js
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import dbConnect from './dbConnect';
import User from '@/models/User';

const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Verifies JWT token from cookies and fetches user data.
 * @param {Request} req - The incoming request object (from Next.js API route or middleware)
 * @returns {Promise<{user: Object|null, error?: string, status?: number}>}
 */
export async function verifyAuth(req) {
    const token = cookies().get('authToken')?.value;

    if (!token) {
        return { user: null, error: 'Missing authentication token', status: 401 };
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);

        if (!decoded || typeof decoded !== 'object' || !decoded.userId) {
             return { user: null, error: 'Invalid token payload', status: 401 };
        }

        await dbConnect();
        const user = await User.findById(decoded.userId).select('-password').lean();

        if (!user) {
             return { user: null, error: 'User not found', status: 404 };
        }

        // Convert ObjectId to string before returning if needed by frontend
        // (lean() often handles this, but double-check usage)
        // const plainUser = JSON.parse(JSON.stringify(user));

        return { user };

    } catch (error) {
        console.error("Auth verification error:", error.message);
        if (error.name === 'JsonWebTokenError') {
             return { user: null, error: 'Invalid token', status: 401 };
        }
        if (error.name === 'TokenExpiredError') {
             return { user: null, error: 'Token expired', status: 401 };
        }
        return { user: null, error: 'Authentication failed', status: 500 };
    }
}