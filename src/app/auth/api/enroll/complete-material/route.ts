import { NextResponse } from 'next/server';
import Enrollment from '../../../../model/Enrollment';
import Course from '../../../../model/Course';
import connectDB from '../../../../lib/db';

export async function POST(request: Request) {
  try {
    await connectDB();

    const { enrollmentId, materialId, courseId } = await request.json();

    if (!enrollmentId || !materialId || !courseId) {
      return NextResponse.json(
        { error: 'Enrollment ID, Material ID, and Course ID are required' },
        { status: 400 }
      );
    }

    // Find enrollment
    const enrollment = await Enrollment.findById(enrollmentId);
    
    if (!enrollment) {
      return NextResponse.json(
        { error: 'Enrollment not found' },
        { status: 404 }
      );
    }

    // Get the course to know total materials
    const course = await Course.findById(courseId);
    const totalMaterials = course?.materials?.length || 0;

    // Check if material is already completed
    const alreadyCompleted = enrollment.completedMaterials?.some(
      (material: any) => material.materialId === materialId
    );

    if (alreadyCompleted) {
      return NextResponse.json(
        { error: 'Material already marked as completed' },
        { status: 400 }
      );
    }

    // Add material to completed materials
    enrollment.completedMaterials.push({
      materialId,
      completedAt: new Date()
    });

    // Calculate progress based on actual materials count
    const completedCount = enrollment.completedMaterials.length;
    enrollment.progress = totalMaterials > 0 
      ? Math.min(100, Math.round((completedCount / totalMaterials) * 100))
      : 0;
    
    // Mark course as completed if all materials are done
    if (totalMaterials > 0 && completedCount >= totalMaterials) {
      enrollment.completed = true;
      enrollment.completedAt = new Date();
    }

    enrollment.lastAccessed = new Date();
    await enrollment.save();

    return NextResponse.json({ 
      success: true, 
      enrollment,
      completedCount,
      totalMaterials,
      message: 'Material marked as completed' 
    });

  } catch (error) {
    console.error('Error completing material:', error);
    return NextResponse.json(
      { error: 'Failed to mark material as completed' },
      { status: 500 }
    );
  }
}