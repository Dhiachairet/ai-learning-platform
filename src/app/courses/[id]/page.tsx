'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
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
  studentsEnrolled: number;
  createdAt: string;
  updatedAt: string;
  thumbnail?: string;
  materials: CourseMaterial[];
  instructor: {
    _id: string;
    name: string;
    email: string;
  };
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
  const [showQuizButton, setShowQuizButton] = useState(false);
  const [expandedYouTube, setExpandedYouTube] = useState<string | null>(null);

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

  useEffect(() => {
    const checkEnrollmentStatus = async () => {
      if (!course || !currentUser) return;
      
      try {
        const response = await fetch(`/auth/api/enroll/check?courseId=${course._id}&studentId=${currentUser.id}`);
        const data = await response.json();
        
        setIsEnrolled(data.isEnrolled);
        setEnrollment(data.enrollment);
      } catch (error) {
        console.error('Error checking enrollment:', error);
      }
    };

    checkEnrollmentStatus();
  }, [course, currentUser]);

  // Check if all materials are completed to show quiz button
  useEffect(() => {
    if (isEnrolled && enrollment && course?.materials) {
      const completedCount = enrollment.completedMaterials?.length || 0;
      const totalMaterials = course.materials.length;
      
      if (completedCount === totalMaterials && totalMaterials > 0) {
        setShowQuizButton(true);
      } else {
        setShowQuizButton(false);
      }
    }
  }, [isEnrolled, enrollment, course?.materials]);

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
      alert('Successfully enrolled in the course!');
      
    } catch (error) {
      console.error('Enrollment error:', error);
      alert(error instanceof Error ? error.message : 'Failed to enroll in the course');
    } finally {
      setIsEnrolling(false);
    }
  };

  const handleMarkAsDone = async (material: CourseMaterial) => {
    if (!currentUser || !enrollment || !course) return;

    try {
      setCompletingMaterial(material.title);

      // Call API to mark material as completed
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

      // Update enrollment state
      setEnrollment(data.enrollment);
      
    } catch (error) {
      console.error('Error marking material as done:', error);
      alert('Failed to mark material as completed');
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
    alert('Quiz functionality will be implemented soon!');
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
      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <main className="pt-20 lg:pt-24">
        {/* Back Button */}
        <div className="container mx-auto px-4 py-6">
          <button
            onClick={() => router.push('/courses')}
            className="flex items-center text-indigo-600 hover:text-indigo-800 transition"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Back to Courses
          </button>
        </div>

        {/* Course Header */}
        <section className="container mx-auto px-4">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-8">
              {/* Course Image and Basic Info */}
              <div className="lg:col-span-2">
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Course Thumbnail */}
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

                  {/* Course Info */}
                  <div className="flex-1">
                    <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getLevelColor(course.level)} mb-4`}>
                      {course.level.charAt(0).toUpperCase() + course.level.slice(1)}
                    </span>
                    
                    <h1 className="text-3xl font-bold text-gray-800 mb-4">{course.title}</h1>
                    <p className="text-gray-600 mb-6 leading-relaxed">{course.description}</p>

                    <div className="flex items-center space-x-6 text-sm text-gray-600">
                      <div className="flex items-center">
                        <UserGroupIcon className="h-5 w-5 mr-2 text-gray-400" />
                        <span>{course.studentsEnrolled} students enrolled</span>
                      </div>
                      <div className="flex items-center">
                        <ClockIcon className="h-5 w-5 mr-2 text-gray-400" />
                        <span>Self-paced</span>
                      </div>
                      <div className="flex items-center">
                        <BookOpenIcon className="h-5 w-5 mr-2 text-gray-400" />
                        <span>{course.category}</span>
                      </div>
                    </div>

                    {/* Instructor Info */}
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

              {/* Enrollment Card */}
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
                      </div>
                    </div>
                  )}

                  {/* Quiz Button (only shown when all materials completed) */}
                  {showQuizButton && (
                    <button
                      onClick={handleTakeQuiz}
                      className="w-full mt-4 bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition flex items-center justify-center font-semibold"
                    >
                      <AcademicCapIcon className="h-5 w-5 mr-2" />
                      Take Quiz
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Course Materials - Only show if enrolled */}
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
                        
                        {/* YouTube Video Embedded (only for YouTube materials) */}
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
          /* Message for non-enrolled users */
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
    </div>
  );
}

// Add this component for the check icons
function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );
}