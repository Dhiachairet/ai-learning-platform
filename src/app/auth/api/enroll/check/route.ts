import { NextResponse } from 'next/server';
import connectDB from '@/app/lib/db';
import Enrollment from '@/app/model/Enrollment';
import QuizAttempt from '@/app/model/QuizAttempt'; // ADD THIS IMPORT

export async function GET(request: Request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');
    const studentId = searchParams.get('studentId');

    if (!courseId || !studentId) {
      return NextResponse.json(
        { error: 'Course ID and Student ID are required' },
        { status: 400 }
      );
    }

    const enrollment = await Enrollment.findOne({
      course: courseId,
      student: studentId
    }).populate('student', 'name email')
      .populate('course', 'title level category instructor');

    if (!enrollment) {
      return NextResponse.json({
        isEnrolled: false,
        enrollment: null,
        quizAttempts: []
      });
    }

    // Fetch quiz attempts for this student and course
    const quizAttempts = await QuizAttempt.find({
      studentId: studentId,
      courseId: courseId
    }).sort({ completedAt: -1 }); // Most recent first

    return NextResponse.json({
      isEnrolled: true,
      enrollment,
      quizAttempts
    });

  } catch (error) {
    console.error('Error checking enrollment:', error);
    return NextResponse.json(
      { error: 'Failed to check enrollment status' },
      { status: 500 }
    );
  }
}