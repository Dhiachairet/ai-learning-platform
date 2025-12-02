import { NextResponse } from 'next/server';
import Course from '../../../model/Course';
import connectDB from '../../../lib/db';

export async function GET() {
  try {
    await connectDB();

    // Get only approved courses and populate instructor data
    const courses = await Course.find({ status: 'approved' })
      .populate('instructor', 'name email')
      .select('title description category level thumbnail studentsEnrolled instructor createdAt updatedAt')
      .sort({ createdAt: -1 });
       
    return NextResponse.json({ 
      success: true, 
      courses 
    });
    
  } catch (error) {
    console.error('Error fetching courses:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch courses' },
      { status: 500 }
    );
  }
}