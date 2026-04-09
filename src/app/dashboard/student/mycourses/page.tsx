'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  BookOpenIcon,
  ClockIcon,
  UserGroupIcon,
  UserIcon,
  StarIcon,
  PlayIcon,
  Bars3Icon,
  XMarkIcon,
  ArrowLeftIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CogIcon,
  Squares2X2Icon,
  ListBulletIcon,
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
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
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
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-gradient-to-b from-indigo-900 to-indigo-950 border-r border-indigo-800/50 px-6 pb-4 relative shadow-2xl">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5 pointer-events-none"></div>
          
          <div className="flex h-20 shrink-0 items-center relative z-10 border-b border-indigo-800/50 mb-2">
            <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-purple-400 tracking-tight drop-shadow-sm">LearnAI Hub</h1>
          </div>
          
          <nav className="flex flex-1 flex-col relative z-10">
            <ul className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul className="-mx-2 space-y-2">
                  {navigation.map((item) => (
                    <li key={item.name}>
                      <button 
                        onClick={() => router.push(item.href)} 
                        className={`flex items-center w-full p-3.5 rounded-2xl transition-all duration-300 group font-semibold ${item.current ? "bg-indigo-600/40 text-white shadow-inner border border-indigo-500/30" : "text-indigo-200 hover:bg-indigo-800/30 hover:text-white hover:-translate-y-0.5"}`}
                      >
                        <item.icon className={`h-6 w-6 mr-3 transition-colors duration-300 ${item.current ? "text-indigo-300" : "text-indigo-500 group-hover:text-indigo-300"}`} />
                        {item.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </li>
              <li className="mt-auto space-y-3">
                <div className="p-4 rounded-2xl bg-indigo-900/50 border border-indigo-800/50 backdrop-blur-sm shadow-inner">
                  <div className="text-xs text-indigo-400 font-bold uppercase tracking-widest mb-1">Logged in as</div>
                  <div className="font-extrabold text-indigo-50 truncate text-sm">{username}</div>
                </div>
                <button 
                  onClick={handleLogout} 
                  className="flex items-center justify-center w-full p-3.5 text-red-300 font-bold bg-red-950/30 border border-red-900/50 rounded-2xl hover:bg-red-600 hover:text-white hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300 group"
                >
                  <XMarkIcon className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
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
        <div className="sticky top-0 z-40 flex h-20 shrink-0 items-center gap-x-4 border-b border-gray-100 bg-white/80 backdrop-blur-xl px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8 transition-all">
          <button type="button" className="-m-2.5 p-2.5 text-gray-700 lg:hidden hover:text-indigo-600 transition-colors" onClick={() => setSidebarOpen(true)}>
            <Bars3Icon className="h-6 w-6" />
          </button>

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6 justify-end">
            <div className="flex items-center justify-end gap-x-4 lg:gap-x-6">
              <div className="hidden sm:flex items-center gap-3 bg-indigo-50/50 px-4 py-2 rounded-2xl border border-indigo-100/50">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-sm">
                  {username ? username.charAt(0).toUpperCase() : 'U'}
                </div>
                <span className="text-sm font-bold text-gray-700 hidden md:block">{username}</span>
              </div>
              <button 
                onClick={handleLogout} 
                className="flex items-center justify-center px-4 py-2.5 text-sm font-bold text-red-600 bg-red-50 hover:bg-red-500 hover:text-white rounded-xl transition-all duration-300 shadow-sm border border-red-100"
              >
                Logout
              </button>
            </div>
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
            <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-blue-600 to-purple-700 rounded-3xl p-8 text-white shadow-xl shadow-indigo-200/50 hover:shadow-2xl hover:shadow-indigo-200/60 transition-all duration-500">
              <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20"></div>
              <div className="relative flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-bold mb-2 tracking-tight">My Courses</h1>
                  <p className="text-indigo-100 text-lg max-w-xl">All courses you're enrolled in. Continue your learning journey.</p>
                </div>
                <button 
                  onClick={() => router.push('/courses')}
                  className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-6 py-3 rounded-2xl font-semibold hover:bg-white/20 transition-all duration-300 flex items-center shadow-sm hover:shadow-md hover:-translate-y-0.5"
                >
                  <BookOpenIcon className="h-5 w-5 mr-2" />
                  Browse More Courses
                </button>
              </div>
            </div>

            {/* Filters and Search */}
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-sm border border-gray-100 p-6 transition-all hover:shadow-md">
              <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
                <div className="flex-1">
                  <div className="relative group">
                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2 group-focus-within:text-indigo-500 transition-colors" />
                    <input
                      type="text"
                      placeholder="Search your courses..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-gray-50/50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-gray-900 placeholder-gray-500 transition-all font-medium"
                    />
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="relative group">
                    <FunnelIcon className="h-5 w-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2 group-focus-within:text-indigo-500 transition-colors" />
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="pl-11 pr-8 py-3 bg-gray-50/50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-gray-900 transition-all appearance-none cursor-pointer font-medium"
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <select
                    value={selectedLevel}
                    onChange={(e) => setSelectedLevel(e.target.value)}
                    className="px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-gray-900 transition-all cursor-pointer font-medium"
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
                    className="px-6 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-all font-medium whitespace-nowrap"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>

            {/* Courses Grid / Table */}
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Enrolled Courses ({filteredCourses.length})
                </h2>
                <div className="flex items-center space-x-4">
                  <div className="text-sm font-medium text-gray-600 hidden sm:block">
                    {enrolledCourses.length} total courses
                  </div>
                  <div className="flex bg-gray-100/80 p-1 rounded-xl shadow-inner border border-gray-200/50">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded-lg transition-all duration-300 ${viewMode === 'grid' ? 'bg-white shadow-sm text-indigo-600 font-medium' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'}`}
                      title="Grid View"
                    >
                      <Squares2X2Icon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => setViewMode('table')}
                      className={`p-2 rounded-lg transition-all duration-300 ${viewMode === 'table' ? 'bg-white shadow-sm text-indigo-600 font-medium' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'}`}
                      title="List View"
                    >
                      <ListBulletIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>

              {filteredCourses.length > 0 ? (
                viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredCourses.map((course) => (
                    <div
                      key={course._id}
                      className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100 flex flex-col"
                    >
                      {/* Course Image */}
                      <div className="h-48 relative overflow-hidden">
                        {course.thumbnail ? (
                          <Image
                            src={course.thumbnail}
                            alt={course.title}
                            fill
                            className="object-cover transform transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center transform transition-transform duration-500 group-hover:scale-105">
                            <BookOpenIcon className="h-12 w-12 text-white/80" />
                          </div>
                        )}
                        <div className="absolute top-3 right-3 flex space-x-2">
                          <span className={`px-3 py-1 text-xs font-bold text-white rounded-full backdrop-blur-md shadow-sm ${getLevelColor(course.level)}`}>
                            {course.level.charAt(0).toUpperCase() + course.level.slice(1)}
                          </span>
                          <span className="px-3 py-1 bg-white/90 text-indigo-700 backdrop-blur-md shadow-sm text-xs font-bold rounded-full border border-white/20">
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
                        <div className="flex mt-auto pt-4">
                          <button
                            onClick={() => handleContinueCourse(course._id)}
                            className="flex-1 bg-indigo-50 text-indigo-700 py-3 rounded-xl hover:bg-indigo-600 hover:text-white transition-colors duration-300 flex items-center justify-center font-semibold group-hover:shadow-md"
                          >
                            <PlayIcon className="h-5 w-5 mr-2" />
                            {course.progress === 100 ? 'Review Course' : 'Continue Learning'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                ) : (
                  <div className="bg-white shadow-sm rounded-3xl border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-100">
                        <thead className="bg-gray-50/50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Course Details
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Category & Level
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Progress
                            </th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                          {filteredCourses.map((course) => (
                            <tr key={course._id} className="group hover:bg-indigo-50/30 transition-colors duration-200">
                              <td className="px-6 py-4">
                                <div className="flex items-center">
                                  <div className="h-12 w-12 flex-shrink-0 relative rounded-xl overflow-hidden bg-gray-100">
                                    {course.thumbnail ? (
                                      <Image
                                        src={course.thumbnail}
                                        alt={course.title}
                                        fill
                                        className="object-cover"
                                      />
                                    ) : (
                                      <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                                        <BookOpenIcon className="h-6 w-6 text-white/80" />
                                      </div>
                                    )}
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-semibold text-gray-900 group-hover:text-indigo-700 transition-colors truncate max-w-xs">{course.title}</div>
                                    <div className="text-sm text-gray-500 flex items-center mt-1">
                                      <UserIcon className="h-3.5 w-3.5 mr-1" />
                                      {course.instructor.name}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex flex-col space-y-1">
                                  <span className="text-sm text-gray-900">{course.category}</span>
                                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full w-fit ${getLevelColor(course.level)}`}>
                                    {course.level}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="w-full max-w-[200px]">
                                  <div className="flex justify-between items-center mb-1">
                                    <span className="text-xs font-semibold text-gray-700">{course.progress}%</span>
                                    <span className="text-xs font-medium text-gray-500">{course.completedLessons}/{course.totalLessons}</span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                      className={`h-2 rounded-full ${getProgressColor(course.progress)} transition-all duration-500`}
                                      style={{ width: `${course.progress}%` }}
                                    ></div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button
                                  onClick={() => handleContinueCourse(course._id)}
                                  className="inline-flex items-center px-4 py-2.5 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 hover:shadow-md hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300"
                                >
                                  <PlayIcon className="h-4 w-4 mr-2" />
                                  {course.progress === 100 ? 'Review' : 'Continue'}
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )
              ) : (
                <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-sm border border-gray-100 p-16 text-center">
                  <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <BookOpenIcon className="h-12 w-12 text-indigo-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3 tracking-tight">
                    {enrolledCourses.length === 0 ? 'No Enrolled Courses' : 'No Courses Found'}
                  </h3>
                  <p className="text-gray-500 mb-8 max-w-md mx-auto text-lg leading-relaxed">
                    {enrolledCourses.length === 0 
                      ? "You haven't enrolled in any courses yet. Start your learning journey today!"
                      : "Try adjusting your search or category filters to find what you're looking for."
                    }
                  </p>
                  <button
                    onClick={() => router.push('/courses')}
                    className="bg-indigo-600 text-white px-8 py-3.5 rounded-xl hover:bg-indigo-700 transition-all duration-300 font-semibold shadow-md hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center mx-auto"
                  >
                    <MagnifyingGlassIcon className="w-5 h-5 mr-2" />
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