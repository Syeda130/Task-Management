// src/app/api/auth/register/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';

export async function POST(req) {
  // ... (rest of the logic remains the same, just remove type annotations)
  await dbConnect();
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ message: 'User already exists' }, { status: 409 });
    }

    const user = new User({ name, email, password });
    await user.save();

    const userResponse = user.toObject();
    delete userResponse.password;

    return NextResponse.json({ message: 'User registered successfully', user: userResponse }, { status: 201 });
  } catch (error) {
    console.error('Registration Error:', error);
     if (error.name === 'ValidationError') {
        return NextResponse.json({ message: 'Validation Error', errors: error.errors }, { status: 400 });
    }
    return NextResponse.json({ message: 'Internal Server Error', error: error.message }, { status: 500 });
  }
}

