import { NextResponse } from 'next/server';
import connectDB from '@/app/lib/db';
import QuizAttempt from '@/app/model/QuizAttempt';
import Enrollment from '@/app/model/Enrollment'; // ADD THIS IMPORT

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const { studentId, courseId, answers, score, totalQuestions, passed } = body;

    console.log('Saving quiz attempt:', { studentId, courseId, score, passed });

    // Create quiz attempt
    const quizAttempt = new QuizAttempt({
      studentId,
      courseId,
      answers,
      score,
      totalQuestions,
      passed,
      completedAt: new Date()
    });

    await quizAttempt.save();

    // ALSO UPDATE THE ENROLLMENT RECORD
    const enrollment = await Enrollment.findOne({
      student: studentId,
      course: courseId
    });

    if (enrollment) {
      // Update quiz fields in enrollment
      enrollment.quizPassed = passed;
      enrollment.quizScore = score;
      
      // If quiz passed, mark course as completed
      if (passed) {
        enrollment.completed = true;
        enrollment.completedAt = new Date();
        enrollment.progress = 100;
         try {
          await fetch(
            `${process.env.NEXTAUTH_URL}/auth/api/certificate/generate`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                enrollmentId: enrollment._id,
                studentId,
                courseId
              }),
            }
          );
        } catch (error) {
          console.error('Certificate generation failed:', error);
          // IMPORTANT: do NOT throw → keep old behavior
        }
      }
      
      
      await enrollment.save();
    }

    return NextResponse.json({
      message: 'Quiz submitted successfully',
      quizAttempt,
      enrollment // Return updated enrollment
    });

  } catch (error) {
    console.error('Quiz submission error:', error);
    return NextResponse.json(
      { error: 'Failed to submit quiz' },
      { status: 500 }
    );
  }
}