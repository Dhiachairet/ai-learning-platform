import connectDB from '../../../lib/db';
import User from '../../../model/User';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';



export async function POST(request: Request) {
  await connectDB();
  const { email, password } = await request.json();

  if (!email || !password) {
    return NextResponse.json({ message: 'Missing email or password' }, { status: 400 });
  }

  try {
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return NextResponse.json({ message: 'Invalid email or password' }, { status: 401 });
    }

    const token = jwt.sign(
      {
        id: user._id.toString(),
        name: user.name, // Using the new name field
        role: user.role,
      },
      process.env.JWT_SECRET || 'minimal-secret-key',
      { noTimestamp: true }
    );

    return NextResponse.json({ message: 'Sign-in successful', token }, { status: 200 });
  } catch (error) {
    console.error('Signin error details:', error);
    return NextResponse.json({ message: 'Error signing in' }, { status: 400 });
  }
}