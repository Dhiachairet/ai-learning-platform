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

    // ✅ NEW: Check if user has no role (edge case)
    if (!user.role) {
      const tempToken = jwt.sign(
        {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          needsRoleSelection: true, // Flag for role selection
        },
        process.env.JWT_SECRET || 'minimal-secret-key',
        { expiresIn: '1h' } // Short expiration for security
      );

      return NextResponse.json({ 
        message: 'Please select your role to continue', 
        token: tempToken,
        needsRoleSelection: true 
      }, { status: 200 });
    }

    // ✅ Normal login with role
    const token = jwt.sign(
      {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET || 'minimal-secret-key',
      { expiresIn: '7d' } // Changed from noTimestamp to expiresIn
    );

    return NextResponse.json({ 
      message: 'Sign-in successful', 
      token 
    }, { status: 200 });
  } catch (error) {
    console.error('Signin error details:', error);
    return NextResponse.json({ message: 'Error signing in' }, { status: 400 });
  }
}