import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import Course from '../../../../model/Course';
import User from '@/app/model/User';
import connectDB from '../../../../lib/db';

const getUserIdFromToken = (request: NextRequest): string | null => {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.split(' ')[1];
    if (!token) return null;

    // Decode the JWT token
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    return payload.id || payload._id || null;
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const instructorId = getUserIdFromToken(request);
    if (!instructorId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const courses = await Course.find({ instructor: instructorId })
      .populate('students', 'name email')
      .sort({ createdAt: -1 });

    // Calculate stats
    const totalCourses = await Course.countDocuments({ instructor: instructorId });
    const publishedCourses = await Course.countDocuments({ 
      instructor: instructorId, 
      status: 'approved' 
    });
    const draftCourses = await Course.countDocuments({ 
      instructor: instructorId, 
      status: 'draft' 
    });
    const pendingCourses = await Course.countDocuments({ 
      instructor: instructorId, 
      status: 'pending' 
    });

    const totalStudents = await Course.aggregate([
      { $match: { instructor: instructorId } },
      { $project: { studentsCount: { $size: '$students' } } },
      { $group: { _id: null, total: { $sum: '$studentsCount' } } }
    ]);

    const stats = {
      totalCourses,
      publishedCourses,
      draftCourses,
      pendingCourses,
      totalStudents: totalStudents[0]?.total || 0,
    };

    return NextResponse.json({
      courses: courses.map(course => ({
        _id: course._id.toString(),
        title: course.title,
        description: course.description,
        category: course.category,
        level: course.level,
        status: course.status,
        thumbnail: course.thumbnail,
        materials: course.materials || [],
        students: course.students,
        studentsEnrolled: course.students.length,
        createdAt: course.createdAt,
        updatedAt: course.updatedAt,
      })),
      stats
    });

  } catch (error) {
    console.error('Error fetching courses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch courses' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const instructorId = getUserIdFromToken(request);
    if (!instructorId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, category, level = 'beginner', status = 'draft', thumbnail, materials = [] } = body;

    // Validate required fields
    if (!title || !description || !category) {
      return NextResponse.json(
        { error: 'Title, description, and category are required' },
        { status: 400 }
      );
    }

    const course = new Course({
      title,
      description,
      category,
      level,
      status,
      thumbnail: thumbnail || '',
      materials: materials,
      instructor: instructorId,
      students: [],
      lessons: []
    });

    await course.save();

    return NextResponse.json({
      message: 'Course created successfully',
      course: {
        _id: course._id.toString(),
        title: course.title,
        description: course.description,
        category: course.category,
        level: course.level,
        status: course.status,
        thumbnail: course.thumbnail,
        materials: course.materials,
        instructor: instructorId,
        createdAt: course.createdAt,
        updatedAt: course.updatedAt,
      }
    });

  } catch (error) {
    console.error('Error creating course:', error);
    return NextResponse.json(
      { error: 'Failed to create course' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connectDB();
    
    const instructorId = getUserIdFromToken(request);
    if (!instructorId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, title, description, category, level, status, thumbnail, materials } = body;

    const course = await Course.findOne({ _id: id, instructor: instructorId });
    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    // Update fields
    if (title) course.title = title;
    if (description) course.description = description;
    if (category) course.category = category;
    if (level) course.level = level;
    if (status) course.status = status;
    if (thumbnail !== undefined) course.thumbnail = thumbnail;
    if (materials !== undefined) course.materials = materials;
    course.updatedAt = new Date();

    await course.save();

    return NextResponse.json({
      message: 'Course updated successfully',
      course: {
        _id: course._id.toString(),
        title: course.title,
        description: course.description,
        category: course.category,
        level: course.level,
        status: course.status,
        thumbnail: course.thumbnail,
        materials: course.materials,
        updatedAt: course.updatedAt,
      }
    });

  } catch (error) {
    console.error('Error updating course:', error);
    return NextResponse.json(
      { error: 'Failed to update course' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await connectDB();
    
    const instructorId = getUserIdFromToken(request);
    if (!instructorId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Course ID is required' }, { status: 400 });
    }

    const course = await Course.findOne({ _id: id, instructor: instructorId });
    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    await Course.findByIdAndDelete(id);

    return NextResponse.json({ message: 'Course deleted successfully' });

  } catch (error) {
    console.error('Error deleting course:', error);
    return NextResponse.json(
      { error: 'Failed to delete course' },
      { status: 500 }
    );
  }
}