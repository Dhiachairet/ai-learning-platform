import connectDB from '../../../lib/db';
import User from '../../../model/User';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function POST(request: Request) {
  await connectDB();
  const { email, password, role, educationLevel, learningGoals, teachingExperience, expertiseArea } = await request.json();

  if (!email || !password || !role) {
    return NextResponse.json({ message: 'Missing required fields: email, password, and role are required' }, { status: 400 });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ message: 'Email already registered' }, { status: 400 });
    }

    const newUser = new User({
      email,
      password, // Still hash this for security
      role,
      educationLevel,
      learningGoals,
      teachingExperience,
      expertiseArea,
    });
    await newUser.save();

    //  JWT 
    const token = jwt.sign(
      {
        id: newUser._id.toString(),
        email: newUser.email,
        role: newUser.role,
        educationLevel: newUser.educationLevel,
        learningGoals: newUser.learningGoals,
        teachingExperience: newUser.teachingExperience,
        expertiseArea: newUser.expertiseArea,
      },
      process.env.JWT_SECRET || 'minimal-secret-key', // Fallback to a default if not set
      { noTimestamp: true } 
    );

    return NextResponse.json({ message: 'User registered successfully', token }, { status: 201 });
  } catch (error) {
    console.error('Signup error details:', error);
    return NextResponse.json({ message: 'Error registering user' }, { status: 400 });
  }
}