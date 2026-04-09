import { NextResponse } from 'next/server';
import connectDB from '@/app/lib/db';
import Certificate from '@/app/model/Certificate';

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
      .populate('courseId', 'title thumbnail')
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

    // Get certificate details (you'll need to populate these from your database)
    // For now, return a mock certificate
    const certificate = {
      _id: Date.now().toString(),
      certificateId: `CERT-${Date.now().toString().slice(-8)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      studentName: 'John Doe', // Replace with actual student name
      courseName: 'Test Course', // Replace with actual course name
      instructorName: 'Test Instructor', // Replace with actual instructor name
      issueDate: new Date().toISOString(),
      completionDate: new Date().toISOString(),
      metadata: {
        level: 'beginner',
        category: 'Programming',
        quizScore: 90
      }
    };

    // TODO: Save to database when you implement the full flow
    // const newCertificate = new Certificate(certificate);
    // await newCertificate.save();

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