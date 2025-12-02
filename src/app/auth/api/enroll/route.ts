import { NextResponse } from 'next/server';
import Enrollment from '../../../model/Enrollment';
import Course from '../../../model/Course';
import connectDB from '../../../lib/db';
import User from '../../../model/User';

export async function POST(request: Request) {
  try {
    await connectDB();

    const { courseId, studentId } = await request.json();

    // Validate input
    if (!courseId || !studentId) {
      return NextResponse.json(
        { error: 'Course ID and Student ID are required' },
        { status: 400 }
      );
    }

    // Check if course exists and is approved
    const course = await Course.findById(courseId);
    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    if (course.status !== 'approved') {
      return NextResponse.json(
        { error: 'Course is not available for enrollment' },
        { status: 400 }
      );
    }

    // Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({ 
      student: studentId, 
      course: courseId 
    });

    if (existingEnrollment) {
      return NextResponse.json(
        { error: 'Already enrolled in this course' },
        { status: 400 }
      );
    }

    // Create enrollment
    const enrollment = await Enrollment.create({
      student: studentId,
      course: courseId
    });

    // Add student to course's students array
    await Course.findByIdAndUpdate(courseId, {
      $addToSet: { students: studentId }
    });

    // Add course to user's enrolledCourses
    await User.findByIdAndUpdate(studentId, {
      $addToSet: { 
        enrolledCourses: {
          course: courseId,
          enrolledAt: new Date()
        }
      }
    });

    console.log(`Student ${studentId} enrolled in course ${courseId}`);

    return NextResponse.json({ 
      success: true, 
      enrollment,
      message: 'Successfully enrolled in course' 
    });

  } catch (error) {
    console.error('Enrollment error:', error);
    return NextResponse.json(
      { error: 'Failed to enroll in course' },
      { status: 500 }
    );
  }
}