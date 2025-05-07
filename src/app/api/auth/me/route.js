import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';

export async function GET(req) {
    const result = await verifyAuth(req);

    if (!result.user) {
        return NextResponse.json({ message: result.error || 'Unauthorized' }, { status: result.status || 401 });
    }
    return NextResponse.json({ user: result.user }, { status: 200 });
}