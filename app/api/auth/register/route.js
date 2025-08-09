import { NextResponse } from 'next/server';
import User from '@/models/User';
import dbConnect from '@/lib/dbConnect';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  await dbConnect();
  
  try {
    const { email, name, password } = await request.json();
    
    // Validate input
    if (!email || !name || !password) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Create new user
    const user = new User({
      email,
      name,
      password: hashedPassword,
      role: 'voter' // Default role
    });

    await user.save();
    
    return NextResponse.json(
      { success: true, user: { email, name } },
      { status: 201 }
    );
    
  } catch (error) {
    return NextResponse.json(
      { error: error.message || 'Registration failed' },
      { status: 500 }
    );
  }
}