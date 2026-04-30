'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import CertificateViewer from '../../components/Certificate';
import Image from 'next/image';
import {
  PlayIcon,
  ClockIcon,
  UserGroupIcon,
  StarIcon,
  BookOpenIcon,
  DocumentIcon,
  PhotoIcon,
  FilmIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  AcademicCapIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import Navbar from '../../components/Navbar';

interface CourseMaterial {
  type: 'pdf' | 'image' | 'youtube';
  url: string;
  title: string;
  description: string;
  _id?: string;
}

interface Course {
  _id: string;
  title: string;
  description: string;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  status: "draft" | "pending" | "approved" | "rejected" | "reported";
  
  createdAt: string;
  updatedAt: string;
  thumbnail?: string;
  materials: CourseMaterial[];
  instructor: {
    _id: string;
    name: string;
    email: string;
  };
  quizzes?: QuizQuestion[];
}

interface Enrollment {
  _id: string;
  student: string;
  course: string;
  enrolledAt: string;
  progress: number;
  completed: boolean;
  completedAt?: string;
  lastAccessed: string;
  completedMaterials: Array<{
    materialId: string;
    completedAt: string;
  }>;
}

interface CurrentUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface QuizQuestion {
  _id?: string;
  question: string;
  options: string[];
  correctAnswer: number;
}

interface QuizAttempt {
  _id?: string;
  studentId: string;
  courseId: string;
  answers: {
    questionIndex: number;
    selectedAnswer: number;
    isCorrect: boolean;
  }[];
  score: number;
  totalQuestions: number;
  passed: boolean;
  completedAt: string;
}

// YouTube Embed Component
const YouTubeEmbed = ({ url, title }: { url: string; title: string }) => {
  const getYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const videoId = getYouTubeId(url);

  if (!videoId) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-800">Invalid YouTube URL</p>
      </div>
    );
  }

  return (
    <div className="mt-4">
      <div className="aspect-video rounded-lg overflow-hidden bg-black">
        <iframe
          width="100%"
          height="100%"
          src={`https://www.youtube.com/embed/${videoId}`}
          title={title}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="w-full h-full"
        ></iframe>
      </div>
      <p className="text-xs text-gray-500 mt-2">
        YouTube video embedded. You can watch it directly here.
      </p>
    </div>
  );
};

export default function CourseDetails() {
  const params = useParams();
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [completingMaterial, setCompletingMaterial] = useState<string | null>(null);
  const [expandedYouTube, setExpandedYouTube] = useState<string | null>(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [isQuizLoading, setIsQuizLoading] = useState(false);
  const [quizAttempt, setQuizAttempt] = useState<QuizAttempt | null>(null);
  const [showQuizResults, setShowQuizResults] = useState(false);
  const [reviewingAnswers, setReviewingAnswers] = useState(false);
  const [hasPassedQuiz, setHasPassedQuiz] = useState<boolean>(false);
  const [quizAttempts, setQuizAttempts] = useState<QuizAttempt[]>([]);
  const [showCertificate, setShowCertificate] = useState(false);
  const [certificateData, setCertificateData] = useState<any>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Calculate derived states
  const quizCompleted = quizAttempts.length > 0;
  const latestQuizAttempt = quizAttempts[0];
  const showQuizButton = isEnrolled && 
                        enrollment && 
                        course?.materials && 
                        enrollment.completedMaterials?.length === course.materials.length && 
                        course.materials.length > 0 && 
                        !enrollment.completed;

  const showStatusMessage = (message: string, type: 'success' | 'error') => {
    setStatusMessage({ message, type });
    setTimeout(() => setStatusMessage(null), 3000);
  };

  // Get current user from localStorage
  useEffect(() => {
    const getUserFromToken = () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const payload = JSON.parse(atob(token.split('.')[1]));
          return {
            id: payload.userId || payload.id || payload._id,
            name: payload.name,
            email: payload.email,
            role: payload.role
          };
        }
      } catch (error) {
        console.error('Error parsing token:', error);
      }
      return null;
    };

    const user = getUserFromToken();
    setCurrentUser(user);
  }, []);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/auth/api/courses/${params.id}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch course');
        }
        
        const data = await response.json();
        
        setCourse(data.course);

        if (data.course.quizzes) {
          setQuizQuestions(data.course.quizzes);
        }
      } catch (error) {
        console.error('Error fetching course:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      fetchCourse();
    }
  }, [params.id]);
const fetchCertificate = async () => {
  if (!enrollment || !currentUser || !course) return;
  
  try {
    // First try to get existing certificate
    const response = await fetch(`/api/certificate?enrollmentId=${enrollment._id}`);
    
    if (response.ok) {
      const data = await response.json();
      
      if (data.certificates && data.certificates.length > 0) {
        setCertificateData(data.certificates[0]);
        setShowCertificate(true);
        return;
      }
    }
    
    // If no certificate exists, generate one
    const generateResponse = await fetch('/api/certificate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        enrollmentId: enrollment._id,
        studentId: currentUser.id,
        courseId: course._id
      }),
    });
    
    if (generateResponse.ok) {
      const generateData = await generateResponse.json();
      setCertificateData(generateData.certificate);
      setShowCertificate(true);
    } else {
      // If API fails, use mock data with real user info
      const mockCertificate = {
        _id: Date.now().toString(),
        certificateId: `CERT-${Date.now().toString().slice(-8)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
        studentName: currentUser.name,
        courseName: course.title,
        instructorName: course.instructor.name,
        issueDate: new Date().toISOString(),
        completionDate: enrollment.completedAt || new Date().toISOString(),
        metadata: {
          level: course.level,
          category: course.category,
          
        }
      };
      
      setCertificateData(mockCertificate);
      setShowCertificate(true);
    }
    
  } catch (error) {
    console.error('Error fetching certificate:', error);
    // Fallback to mock data with real info
    const mockCertificate = {
      _id: Date.now().toString(),
      certificateId: `CERT-${Date.now().toString().slice(-8)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      studentName: currentUser.name,
      courseName: course.title,
      instructorName: course.instructor.name,
      issueDate: new Date().toISOString(),
      completionDate: enrollment.completedAt || new Date().toISOString(),
      metadata: {
        level: course.level,
        category: course.category,
       
      }
    };
    
    setCertificateData(mockCertificate);
    setShowCertificate(true);
  }
};
  const checkEnrollmentStatus = async () => {
    if (!course || !currentUser) return;
    
    try {
      const response = await fetch(`/auth/api/enroll/check?courseId=${course._id}&studentId=${currentUser.id}`);
      const data = await response.json();
      
      setIsEnrolled(data.isEnrolled);
      setEnrollment(data.enrollment);
      setQuizAttempts(data.quizAttempts || []);
      
      if (data.quizAttempts && data.quizAttempts.length > 0) {
        const latest = data.quizAttempts[0];
        setHasPassedQuiz(latest.passed);
      }
    } catch (error) {
      console.error('Error checking enrollment:', error);
    }
  };

  useEffect(() => {
    checkEnrollmentStatus();
  }, [course, currentUser]);

  const handleEnroll = async () => {
    try {
      if (!currentUser) {
        router.push('/auth/signin');
        return;
      }

      if (!course) return;

      setIsEnrolling(true);
      
      const response = await fetch('/auth/api/enroll', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          courseId: course._id,
          studentId: currentUser.id
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to enroll');
      }

      setIsEnrolled(true);
      setEnrollment(data.enrollment);
      showStatusMessage('Successfully enrolled in the course!', 'success');
      
    } catch (error) {
      console.error('Enrollment error:', error);
      showStatusMessage(error instanceof Error ? error.message : 'Failed to enroll in the course', 'error');
    } finally {
      setIsEnrolling(false);
    }
  };

  const handleMarkAsDone = async (material: CourseMaterial) => {
    if (!currentUser || !enrollment || !course) return;

    try {
      setCompletingMaterial(material.title);

      const response = await fetch('/auth/api/enroll/complete-material', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          enrollmentId: enrollment._id,
          materialId: material._id || material.title,
          courseId: course._id
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to mark as done');
      }

      setEnrollment(data.enrollment);
      
    } catch (error) {
      console.error('Error marking material as done:', error);
      showStatusMessage('Failed to mark material as completed', 'error');
    } finally {
      setCompletingMaterial(null);
    }
  };

  const toggleYouTube = (materialTitle: string) => {
    setExpandedYouTube(expandedYouTube === materialTitle ? null : materialTitle);
  };

  const isMaterialCompleted = (material: CourseMaterial) => {
    if (!enrollment?.completedMaterials) return false;
    return enrollment.completedMaterials.some(
      completed => completed.materialId === (material._id || material.title)
    );
  };

  const getMaterialIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <DocumentIcon className="h-6 w-6 text-red-500" />;
      case 'image':
        return <PhotoIcon className="h-6 w-6 text-green-500" />;
      case 'youtube':
        return <FilmIcon className="h-6 w-6 text-red-600" />;
      default:
        return <DocumentIcon className="h-6 w-6 text-gray-500" />;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "beginner":
        return "bg-emerald-100 text-emerald-800";
      case "intermediate":
        return "bg-yellow-100 text-yellow-800";
      case "advanced":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleTakeQuiz = () => {
    if (!quizQuestions || quizQuestions.length === 0) {
      showStatusMessage('No quiz questions available for this course.', 'error');
      return;
    }
    
    setSelectedAnswers([]);
    setCurrentQuestionIndex(0);
    setQuizScore(null);
    setQuizAttempt(null);
    setShowQuizResults(false);
    setReviewingAnswers(false);
    setShowQuiz(true);
  };

  const QuizComponent = () => {
    const currentQuestion = quizQuestions[currentQuestionIndex];
    const totalQuestions = quizQuestions.length;

    if (reviewingAnswers && quizAttempt) {
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Quiz Review</h2>
                  <p className="text-gray-600">Your answers and results</p>
                </div>
                <button
                  onClick={() => {
                    setReviewingAnswers(false);
                    setShowQuizResults(true);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-full transition"
                >
                  <XMarkIcon className="h-6 w-6 text-gray-500" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {quizQuestions.map((question, index) => {
                const userAnswer = selectedAnswers[index];
                const isCorrect = userAnswer === question.correctAnswer;
                
                return (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start mb-3">
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                        isCorrect ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                        <span className={`text-sm font-semibold ${
                          isCorrect ? 'text-green-800' : 'text-red-800'
                        }`}>
                          {index + 1}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 mb-2">{question.question}</h3>
                        <div className="space-y-2">
                          {question.options.map((option, optIndex) => (
                            <div
                              key={optIndex}
                              className={`p-2 rounded ${
                                optIndex === question.correctAnswer
                                  ? 'bg-green-50 border border-green-200'
                                  : optIndex === userAnswer && !isCorrect
                                  ? 'bg-red-50 border border-red-200'
                                  : 'bg-gray-50 border border-gray-200'
                              }`}
                            >
                              <div className="flex items-center">
                                <div className={`w-3 h-3 rounded-full mr-2 ${
                                  optIndex === question.correctAnswer
                                    ? 'bg-green-500'
                                    : optIndex === userAnswer && !isCorrect
                                    ? 'bg-red-500'
                                    : 'bg-gray-300'
                                }`} />
                                <span className="text-gray-800">{option}</span>
                                {optIndex === question.correctAnswer && (
                                  <span className="ml-2 text-xs font-medium text-green-600">✓ Correct Answer</span>
                                )}
                                {optIndex === userAnswer && !isCorrect && (
                                  <span className="ml-2 text-xs font-medium text-red-600">✗ Your Answer</span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      );
    }

    const handleAnswerSelect = (optionIndex: number) => {
      if (reviewingAnswers) return;
      const newAnswers = [...selectedAnswers];
      newAnswers[currentQuestionIndex] = optionIndex;
      setSelectedAnswers(newAnswers);
    };

    const handleNextQuestion = () => {
      if (currentQuestionIndex < totalQuestions - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
        submitQuiz();
      }
    };

    const handlePreviousQuestion = () => {
      if (currentQuestionIndex > 0) {
        setCurrentQuestionIndex(currentQuestionIndex - 1);
      }
    };

    const submitQuiz = async () => {
      if (!currentUser || !course) return;

      try {
        setIsQuizLoading(true);
        
        let score = 0;
        const answers = quizQuestions.map((question, index) => {
          const isCorrect = question.correctAnswer === selectedAnswers[index];
          if (isCorrect) score++;
          return {
            questionIndex: index,
            selectedAnswer: selectedAnswers[index] || -1,
            isCorrect
          };
        });

        const passed = score >= Math.ceil(totalQuestions * 0.7);

        const quizData = {
          studentId: currentUser.id,
          courseId: course._id,
          answers: answers,
          score: score,
          totalQuestions: totalQuestions,
          passed: passed,
          completedAt: new Date().toISOString()
        };

        const response = await fetch('/auth/api/quiz/attempt', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(quizData),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to submit quiz');
        }

        setQuizAttempt(data.quizAttempt);
        setQuizScore(score);
        setShowQuizResults(true);
        
        // Add the new quiz attempt to the list
        setQuizAttempts(prev => [data.quizAttempt, ...prev]);
        setHasPassedQuiz(passed);
        
        // If passed, mark course as completed
        if (passed && enrollment) {
          try {
            const updateResponse = await fetch('/auth/api/enroll/complete', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                enrollmentId: enrollment._id,
                courseId: course._id
              }),
            });

            const updateData = await updateResponse.json();
            if (updateResponse.ok && updateData.enrollment) {
              setEnrollment(updateData.enrollment);
            }
          } catch (updateError) {
            console.error('Error updating enrollment:', updateError);
          }
        }
      } catch (error) {
        console.error('Quiz submission error:', error);
        showStatusMessage('Failed to submit quiz. Please try again.', 'error');
      } finally {
        setIsQuizLoading(false);
      }
    };

    const resetQuiz = () => {
      setSelectedAnswers([]);
      setCurrentQuestionIndex(0);
      setQuizScore(null);
      setQuizAttempt(null);
      setShowQuizResults(false);
      setShowQuiz(false);
      setReviewingAnswers(false);
    };

    if (showQuizResults && quizAttempt) {
      const hasPassed = quizAttempt.passed;
      
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="text-center mb-8">
                <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 ${
                  hasPassed ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  {hasPassed ? (
                    <CheckCircleIcon className="h-10 w-10 text-green-600" />
                  ) : (
                    <ExclamationTriangleIcon className="h-10 w-10 text-red-600" />
                  )}
                </div>
                
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {hasPassed ? 'Congratulations!' : 'Quiz Complete'}
                </h2>
                <p className="text-gray-600 mb-6">
                  {hasPassed 
                    ? `You passed the quiz with a score of ${quizScore}/${totalQuestions}!`
                    : `Your score is ${quizScore}/${totalQuestions}. You need ${Math.ceil(totalQuestions * 0.7)} to pass.`
                  }
                </p>

                {hasPassed && (
                  <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
                    <div className="flex items-center justify-center text-green-700 mb-2">
                      <CheckCircleIcon className="h-5 w-5 mr-2" />
                      <span className="font-semibold">Course Completed Successfully!</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      You have successfully completed all requirements for this course.
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-3 gap-4 mb-8">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{quizScore}</div>
                    <div className="text-sm text-blue-800">Your Score</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-gray-600">{totalQuestions}</div>
                    <div className="text-sm text-gray-800">Total Questions</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {Math.round((quizScore! / totalQuestions) * 100)}%
                    </div>
                    <div className="text-sm text-green-800">Percentage</div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setShowQuizResults(false);
                    setReviewingAnswers(true);
                  }}
                  className="w-full mb-4 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-semibold"
                >
                  Review Answers
                </button>

                <div className="flex space-x-4">
                  <button
                    onClick={() => {
                      resetQuiz();
                      checkEnrollmentStatus(); // Refresh enrollment status
                    }}
                    className="flex-1 px-6 py-3 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition font-medium"
                  >
                    {hasPassed ? 'Back to Dashboard' : 'Back to Course'}
                  </button>
                  {!hasPassed && (
                    <button
                      onClick={resetQuiz}
                      className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
                    >
                      Retake Quiz
                    </button>
                  )}
                </div>

                {hasPassed && (
                  <button
                    onClick={() => showStatusMessage('Certificate will be available soon!', 'success')}
                    className="w-full mt-4 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition font-semibold"
                  >
                    <div className="flex items-center justify-center">
                      <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Download Certificate
                    </div>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Course Quiz</h2>
                <p className="text-gray-600">Test your knowledge</p>
              </div>
              <button
                onClick={resetQuiz}
                className="p-2 hover:bg-gray-100 rounded-full transition"
              >
                <XMarkIcon className="h-6 w-6 text-gray-500" />
              </button>
            </div>
            
            <div className="mt-4">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Question {currentQuestionIndex + 1} of {totalQuestions}</span>
                <span>{Math.round(((currentQuestionIndex + 1) / totalQuestions) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="mb-8">
              <div className="text-sm font-semibold text-indigo-600 mb-2">
                Question {currentQuestionIndex + 1}
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                {currentQuestion.question}
              </h3>
            </div>

            <div className="space-y-3 mb-8">
              {currentQuestion.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  className={`w-full p-4 text-left rounded-lg border transition-all ${
                    selectedAnswers[currentQuestionIndex] === index
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center">
                    <div className={`flex-shrink-0 w-6 h-6 rounded-full border flex items-center justify-center mr-3 ${
                      selectedAnswers[currentQuestionIndex] === index
                        ? 'border-indigo-500 bg-indigo-500'
                        : 'border-gray-300'
                    }`}>
                      {selectedAnswers[currentQuestionIndex] === index && (
                        <div className="w-2 h-2 rounded-full bg-white"></div>
                      )}
                    </div>
                    <span className="text-gray-800">{option}</span>
                  </div>
                </button>
              ))}
            </div>

            <div className="flex justify-between">
              <button
                onClick={handlePreviousQuestion}
                disabled={currentQuestionIndex === 0}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Previous
              </button>
              
              <button
                onClick={handleNextQuestion}
                disabled={selectedAnswers[currentQuestionIndex] === undefined}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-semibold"
              >
                {currentQuestionIndex === totalQuestions - 1 ? 'Submit Quiz' : 'Next Question'}
              </button>
            </div>

            {isQuizLoading && (
              <div className="mt-4 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                <p className="text-gray-600 mt-2">Submitting quiz...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <Navbar />
        <div className="pt-20 lg:pt-24 flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <Navbar />
        <div className="pt-20 lg:pt-24 flex justify-center items-center min-h-screen">
          <div className="text-center">
            <BookOpenIcon className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Course Not Found</h2>
            <p className="text-gray-600 mb-4">The course you're looking for doesn't exist.</p>
            <button
              onClick={() => router.push('/courses')}
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition"
            >
              Back to Courses
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />

      <main className="pt-20 lg:pt-24">
        {statusMessage && (
          <div className="container mx-auto px-4 pb-2">
            <div
              className={`rounded-lg px-4 py-3 text-sm font-medium ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}
              role="status"
            >
              {statusMessage.message}
            </div>
          </div>
        )}
        <div className="container mx-auto px-4 py-6">
          <button
            onClick={() => router.push('/courses')}
            className="flex items-center text-indigo-600 hover:text-indigo-800 transition"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Back to Courses
          </button>
        </div>

        <section className="container mx-auto px-4">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-8">
              <div className="lg:col-span-2">
                <div className="flex flex-col lg:flex-row gap-6">
                  <div className="flex-shrink-0">
                    {course.thumbnail ? (
                      <Image
                        src={course.thumbnail}
                        alt={course.title}
                        width={300}
                        height={200}
                        className="rounded-lg object-cover w-full lg:w-80 h-48"
                      />
                    ) : (
                      <div className="w-full lg:w-80 h-48 bg-gray-300 rounded-lg flex items-center justify-center">
                        <BookOpenIcon className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getLevelColor(course.level)} mb-4`}>
                      {course.level.charAt(0).toUpperCase() + course.level.slice(1)}
                    </span>
                    
                    <h1 className="text-3xl font-bold text-gray-800 mb-4">{course.title}</h1>
                    <p className="text-gray-600 mb-6 leading-relaxed">{course.description}</p>

                    <div className="flex items-center space-x-6 text-sm text-gray-600">
                      
                      <div className="flex items-center">
                        <ClockIcon className="h-5 w-5 mr-2 text-gray-400" />
                        <span>Self-paced</span>
                      </div>
                      <div className="flex items-center">
                        <BookOpenIcon className="h-5 w-5 mr-2 text-gray-400" />
                        <span>{course.category}</span>
                      </div>
                    </div>

                    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                      <h3 className="font-semibold text-gray-800 mb-2">Instructor</h3>
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {course.instructor.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')}
                        </div>
                        <div className="ml-3">
                          <p className="font-medium text-gray-800">{course.instructor.name}</p>
                          <p className="text-sm text-gray-600">{course.instructor.email}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-1">
                <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 sticky top-24">
                  <div className="text-center mb-6">
                    <div className="text-3xl font-bold text-gray-800 mb-2">Free</div>
                    <p className="text-gray-600">Lifetime access</p>
                  </div>

                  {!currentUser ? (
                    <button
                      onClick={() => router.push('/auth/signin')}
                      className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition flex items-center justify-center font-semibold"
                    >
                      <PlayIcon className="h-5 w-5 mr-2" />
                      Sign in to Enroll
                    </button>
                  ) : !isEnrolled ? (
                    <button
                      onClick={handleEnroll}
                      disabled={isEnrolling}
                      className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition flex items-center justify-center font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isEnrolling ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Enrolling...
                        </>
                      ) : (
                        <>
                          <PlayIcon className="h-5 w-5 mr-2" />
                          Enroll Now
                        </>
                      )}
                    </button>
                  ) : enrollment?.completed ? (
                    <button
                      onClick={() => router.push('/dashboard/student/mycourses')}
                      className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition flex items-center justify-center font-semibold"
                    >
                      <CheckCircleIcon className="h-5 w-5 mr-2" />
                      Course Completed ✓
                    </button>
                  ) : (
                    <button
                      onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}
                      className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition flex items-center justify-center font-semibold"
                    >
                      <PlayIcon className="h-5 w-5 mr-2" />
                      Continue Learning
                    </button>
                  )}

                  <div className="mt-4 space-y-2 text-sm text-gray-600">
                    <div className="flex items-center">
                      <CheckIcon className="h-4 w-4 mr-2 text-green-500" />
                      Full lifetime access
                    </div>
                    <div className="flex items-center">
                      <CheckIcon className="h-4 w-4 mr-2 text-green-500" />
                      Certificate of completion
                    </div>
                    <div className="flex items-center">
                      <CheckIcon className="h-4 w-4 mr-2 text-green-500" />
                      Access on mobile and desktop
                    </div>
                  </div>

                  {currentUser && isEnrolled && enrollment && (
                    <div className="mt-6 p-3 bg-blue-50 rounded-lg">
                      <div className="text-sm text-blue-800">
                        <div className="font-medium mb-1">Your Progress</div>
                        <div className="w-full bg-blue-200 rounded-full h-2 mb-1">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${enrollment.progress || 0}%` }}
                          ></div>
                        </div>
                        <div className="text-xs flex justify-between">
                          <span>{enrollment.progress || 0}% completed</span>
                          <span>{enrollment.completedMaterials?.length || 0}/{course.materials?.length || 0} materials</span>
                        </div>
                        
                        {quizCompleted && latestQuizAttempt && (
                          <div className="mt-2 p-2 rounded bg-green-50 border border-green-200">
                            <div className="flex items-center text-green-800">
                              <CheckCircleIcon className="h-4 w-4 mr-1" />
                              <span className="text-xs font-medium">
                                Quiz: {latestQuizAttempt.passed ? 'Passed' : 'Failed'} ({latestQuizAttempt.score}/{quizQuestions.length})
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {showQuizButton && !enrollment?.completed && (
                    <button
                      onClick={handleTakeQuiz}
                      className="w-full mt-4 bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition flex items-center justify-center font-semibold"
                    >
                      <AcademicCapIcon className="h-5 w-5 mr-2" />
                      {quizCompleted ? 'Retake Quiz' : 'Take Quiz'} ({quizQuestions.length} Questions)
                    </button>
                  )}

                  {enrollment?.completed && (
                    <button
                      onClick={fetchCertificate}
                      className="w-full mt-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-lg hover:from-blue-600 hover:to-purple-700 transition flex items-center justify-center font-semibold"
                    >
                      <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      View Certificate
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {isEnrolled ? (
          <section className="container mx-auto px-4 py-12">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Course Materials</h2>
                <div className="text-sm text-gray-600">
                  {enrollment?.completedMaterials?.length || 0} of {course.materials?.length || 0} completed
                </div>
              </div>
              
              {course.materials && course.materials.length > 0 ? (
                <div className="space-y-4">
                  {course.materials.map((material, index) => {
                    const completed = isMaterialCompleted(material);
                    const isYouTubeExpanded = expandedYouTube === material.title;
                    
                    return (
                      <div
                        key={index}
                        className={`p-4 rounded-lg border transition-colors ${
                          completed 
                            ? 'bg-green-50 border-green-200' 
                            : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4 flex-1">
                            <div className="relative">
                              {getMaterialIcon(material.type)}
                              {completed && (
                                <div className="absolute -top-1 -right-1">
                                  <CheckCircleIcon className="h-5 w-5 text-green-500" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-800">{material.title}</h3>
                              {material.description && (
                                <p className="text-sm text-gray-600 mt-1">{material.description}</p>
                              )}
                              <div className="text-xs text-blue-600 mt-1 flex items-center">
                                {material.type === 'youtube' ? (
                                  <>
                                    <FilmIcon className="h-3 w-3 mr-1" />
                                    YouTube Video
                                  </>
                                ) : material.type === 'pdf' ? (
                                  <>
                                    <DocumentIcon className="h-3 w-3 mr-1" />
                                    PDF Document
                                  </>
                                ) : (
                                  <>
                                    <PhotoIcon className="h-3 w-3 mr-1" />
                                    Image
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            {material.type === 'youtube' ? (
                              <button
                                onClick={() => toggleYouTube(material.title)}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm flex items-center"
                              >
                                {isYouTubeExpanded ? (
                                  <>
                                    <ChevronUpIcon className="h-4 w-4 mr-1" />
                                    Hide Video
                                  </>
                                ) : (
                                  <>
                                    <PlayIcon className="h-4 w-4 mr-1" />
                                    Watch
                                  </>
                                )}
                              </button>
                            ) : (
                              <button
                                onClick={() => window.open(material.url, '_blank')}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm flex items-center"
                              >
                                <DocumentIcon className="h-4 w-4 mr-1" />
                                View
                              </button>
                            )}
                            
                            {!completed ? (
                              <button
                                onClick={() => handleMarkAsDone(material)}
                                disabled={completingMaterial === material.title}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                              >
                                {completingMaterial === material.title ? (
                                  <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1"></div>
                                    Marking...
                                  </>
                                ) : (
                                  <>
                                    <CheckCircleIcon className="h-4 w-4 mr-1" />
                                    Mark as Done
                                  </>
                                )}
                              </button>
                            ) : (
                              <span className="px-4 py-2 bg-green-100 text-green-800 rounded-lg text-sm font-medium flex items-center">
                                <CheckCircleIcon className="h-4 w-4 mr-1" />
                                Completed
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {material.type === 'youtube' && isYouTubeExpanded && (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <YouTubeEmbed url={material.url} title={material.title} />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <DocumentIcon className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                  <p className="text-lg">No course materials available yet</p>
                  <p className="text-sm mt-1">Check back later for updated content</p>
                </div>
              )}
            </div>
          </section>
        ) : (
          <section className="container mx-auto px-4 py-12">
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <BookOpenIcon className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Enroll to Access Course Materials</h2>
              <p className="text-gray-600 mb-6">
                Enroll in this course to access all learning materials, track your progress, and earn a certificate.
              </p>
              {currentUser ? (
                <button
                  onClick={handleEnroll}
                  disabled={isEnrolling}
                  className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isEnrolling ? 'Enrolling...' : 'Enroll Now to Get Started'}
                </button>
              ) : (
                <button
                  onClick={() => router.push('/auth/signin')}
                  className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition font-semibold"
                >
                  Sign in to Enroll
                </button>
              )}
            </div>
          </section>
        )}
      </main>
      {showQuiz && <QuizComponent />}
       {showCertificate && certificateData && (
      <CertificateViewer 
        certificate={certificateData}
        onClose={() => {
          setShowCertificate(false);
          setCertificateData(null);
        }}
      />
    )}
    </div>
  );
}

function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );
}