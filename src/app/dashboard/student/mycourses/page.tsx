'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  BookOpenIcon,
  ClockIcon,
  UserGroupIcon,
  StarIcon,
  PlayIcon,
  Bars3Icon,
  XMarkIcon,
  ArrowLeftIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CogIcon,
} from '@heroicons/react/24/outline';
import { set } from 'mongoose';

interface EnrolledCourse {
  _id: string;
  title: string;
  description: string;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  thumbnail?: string;
  progress: number;
  lastAccessed: string;
  instructor: {
    name: string;
    email: string;
  };
  totalLessons: number;
  completedLessons: number;
}

export default function StudentCourses() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedLevel, setSelectedLevel] = useState('All');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');

  const router = useRouter();

  const navigation = [
    { name: "Dashboard", href: "/dashboard/student", icon: BookOpenIcon, current: false },
    { name: "My Courses", href: "/dashboard/student/courses", icon: BookOpenIcon, current: true },
    { name: "Settings", href: "/dashboard/student/settings", icon: CogIcon, current: false },
  ];

  // Fetch student courses
  const fetchStudentCourses = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch("/dashboard/student/api/courses", {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Authentication failed. Please login again.");
        }
        throw new Error("Failed to fetch courses");
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || "Failed to load courses");
      }

      setEnrolledCourses(data.enrolledCourses || []);
    } catch (err) {
      console.error("Error fetching student courses:", err);
      setError(err instanceof Error ? err.message : "Failed to load courses. Please try again.");
      setEnrolledCourses([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Check authentication and load data
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        
        if (!token) {
          router.push('/auth/signin');
          return;
        }

        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.role !== 'student') {
          router.push('/');
          return;
        }
        setUsername(payload.name || payload.email || 'Student');
        setEmail(payload.email || '');

        await fetchStudentCourses();
      } catch (error) {
        console.error("Auth error:", error);
        localStorage.removeItem("token");
        router.push("/auth/signin");
      }
    };

    checkAuth();
  }, [router]);

  // Get unique categories and levels
  const categories = ['All', ...Array.from(new Set(enrolledCourses.map(course => course.category)))];
  const levels = ['All', 'Beginner', 'Intermediate', 'Advanced'];

  // Filter courses
  const filteredCourses = enrolledCourses.filter((course) => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || course.category === selectedCategory;
    const matchesLevel = selectedLevel === 'All' || 
                        course.level.toLowerCase() === selectedLevel.toLowerCase();
    
    return matchesSearch && matchesCategory && matchesLevel;
  });

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return "bg-green-600";
    if (progress >= 50) return "bg-blue-600";
    if (progress >= 25) return "bg-yellow-600";
    return "bg-red-600";
  };

  const getLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/auth/signin");
  };

  const handleContinueCourse = (courseId: string) => {
    router.push(`/courses/${courseId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-gray-900/80" onClick={() => setSidebarOpen(false)} />
          <div className="fixed inset-y-0 left-0 w-80 bg-white shadow-xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h1 className="text-2xl font-bold text-blue-600">LearnAI Hub</h1>
              <button onClick={() => setSidebarOpen(false)} className="p-2">
                <XMarkIcon className="h-6 w-6 text-gray-500" />
              </button>
            </div>
            <nav className="p-6 space-y-2">
              {navigation.map((item) => (
                <button
                  key={item.name}
                  onClick={() => {
                    router.push(item.href);
                    setSidebarOpen(false);
                  }}
                  className={`flex items-center w-full p-3 rounded-lg transition-colors ${item.current ? "bg-blue-50 text-blue-600" : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"}`}
                >
                  <item.icon className="h-5 w-5 mr-3" />
                  {item.name}
                </button>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-80 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-6 pb-4">
          <div className="flex h-16 shrink-0 items-center">
            <h1 className="text-2xl font-bold text-blue-600">LearnAI Hub</h1>
          </div>
          <nav className="flex flex-1 flex-col">
            <ul className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul className="-mx-2 space-y-1">
                  {navigation.map((item) => (
                    <li key={item.name}>
                      <button 
                        onClick={() => router.push(item.href)} 
                        className={`flex items-center w-full p-3 rounded-lg transition-colors group ${item.current ? "bg-blue-50 text-blue-600" : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"}`}
                      >
                        <item.icon className={`h-5 w-5 mr-3 ${item.current ? "text-blue-600" : "text-gray-400 group-hover:text-blue-600"}`} />
                        {item.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </li>
              <li className="mt-auto">
                <div className="p-3 text-sm text-gray-600 border-t border-gray-200">
                  <div className="font-medium text-gray-900">{email}</div>
                </div>
                <button 
                  onClick={handleLogout} 
                  className="flex items-center w-full p-3 text-red-600 rounded-lg hover:bg-red-50 transition-colors group mt-2"
                >
                  <XMarkIcon className="h-5 w-5 mr-3 text-red-400" />
                  Logout
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-80">
        {/* Top bar */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <button type="button" className="-m-2.5 p-2.5 text-gray-700 lg:hidden" onClick={() => setSidebarOpen(true)}>
            <Bars3Icon className="h-6 w-6" />
          </button>

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
          
          </div>

          <div className="flex items-center gap-x-4 lg:gap-x-6">
            <span className="text-sm text-gray-700">{username}</span>
            <button onClick={handleLogout} className="text-sm font-semibold text-red-600 hover:text-red-700">Logout</button>
          </div>
        </div>

        {/* Main content */}
        <main className="py-8">
          <div className="px-4 sm:px-6 lg:px-8 space-y-8">
            {/* Error Message */}
            {error && (
              <div className="rounded-md bg-red-50 p-4 border border-red-200">
                <div className="flex">
                  <XMarkIcon className="h-5 w-5 text-red-400" />
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Error</h3>
                    <p className="text-sm text-red-700 mt-1">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-700 rounded-2xl p-8 text-white">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-bold mb-2">My Courses</h1>
                  <p className="text-blue-100 text-lg">All courses you're enrolled in. Continue your learning journey.</p>
                </div>
                <button 
                  onClick={() => router.push('/courses')}
                  className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors flex items-center"
                >
                  <BookOpenIcon className="h-5 w-5 mr-2" />
                  Browse More Courses
                </button>
              </div>
            </div>

            {/* Filters and Search */}
            <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
              <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
                <div className="flex-1">
                  <div className="relative">
                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search your courses..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="relative">
                    <FunnelIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <select
                    value={selectedLevel}
                    onChange={(e) => setSelectedLevel(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {levels.map((level) => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedCategory('All');
                      setSelectedLevel('All');
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>

            {/* Courses Grid */}
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Enrolled Courses ({filteredCourses.length})
                </h2>
                <div className="text-sm text-gray-600">
                  {enrolledCourses.length} total courses
                </div>
              </div>

              {filteredCourses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredCourses.map((course) => (
                    <div
                      key={course._id}
                      className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-200"
                    >
                      {/* Course Image */}
                      <div className="h-48 relative">
                        {course.thumbnail ? (
                          <Image
                            src={course.thumbnail}
                            alt={course.title}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                            <BookOpenIcon className="h-12 w-12 text-white" />
                          </div>
                        )}
                        <div className="absolute top-3 right-3 flex space-x-2">
                          <span className={`px-3 py-1 text-xs font-bold text-white rounded-full ${getLevelColor(course.level)}`}>
                            {course.level.charAt(0).toUpperCase() + course.level.slice(1)}
                          </span>
                          <span className="px-3 py-1 bg-blue-500 text-white text-xs font-bold rounded-full">
                            {course.category}
                          </span>
                        </div>
                      </div>

                      {/* Course Info */}
                      <div className="p-6">
                        <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-1">{course.title}</h3>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{course.description}</p>

                        {/* Instructor */}
                        <div className="flex items-center mb-4">
                          <div className="w-8 h-8 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xs">
                            {course.instructor.name
                              .split(' ')
                              .map((n) => n[0])
                              .join('')}
                          </div>
                          <div className="ml-3">
                            <p className="text-sm text-gray-700">{course.instructor.name}</p>
                          </div>
                        </div>

                        {/* Progress Section */}
                        <div className="mb-4">
                          <div className="flex justify-between text-sm text-gray-600 mb-1">
                            <span>Progress</span>
                            <span>{course.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(course.progress)}`}
                              style={{ width: `${course.progress}%` }}
                            ></div>
                          </div>
                          <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>{course.completedLessons} of {course.totalLessons} lessons</span>
                            <span>Last accessed: {formatDate(course.lastAccessed)}</span>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleContinueCourse(course._id)}
                            className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition flex items-center justify-center font-medium"
                          >
                            <PlayIcon className="h-4 w-4 mr-2" />
                            {course.progress === 100 ? 'Review Course' : 'Continue Learning'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow border border-gray-200 p-12 text-center">
                  <BookOpenIcon className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    {enrolledCourses.length === 0 ? 'No Enrolled Courses' : 'No Courses Found'}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {enrolledCourses.length === 0 
                      ? "You haven't enrolled in any courses yet. Start your learning journey!"
                      : "Try adjusting your search or filters to find what you're looking for."
                    }
                  </p>
                  <button
                    onClick={() => router.push('/courses')}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-medium"
                  >
                    Browse Courses
                  </button>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Add CSS for line clamping */}
      <style jsx>{`
        .line-clamp-1 {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}