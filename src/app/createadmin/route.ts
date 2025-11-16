import connectDB from '../lib/db';
import User from '../model/User';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    await connectDB();

    // Delete existing admin
    await User.deleteOne({ email: 'admin@learnaihub.com' });

    // Test the password hashing
    const testPassword = 'admin';
    const hashedPassword = await bcrypt.hash(testPassword, 10);
    
    console.log('Original password:', testPassword);
    console.log('Hashed password:', hashedPassword);
    
    // Test if we can verify it
    const canVerify = await bcrypt.compare(testPassword, hashedPassword);
    console.log('Can verify password:', canVerify);

    const adminUser = new User({
      name: 'Platform Admin',
      email: 'admin@learnaihub.com',
      password: hashedPassword,
      role: 'admin',
      educationLevel: '',
      expertiseArea: [],
    });

    await adminUser.save();

    // Test the saved user's password
    const savedUser = await User.findOne({ email: 'admin@learnaihub.com' });
    const savedPasswordWorks = await bcrypt.compare(testPassword, savedUser.password);
    console.log('Saved password works:', savedPasswordWorks);

    return NextResponse.json({ 
      message: 'Admin user created successfully!',
      debug: {
        originalPassword: testPassword,
        hashWorks: canVerify,
        savedHashWorks: savedPasswordWorks
      },
      credentials: {
        email: 'admin@learnaihub.com',
        password: 'admin123'
      }
    });

  } catch (error: any) {
    console.error('Admin creation error:', error);
    return NextResponse.json({ 
      message: 'Error creating admin user',
      error: error.message 
    }, { status: 500 });
  }
}