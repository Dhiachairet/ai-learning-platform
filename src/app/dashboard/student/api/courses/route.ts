import { NextResponse } from 'next/server';
import Enrollment from '../../../../model/Enrollment';
import Course from '../../../../model/Course';
import connectDB from '../../../../lib/db';
import jwt from 'jsonwebtoken';

// Helper to extract user from token
const getUserIdFromToken = (request: Request): string | null => {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
    return decoded.userId || decoded.id || decoded._id;
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
};

export async function GET(request: Request) {
  try {
    await connectDB();

    // Get student ID from token
    const studentId = getUserIdFromToken(request);
    
    if (!studentId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get all enrollments for this student
    const enrollments = await Enrollment.find({ student: studentId })
      .populate({
        path: 'course',
        populate: {
          path: 'instructor',
          select: 'name email'
        }
      })
      .sort({ lastAccessed: -1 });

    // Format enrolled courses
    const enrolledCourses = enrollments.map(enrollment => {
      const course = enrollment.course as any;
      const totalMaterials = course?.materials?.length || 0;
      const completedMaterials = enrollment.completedMaterials?.length || 0;
      
      return {
        _id: course._id,
        title: course.title,
        description: course.description,
        category: course.category,
        level: course.level,
        thumbnail: course.thumbnail,
        progress: enrollment.progress,
        lastAccessed: enrollment.lastAccessed,
        instructor: {
          name: course.instructor?.name || 'Unknown Instructor',
          email: course.instructor?.email || ''
        },
        totalLessons: totalMaterials,
        completedLessons: completedMaterials
      };
    });

    // Calculate stats
    const stats = {
      totalCourses: enrollments.length,
      inProgressCourses: enrollments.filter(e => !e.completed && e.progress > 0).length,
      completedCourses: enrollments.filter(e => e.completed).length,
      totalStudyTime: 0, // You can implement this later
      upcomingDeadlines: 0 // You can implement this later
    };

    // Get recent activity (from enrollment updates)
    const recentActivity = enrollments.slice(0, 5).map(enrollment => {
      const course = enrollment.course as any;
      const lastMaterial = enrollment.completedMaterials?.[enrollment.completedMaterials.length - 1];
      
      return {
        _id: enrollment._id,
        courseId: course._id,
        courseTitle: course.title,
        action: enrollment.completed ? 'completed' : enrollment.progress > 0 ? 'started' : 'enrolled',
        lessonTitle: lastMaterial ? 'Material completed' : 'Course enrolled',
        timestamp: enrollment.lastAccessed
      };
    });

    return NextResponse.json({ 
      success: true,
      enrolledCourses, 
      stats,
      recentActivity
    });

  } catch (error) {
    console.error('Error fetching student courses:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch student data' },
      { status: 500 }
    );
  }
}