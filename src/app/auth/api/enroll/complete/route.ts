import { NextResponse } from 'next/server';
import connectDB from '@/app/lib/db';
import Enrollment from '@/app/model/Enrollment';

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const { enrollmentId, courseId } = body;

    if (!enrollmentId || !courseId) {
      return NextResponse.json(
        { error: 'Enrollment ID and Course ID are required' },
        { status: 400 }
      );
    }

    const enrollment = await Enrollment.findByIdAndUpdate(
      enrollmentId,
      {
        completed: true,
        completedAt: new Date(),
        progress: 100,
      },
      { new: true }
    ).populate('student', 'name email')
     .populate('course', 'title level category instructor');

    if (!enrollment) {
      return NextResponse.json(
        { error: 'Enrollment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Course marked as completed',
      enrollment
    });

  } catch (error) {
    console.error('Complete course error:', error);
    return NextResponse.json(
      { error: 'Failed to mark course as completed' },
      { status: 500 }
    );
  }
}