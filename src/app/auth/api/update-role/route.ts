import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '../../../lib/db';
import User from '../../../model/User';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

    // Check if this token is for role selection
    if (!decoded.needsRoleSelection) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }

    const { role, educationLevel, expertiseArea } = await request.json();

    if (!role || !['student', 'instructor'].includes(role)) {
      return NextResponse.json({ message: 'Invalid role' }, { status: 400 });
    }

    // Update user with selected role
    const updatedUser = await User.findByIdAndUpdate(
      decoded.id,
      { 
        role,
        ...(role === 'student' && { educationLevel }),
        ...(role === 'instructor' && { expertiseArea })
      },
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Generate new token with the role
    const newToken = jwt.sign(
      {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
      },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );
    const redirectUrl = role === 'instructor' ? '/dashboard/instructor' : '/';

    return NextResponse.json({
  message: 'Role updated successfully',
  token: newToken,
  redirect: redirectUrl, // ✅ Add this line
  user: {
    id: updatedUser._id,
    name: updatedUser.name,
    email: updatedUser.email,
    role: updatedUser.role,
  }
});

  } catch (error) {
    console.error('Role update error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}