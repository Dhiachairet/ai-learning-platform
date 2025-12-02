import { NextResponse } from 'next/server';
import Enrollment from '../../../../model/Enrollment';
import connectDB from '../../../../lib/db';
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
      student: studentId,
      course: courseId
    });

    return NextResponse.json({
      isEnrolled: !!enrollment,
      enrollment: enrollment || null
    });

  } catch (error) {
    console.error('Enrollment check error:', error);
    return NextResponse.json(
      { error: 'Failed to check enrollment status' },
      { status: 500 }
    );
  }
}