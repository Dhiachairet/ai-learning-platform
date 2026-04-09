// app/dashboard/admin/api/courses/route.ts
import { NextResponse } from 'next/server';
import connectDB from '@/app/lib/db';
import Course from '@/app/model/Course';
import User from '@/app/model/User';

// GET - Fetch all courses
export async function GET() {
  try {
    await connectDB();
    console.log('Database connected for admin courses API');

    const courses = await Course.find()
      .populate('instructor', 'name email')
      .select('title description instructor category level studentsEnrolled rating status createdAt updatedAt materials thumbnail quizzes')
      .sort({ createdAt: -1 })
      .lean();

    // Get instructors for the form dropdown
    const instructors = await User.find({ role: 'instructor' })
      .select('name email')
      .lean();

    // Calculate stats based on your Course model schema
    const [totalCourses, pendingCourses, approvedCourses, rejectedCourses, reportedCourses] = await Promise.all([
      Course.countDocuments(),
      Course.countDocuments({ status: 'pending' }),
      Course.countDocuments({ status: 'approved' }),
      Course.countDocuments({ status: 'rejected' }),
      Course.countDocuments({ status: 'reported' }),
    ]);

    // Calculate total enrollments by summing students array lengths
    const enrollmentAggregation = await Course.aggregate([
      {
        $project: {
          studentsCount: { $size: { $ifNull: ['$students', []] } }
        }
      },
      {
        $group: {
          _id: null,
          totalEnrollments: { $sum: '$studentsCount' }
        }
      }
    ]);

    const totalEnrollments = enrollmentAggregation[0]?.totalEnrollments || 0;

    const stats = {
      totalCourses,
      pendingCourses,
      approvedCourses,
      rejectedCourses,
      reportedCourses,
      totalEnrollments
    };

    console.log(`Successfully loaded ${courses.length} courses with quizzes`);

    // Ensure quizzes field exists for all courses
    const coursesWithQuizzes = courses.map((course: any) => ({
      ...course,
      materials: course.materials || [],
      quizzes: course.quizzes || [], // Ensure quizzes array exists
      studentsEnrolled: course.students ? course.students.length : 0
    }));

    return NextResponse.json({
      courses: coursesWithQuizzes,
      stats,
      instructors
    });

  } catch (error) {
    console.error('Admin courses API error:', error);
    
    return NextResponse.json(
      { error: 'Failed to load courses data' },
      { status: 500 }
    );
  }
}

// POST - Create new course (Not used by admin, but kept for compatibility)
export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const { title, description, instructorId, category, level, status, materials, quizzes } = body;

    console.log('Creating new course:', { title, category, level });

    // Validate required fields
    if (!title || !description || !instructorId || !category) {
      return NextResponse.json(
        { error: 'Title, description, instructor, and category are required' },
        { status: 400 }
      );
    }

    // Check if instructor exists
    const instructor = await User.findById(instructorId);
    if (!instructor) {
      return NextResponse.json(
        { error: 'Instructor not found' },
        { status: 400 }
      );
    }

    // Create new course - include materials and quizzes if provided
    const newCourse = new Course({
      title,
      description,
      instructor: instructorId,
      category,
      level: level || 'beginner',
      students: [],
      studentsEnrolled: 0,
      rating: 0,
      status: status || 'pending',
      materials: materials || [],
      quizzes: quizzes || [], // Include quizzes
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await newCourse.save();

    // Populate the instructor data for response
    await newCourse.populate('instructor', 'name email');

    return NextResponse.json({
      message: 'Course created successfully',
      course: newCourse
    });

  } catch (error) {
    console.error('Create course error:', error);
    return NextResponse.json(
      { error: 'Failed to create course' },
      { status: 500 }
    );
  }
}

// PUT - Update course (Used for approval/rejection and updates)
export async function PUT(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const { id, title, description, instructorId, category, level, status, materials, quizzes } = body;

    console.log('Updating course:', { id, status });

    if (!id) {
      return NextResponse.json(
        { error: 'Course ID is required' },
        { status: 400 }
      );
    }

    // Check if instructor exists if provided
    if (instructorId) {
      const instructor = await User.findById(instructorId);
      if (!instructor) {
        return NextResponse.json(
          { error: 'Instructor not found' },
          { status: 400 }
        );
      }
    }

    // Build update object - include materials and quizzes if provided
    const updateData: any = {
      updatedAt: new Date()
    };

    // Only update fields that are provided
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (instructorId !== undefined) updateData.instructor = instructorId;
    if (category !== undefined) updateData.category = category;
    if (level !== undefined) updateData.level = level;
    if (status !== undefined) updateData.status = status;
    if (materials !== undefined) updateData.materials = materials;
    if (quizzes !== undefined) updateData.quizzes = quizzes; // Include quizzes update

    const updatedCourse = await Course.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).populate('instructor', 'name email');

    if (!updatedCourse) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: `Course ${status === 'approved' ? 'approved' : status === 'rejected' ? 'rejected' : 'updated'} successfully`,
      course: updatedCourse
    });

  } catch (error) {
    console.error('Update course error:', error);
    return NextResponse.json(
      { error: 'Failed to update course' },
      { status: 500 }
    );
  }
}

// DELETE - Delete course
export async function DELETE(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    console.log('Deleting course:', id);

    if (!id) {
      return NextResponse.json(
        { error: 'Course ID is required' },
        { status: 400 }
      );
    }

    const deletedCourse = await Course.findByIdAndDelete(id);
    
    if (!deletedCourse) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Course deleted successfully'
    });

  } catch (error) {
    console.error('Delete course error:', error);
    return NextResponse.json(
      { error: 'Failed to delete course' },
      { status: 500 }
    );
  }
}