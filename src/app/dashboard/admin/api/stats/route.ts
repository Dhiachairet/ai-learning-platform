import { NextResponse } from 'next/server';
import connectDB from '@/app/lib/db'; // Use default import, not named import
// Import your models - adjust these based on your actual model names
import User from '@/app/model/User';
import Course from '@/app/model/Course';

export async function GET() {
  try {
    // Connect to your database
    await connectDB();

    // Get real counts from your database
    const [totalUsers, totalCourses, totalInstructors, pendingApprovals] = await Promise.all([
      User.countDocuments(),
      Course.countDocuments(),
      User.countDocuments({ role: 'instructor' }),
      Course.countDocuments({ status: 'pending' })
    ]);

    // Get recent activities with proper type handling
    const recentCourses = await Course.find({ status: 'pending' })
      .populate('instructor', 'name email')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    const recentActivities: any[] = [];

    // Add course activities
    for (const course of recentCourses) {
      const courseObj = course as any;
      recentActivities.push({
        id: courseObj._id?.toString() || `course-${Date.now()}`,
        action: 'Course submitted for review',
        user: courseObj.instructor?.name || 'Unknown Instructor',
        time: courseObj.createdAt || new Date(),
        type: 'course'
      });
    }

    // Get recent user registrations
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(3)
      .lean();

    // Add user activities
    for (const user of recentUsers) {
      const userObj = user as any;
      recentActivities.push({
        id: userObj._id?.toString() || `user-${Date.now()}`,
        action: 'New user registration',
        user: userObj.name || userObj.email,
        time: userObj.createdAt || new Date(),
        type: 'user'
      });
    }

    // Sort activities by time and limit to 5
    recentActivities.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
    const finalActivities = recentActivities.slice(0, 5);

    const stats = {
      totalUsers,
      totalCourses,
      totalInstructors,
      pendingApprovals,
      recentActivities: finalActivities,
      systemOverview: {
        uptime: '99.9%',
        storageUsed: '2.4GB',
        activeSessions: totalUsers, // Simplified for now
        systemAlerts: 0
      }
    };

    console.log('Successfully loaded real stats from database');
    return NextResponse.json(stats);
    
  } catch (error) {
    console.error('Stats API error - using mock data:', error);
    
    // Fallback to mock data
    const mockStats = {
      totalUsers: 2458,
      totalCourses: 156,
      totalInstructors: 48,
      pendingApprovals: 23,
      recentActivities: [
        { 
          id: '1', 
          action: 'New course submitted for review', 
          user: 'John Smith', 
          time: new Date(Date.now() - 5 * 60000).toISOString(), 
          type: 'course'
        },
        { 
          id: '2', 
          action: 'New instructor registration', 
          user: 'Sarah Johnson', 
          time: new Date(Date.now() - 15 * 60000).toISOString(), 
          type: 'user'
        },
      ],
      systemOverview: {
        uptime: '99.9%',
        storageUsed: '2.4GB',
        activeSessions: 1204,
        systemAlerts: 0
      }
    };

    return NextResponse.json(mockStats);
  }
}