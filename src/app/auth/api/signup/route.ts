import connectDB from '../../../lib/db';
import User from '../../../model/User';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  await connectDB();
  const { email, name, password, role, educationLevel, expertiseArea } = await request.json();

  // ✅ CHANGE: Remove role from required fields
  if (!email || !password || !name) {
    return NextResponse.json({ 
      message: 'Missing required fields: email, password, and name are required' 
    }, { status: 400 });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ message: 'Email already registered' }, { status: 400 });
    }

    // ✅ Hash password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ CREATE USER WITH EMPTY ROLE (so they go to role selection)
    const newUser = new User({
      email,
      name,
      password: hashedPassword,
      role: '', // ✅ EMPTY ROLE - will trigger role selection
      educationLevel: role === 'student' ? educationLevel : undefined,
      expertiseArea: role === 'instructor' ? (Array.isArray(expertiseArea) ? expertiseArea : [expertiseArea]) : [],
    });
    await newUser.save();

    // ✅ ALWAYS redirect to role selection for regular signup
    const tempToken = jwt.sign(
      {
        id: newUser._id.toString(),
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        needsRoleSelection: true,
      },
      process.env.JWT_SECRET || 'minimal-secret-key',
      { expiresIn: '1h' }
    );

    return NextResponse.json({
      message: 'User registered. Please select your role.',
      token: tempToken,
      needsRoleSelection: true
    }, { status: 201 });

  } catch (error) {
    console.error('Signup error details:', error);
    return NextResponse.json({ message: 'Error registering user' }, { status: 400 });
  }
}