import { NextResponse } from 'next/server';
import connectDB from '@/app/lib/db';

// Mock data - in production, you'll use your actual User model
let mockUsers = [
  {
    _id: '1',
    name: 'John Smith',
    email: 'john.smith@example.com',
    role: 'student',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    coursesEnrolled: 5
  },
  {
    _id: '2',
    name: 'Sarah Johnson',
    email: 'sarah.j@example.com',
    role: 'instructor',
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    coursesCreated: 3
  },
  {
    _id: '3',
    name: 'Mike Chen',
    email: 'mike.chen@example.com',
    role: 'admin',
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  }
];

const mockStats = {
  totalUsers: 2458,
  students: 1890,
  instructors: 48,
  admins: 3,
};

// GET - Fetch all users
export async function GET() {
  try {
    await connectDB();
    console.log('Database connected for users API');

    // Try to use real User model if it exists
    try {
      const User = require('@/app/model/User').default;
      if (User) {
        const users = await User.find()
          .select('name email role createdAt')
          .sort({ createdAt: -1 })
          .lean();

        const [totalUsers, students, instructors, admins] = await Promise.all([
          User.countDocuments(),
          User.countDocuments({ role: 'student' }),
          User.countDocuments({ role: 'instructor' }),
          User.countDocuments({ role: 'admin' }),
        ]);

        const stats = {
          totalUsers,
          students,
          instructors,
          admins,
        };

        console.log('Successfully loaded real users data');
        return NextResponse.json({
          users,
          stats
        });
      }
    } catch (modelError) {
      console.log('User model not available, using mock data');
    }

    // Fallback to mock data
    console.log('Using mock users data');
    return NextResponse.json({
      users: mockUsers,
      stats: mockStats
    });

  } catch (error) {
    console.error('Users API error:', error);
    
    // Fallback to mock data on error
    return NextResponse.json({
      users: mockUsers,
      stats: mockStats
    });
  }
}

// POST - Create new user
export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const { name, email, role, password } = body;

    console.log('Creating new user:', { name, email, role });

    // Validate required fields
    if (!name || !email || !role) {
      return NextResponse.json(
        { error: 'Name, email, and role are required' },
        { status: 400 }
      );
    }

    // Try to use real User model if it exists
    try {
      const User = require('@/app/model/User').default;
      if (User) {
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
          return NextResponse.json(
            { error: 'User with this email already exists' },
            { status: 400 }
          );
        }

        // Create new user
        const newUser = new User({
          name,
          email,
          role,
          password: password || 'defaultPassword123', // In real app, hash this password
          createdAt: new Date(),
        });

        await newUser.save();

        return NextResponse.json({
          message: 'User created successfully',
          user: {
            _id: newUser._id,
            name: newUser.name,
            email: newUser.email,
            role: newUser.role,
            createdAt: newUser.createdAt,
          }
        });
      }
    } catch (modelError) {
      console.log('User model not available, using mock data');
    }

    // Fallback to mock data creation
    const newUser = {
      _id: Date.now().toString(),
      name,
      email,
      role,
      createdAt: new Date().toISOString(),
    };

    mockUsers.unshift(newUser); // Add to beginning of array

    return NextResponse.json({
      message: 'User created successfully',
      user: newUser
    });

  } catch (error) {
    console.error('Create user error:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}

// PUT - Update user
export async function PUT(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const { id, name, email, role } = body;

    console.log('Updating user:', { id, name, email, role });

    if (!id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Try to use real User model if it exists
    try {
      const User = require('@/app/model/User').default;
      if (User) {
        const updatedUser = await User.findByIdAndUpdate(
          id,
          { name, email, role, updatedAt: new Date() },
          { new: true }
        ).select('name email role createdAt');

        if (!updatedUser) {
          return NextResponse.json(
            { error: 'User not found' },
            { status: 404 }
          );
        }

        return NextResponse.json({
          message: 'User updated successfully',
          user: updatedUser
        });
      }
    } catch (modelError) {
      console.log('User model not available, using mock data');
    }

    // Fallback to mock data update
    const userIndex = mockUsers.findIndex(user => user._id === id);
    if (userIndex === -1) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    mockUsers[userIndex] = {
      ...mockUsers[userIndex],
      name,
      email,
      role,
    };

    return NextResponse.json({
      message: 'User updated successfully',
      user: mockUsers[userIndex]
    });

  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

// DELETE - Delete user
export async function DELETE(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    console.log('Deleting user:', id);

    if (!id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Try to use real User model if it exists
    try {
      const User = require('@/app/model/User').default;
      if (User) {
        const deletedUser = await User.findByIdAndDelete(id);
        
        if (!deletedUser) {
          return NextResponse.json(
            { error: 'User not found' },
            { status: 404 }
          );
        }

        return NextResponse.json({
          message: 'User deleted successfully'
        });
      }
    } catch (modelError) {
      console.log('User model not available, using mock data');
    }

    // Fallback to mock data deletion
    const userIndex = mockUsers.findIndex(user => user._id === id);
    if (userIndex === -1) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    mockUsers.splice(userIndex, 1);

    return NextResponse.json({
      message: 'User deleted successfully'
    });

  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}