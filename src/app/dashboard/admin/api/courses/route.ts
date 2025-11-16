// app/dashboard/admin/api/courses/route.ts

import { NextResponse } from 'next/server';
import connectDB from '@/app/lib/db';

// Mock data - in production, you'll use your actual Course model
let mockCourses = [
  {
    _id: '1',
    title: 'Introduction to React',
    description: 'Learn the fundamentals of React and build your first application',
    instructor: {
      _id: '2',
      name: 'Sarah Johnson',
      email: 'sarah.j@example.com'
    },
    category: 'Programming',
    price: 49.99,
    level: 'beginner',
    duration: 15,
    studentsEnrolled: 1245,
    rating: 4.7,
    status: 'approved',
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: '2',
    title: 'Advanced Machine Learning',
    description: 'Deep dive into machine learning algorithms and neural networks',
    instructor: {
      _id: '5',
      name: 'Dr. Robert Wilson',
      email: 'robert.w@example.com'
    },
    category: 'Data Science',
    price: 99.99,
    level: 'advanced',
    duration: 40,
    studentsEnrolled: 567,
    rating: 4.9,
    status: 'approved',
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: '3',
    title: 'Web Design Fundamentals',
    description: 'Master the principles of modern web design and UX',
    instructor: {
      _id: '2',
      name: 'Sarah Johnson',
      email: 'sarah.j@example.com'
    },
    category: 'Design',
    price: 29.99,
    level: 'beginner',
    duration: 12,
    studentsEnrolled: 0,
    rating: 0,
    status: 'pending',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: '4',
    title: 'Node.js Backend Development',
    description: 'Build scalable backend applications with Node.js and Express',
    instructor: {
      _id: '5',
      name: 'Dr. Robert Wilson',
      email: 'robert.w@example.com'
    },
    category: 'Programming',
    price: 79.99,
    level: 'intermediate',
    duration: 25,
    studentsEnrolled: 892,
    rating: 4.6,
    status: 'approved',
    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: '5',
    title: 'Mobile App Development with Flutter',
    description: 'Create cross-platform mobile applications using Flutter',
    instructor: {
      _id: '2',
      name: 'Sarah Johnson',
      email: 'sarah.j@example.com'
    },
    category: 'Mobile Development',
    price: 69.99,
    level: 'intermediate',
    duration: 30,
    studentsEnrolled: 0,
    rating: 0,
    status: 'rejected',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: '6',
    title: 'Ethical Hacking Basics',
    description: 'Learn the fundamentals of cybersecurity and ethical hacking',
    instructor: {
      _id: '5',
      name: 'Dr. Robert Wilson',
      email: 'robert.w@example.com'
    },
    category: 'Security',
    price: 89.99,
    level: 'intermediate',
    duration: 35,
    studentsEnrolled: 0,
    rating: 0,
    status: 'reported',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const mockStats = {
  totalCourses: 156,
  pendingCourses: 12,
  approvedCourses: 128,
  rejectedCourses: 8,
  reportedCourses: 8,
  totalEnrollments: 45890,
};

const mockInstructors = [
  { _id: '2', name: 'Sarah Johnson', email: 'sarah.j@example.com' },
  { _id: '5', name: 'Dr. Robert Wilson', email: 'robert.w@example.com' },
];

// GET - Fetch all courses
export async function GET() {
  try {
    await connectDB();
    console.log('Database connected for courses API');

    // Try to use real Course model if it exists
    try {
      const Course = require('@/app/model/Course').default;
      const User = require('@/app/model/User').default;
      
      if (Course && User) {
        const courses = await Course.find()
          .populate('instructor', 'name email')
          .select('title description instructor category price status createdAt updatedAt')
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

        // For enrollment stats, you might need to calculate from enrollments collection
        // For now, using mock data for enrollments
        const totalEnrollments = 45890; // This would come from enrollments collection

        const stats = {
          totalCourses,
          pendingCourses,
          approvedCourses,
          rejectedCourses,
          reportedCourses,
          totalEnrollments
        };

        console.log('Successfully loaded real courses data');
        
        // Add mock fields for frontend compatibility
        const coursesWithMockFields = courses.map((course: { price: any; }) => ({
          ...course,
          level: 'beginner', // Mock field
          duration: 10, // Mock field
          studentsEnrolled: 0, // Mock field
          rating: 0, // Mock field
          price: course.price || 0 // Ensure price exists
        }));

        return NextResponse.json({
          courses: coursesWithMockFields,
          stats,
          instructors
        });
      }
    } catch (modelError) {
      console.log('Course model not available, using mock data');
    }

    // Fallback to mock data
    console.log('Using mock courses data');
    return NextResponse.json({
      courses: mockCourses,
      stats: mockStats,
      instructors: mockInstructors
    });

  } catch (error) {
    console.error('Courses API error:', error);
    
    // Fallback to mock data on error
    return NextResponse.json({
      courses: mockCourses,
      stats: mockStats,
      instructors: mockInstructors
    });
  }
}

// POST - Create new course (Not used by admin, but kept for compatibility)
export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const { title, description, instructorId, category, price, level, duration, status } = body;

    console.log('Creating new course:', { title, category, level });

    // Validate required fields
    if (!title || !description || !instructorId || !category) {
      return NextResponse.json(
        { error: 'Title, description, instructor, and category are required' },
        { status: 400 }
      );
    }

    // Try to use real Course model if it exists
    try {
      const Course = require('@/app/model/Course').default;
      const User = require('@/app/model/User').default;
      
      if (Course && User) {
        // Check if instructor exists
        const instructor = await User.findById(instructorId);
        if (!instructor) {
          return NextResponse.json(
            { error: 'Instructor not found' },
            { status: 400 }
          );
        }

        // Create new course - only include fields that exist in your schema
        const newCourse = new Course({
          title,
          description,
          instructor: instructorId,
          category,
          price: price || 0,
          status: status || 'pending', // Default to pending for admin review
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        await newCourse.save();

        // Populate the instructor data for response
        await newCourse.populate('instructor', 'name email');

        // Return course with additional mock fields for frontend compatibility
        const courseWithMockFields = {
          ...newCourse.toObject(),
          level: level || 'beginner',
          duration: duration || 10,
          studentsEnrolled: 0,
          rating: 0
        };

        return NextResponse.json({
          message: 'Course created successfully',
          course: courseWithMockFields
        });
      }
    } catch (modelError) {
      console.log('Course model not available, using mock data');
    }

    // Fallback to mock data creation
    const instructor = mockInstructors.find(inst => inst._id === instructorId);
    if (!instructor) {
      return NextResponse.json(
        { error: 'Instructor not found' },
        { status: 400 }
      );
    }

    const newCourse = {
      _id: Date.now().toString(),
      title,
      description,
      instructor: {
        _id: instructor._id,
        name: instructor.name,
        email: instructor.email
      },
      category,
      price: price || 0,
      level: level || 'beginner',
      duration: duration || 10,
      studentsEnrolled: 0,
      rating: 0,
      status: status || 'pending', // Default to pending for admin review
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockCourses.unshift(newCourse); // Add to beginning of array

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

// PUT - Update course (Used for approval/rejection)
export async function PUT(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const { id, title, description, instructorId, category, price, level, duration, status } = body;

    console.log('Updating course:', { id, status });

    if (!id) {
      return NextResponse.json(
        { error: 'Course ID is required' },
        { status: 400 }
      );
    }

    // Try to use real Course model if it exists
    try {
      const Course = require('@/app/model/Course').default;
      const User = require('@/app/model/User').default;
      
      if (Course && User) {
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

        // Build update object - only update provided fields
        const updateData: any = {
          updatedAt: new Date()
        };

        // Only update fields that are provided
        if (title !== undefined) updateData.title = title;
        if (description !== undefined) updateData.description = description;
        if (instructorId !== undefined) updateData.instructor = instructorId;
        if (category !== undefined) updateData.category = category;
        if (price !== undefined) updateData.price = price;
        if (status !== undefined) updateData.status = status;

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

        // Return course with additional mock fields for frontend compatibility
        const courseWithMockFields = {
          ...updatedCourse.toObject(),
          level: level || 'beginner',
          duration: duration || 10,
          studentsEnrolled: 0,
          rating: 0
        };

        return NextResponse.json({
          message: `Course ${status === 'approved' ? 'approved' : status === 'rejected' ? 'rejected' : 'updated'} successfully`,
          course: courseWithMockFields
        });
      }
    } catch (modelError) {
      console.log('Course model not available, using mock data');
    }

    // Fallback to mock data update
    const courseIndex = mockCourses.findIndex(course => course._id === id);
    if (courseIndex === -1) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    let instructor = mockCourses[courseIndex].instructor;
    if (instructorId && instructorId !== instructor._id) {
      const newInstructor = mockInstructors.find(inst => inst._id === instructorId);
      if (newInstructor) {
        instructor = {
          _id: newInstructor._id,
          name: newInstructor.name,
          email: newInstructor.email
        };
      }
    }

    mockCourses[courseIndex] = {
      ...mockCourses[courseIndex],
      title: title || mockCourses[courseIndex].title,
      description: description || mockCourses[courseIndex].description,
      instructor,
      category: category || mockCourses[courseIndex].category,
      price: price !== undefined ? price : mockCourses[courseIndex].price,
      level: level || mockCourses[courseIndex].level,
      duration: duration || mockCourses[courseIndex].duration,
      status: status || mockCourses[courseIndex].status,
      updatedAt: new Date().toISOString()
    };

    return NextResponse.json({
      message: `Course ${status === 'approved' ? 'approved' : status === 'rejected' ? 'rejected' : 'updated'} successfully`,
      course: mockCourses[courseIndex]
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

    // Try to use real Course model if it exists
    try {
      const Course = require('@/app/model/Course').default;
      if (Course) {
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
      }
    } catch (modelError) {
      console.log('Course model not available, using mock data');
    }

    // Fallback to mock data deletion
    const courseIndex = mockCourses.findIndex(course => course._id === id);
    if (courseIndex === -1) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    mockCourses.splice(courseIndex, 1);

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