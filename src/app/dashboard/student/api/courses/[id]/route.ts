import { NextResponse } from 'next/server';
import Enrollment from '../../../../../model/Enrollment';
import Course from '../../../../../model/Course';
import connectDB from '../../../../../lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    // Get course with instructor info
    const course = await Course.findById(id)
      .populate('instructor', 'name email')
      .select('title description category level thumbnail materials instructor');

    if (!course) {
      return NextResponse.json(
        { success: false, error: 'Course not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      course
    });

  } catch (error) {
    console.error('Error fetching course:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch course' },
      { status: 500 }
    );
  }
}