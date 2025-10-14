import connectDB from '../../../lib/db';
import User from '../../../model/User';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function POST(request: Request) {
  await connectDB();
  const { email, name , password, role, educationLevel, expertiseArea } = await request.json();

  if (!email || !password || !role || !name) {
    return NextResponse.json({ message: 'Missing required fields: email, password, role, and name are required' }, { status: 400 });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ message: 'Email already registered' }, { status: 400 });
    }

    const newUser = new User({
      email,
      name,
      password,
      role,
      educationLevel,
      expertiseArea: Array.isArray(expertiseArea) ? expertiseArea : [expertiseArea],
      
    });
    await newUser.save();

    const token = jwt.sign(
      {
        id: newUser._id.toString(),
        email: newUser.email,
        role: newUser.role,
        educationLevel: newUser.educationLevel,
        expertiseArea: newUser.expertiseArea,
        name: newUser.name,
      },
      process.env.JWT_SECRET || 'minimal-secret-key',
      { noTimestamp: true }
    );

    return NextResponse.json({
      message: 'User registered successfully',
      token,
      redirect: '/auth/signin'
    }, { status: 201 });
  } catch (error) {
    console.error('Signup error details:', error);
    return NextResponse.json({ message: 'Error registering user' }, { status: 400 });
  }
}