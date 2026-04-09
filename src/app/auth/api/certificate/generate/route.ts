import { NextResponse } from 'next/server';
import connectDB from '@/app/lib/db';
import Certificate from '@/app/model/Certificate';
import Enrollment from '@/app/model/Enrollment';
import Course from '@/app/model/Course';
import User from '@/app/model/User';

export async function GET(request: Request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    const courseId = searchParams.get('courseId');
    const enrollmentId = searchParams.get('enrollmentId');

    let query: any = {};
    if (studentId) query.studentId = studentId;
    if (courseId) query.courseId = courseId;
    if (enrollmentId) query.enrollmentId = enrollmentId;

    const certificates = await Certificate.find(query)
      .sort({ issueDate: -1 })
      .lean();

    return NextResponse.json({
      certificates
    });

  } catch (error) {
    console.error('Fetch certificates error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch certificates' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const { enrollmentId, studentId, courseId } = body;

    if (!enrollmentId || !studentId || !courseId) {
      return NextResponse.json(
        { error: 'Enrollment ID, Student ID, and Course ID are required' },
        { status: 400 }
      );
    }

    // Check if certificate already exists
    const existingCertificate = await Certificate.findOne({ enrollmentId });
    if (existingCertificate) {
      return NextResponse.json({
        message: 'Certificate already exists',
        certificate: existingCertificate
      });
    }

    // Get enrollment with populated data
    const enrollment = await Enrollment.findById(enrollmentId)
      .populate('student')
      .populate('course');

    if (!enrollment) {
      return NextResponse.json(
        { error: 'Enrollment not found' },
        { status: 404 }
      );
    }

    // Get course with instructor
    const course = await Course.findById(courseId).populate('instructor');
    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    // Get instructor details
    const instructor = await User.findById(course.instructor);
    if (!instructor) {
      return NextResponse.json(
        { error: 'Instructor not found' },
        { status: 404 }
      );
    }

    // Generate certificate ID
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    const certificateId = `CERT-${timestamp}-${random}`;

    // Create certificate
    const certificate = new Certificate({
      studentId: studentId,
      courseId: courseId,
      enrollmentId: enrollmentId,
      certificateId: certificateId,
      studentName: enrollment.student?.name || 'Student',
      courseName: course.title,
      instructorName: instructor.name,
      issueDate: new Date(),
      completionDate: enrollment.completedAt || new Date(),
      metadata: {
        level: course.level,
        category: course.category,
        quizScore: enrollment.quizScore || 0
      }
    });

    await certificate.save();

    return NextResponse.json({
      message: 'Certificate generated successfully',
      certificate
    });

  } catch (error) {
    console.error('Certificate generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate certificate' },
      { status: 500 }
    );
  }
}