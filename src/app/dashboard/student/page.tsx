'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  ChartBarIcon,
  BookOpenIcon,
  ClockIcon,
  CogIcon,
  Bars3Icon,
  XMarkIcon,
  PlayIcon,
  CheckCircleIcon,
  AcademicCapIcon,
  UserGroupIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";
import { set } from "mongoose";

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

interface StudentStats {
  totalCourses: number;
  inProgressCourses: number;
  completedCourses: number;
 
  
}

interface RecentActivity {
  _id: string;
  courseId: string;
  courseTitle: string;
  action: 'started' | 'completed' | 'enrolled';
  lessonTitle?: string;
  timestamp: string;
}

export default function StudentDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
  const [stats, setStats] = useState<StudentStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');

  const router = useRouter();

  const navigation = [
    { name: "Dashboard", href: "/dashboard/student", icon: ChartBarIcon, current: true },
    { name: "My Courses", href: "/dashboard/student/mycourses", icon: BookOpenIcon, current: false },

    
  ];

  // Fetch student data
  const fetchStudentData = async () => {
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
        throw new Error("Failed to fetch student data");
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || "Failed to load data");
      }

      setEnrolledCourses(data.enrolledCourses || []);
      setStats(data.stats || {
        totalCourses: 0,
        inProgressCourses: 0,
        completedCourses: 0,
       
      
      });
      setRecentActivity(data.recentActivity || []);
    } catch (err) {
      console.error("Error fetching student data:", err);
      setError(err instanceof Error ? err.message : "Failed to load student data. Please try again.");
      
      // Set empty data instead of mock
      setEnrolledCourses([]);
      setStats({
        totalCourses: 0,
        inProgressCourses: 0,
        completedCourses: 0,
      
       
      });
      setRecentActivity([]);
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
        setUsername(payload.name || 'Student');
        setEmail(payload.email || '');

        await fetchStudentData();
      } catch (error) {
        console.error("Auth error:", error);
        localStorage.removeItem("token");
        router.push("/auth/signin");
      }
    };

    checkAuth();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/auth/signin");
  };

  const handleContinueCourse = (courseId: string) => {
    router.push(`/courses/${courseId}`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return "bg-green-600";
    if (progress >= 50) return "bg-blue-600";
    if (progress >= 25) return "bg-yellow-600";
    return "bg-red-600";
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'completed':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'started':
        return <PlayIcon className="h-5 w-5 text-blue-500" />;
      case 'enrolled':
        return <AcademicCapIcon className="h-5 w-5 text-purple-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getActionText = (activity: RecentActivity) => {
    switch (activity.action) {
      case 'completed':
        return `Completed ${activity.lessonTitle} in ${activity.courseTitle}`;
      case 'started':
        return `Started ${activity.lessonTitle} in ${activity.courseTitle}`;
      case 'enrolled':
        return `Enrolled in ${activity.courseTitle}`;
      default:
        return `Updated progress in ${activity.courseTitle}`;
    }
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

        {/* Dashboard content */}
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
            <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-blue-600 to-purple-700 rounded-2xl p-8 text-white shadow-lg border border-indigo-500/20">
              <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-20" />
              <div className="relative flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-extrabold mb-2 tracking-tight">Student Dashboard</h1>
                  <p className="text-indigo-100 text-lg font-medium">Track your learning progress and continue your courses.</p>
                </div>
                <button 
                  onClick={() => router.push('/courses')}
                  className="bg-white/90 backdrop-blur-sm text-indigo-600 px-6 py-3 rounded-xl font-bold hover:bg-white hover:scale-105 transition-all duration-300 flex items-center shadow-lg border border-white/20"
                >
                  <BookOpenIcon className="h-5 w-5 mr-2" />
                  Browse Courses
                </button>
              </div>
            </div>

            {/* Stats Overview */}
            {stats && (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  { name: "Total Courses", value: stats.totalCourses, icon: BookOpenIcon, color: "blue" },
                  { name: "In Progress", value: stats.inProgressCourses, icon: ClockIcon, color: "yellow" },
                  { name: "Completed", value: stats.completedCourses, icon: CheckCircleIcon, color: "green" },
                  
                 
                ].map((item) => (
                  <div key={item.name} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                    <div className="flex items-center">
                      <div className={`p-3 rounded-xl ring-1 ring-inset shadow-inner group-hover:scale-110 transition-transform duration-300 ${item.color === 'blue' ? 'bg-blue-50 ring-blue-100/50' : 
                                                   item.color === 'yellow' ? 'bg-yellow-50 ring-yellow-100/50' : 
                                                   item.color === 'green' ? 'bg-green-50 ring-green-100/50' : 
                                                   item.color === 'purple' ? 'bg-purple-50 ring-purple-100/50' : 'bg-red-50 ring-red-100/50'}`}>
                        <item.icon className={`h-6 w-6 ${item.color === 'blue' ? 'text-blue-600' : 
                                                         item.color === 'yellow' ? 'text-yellow-600' : 
                                                         item.color === 'green' ? 'text-green-600' : 
                                                         item.color === 'purple' ? 'text-purple-600' : 'text-red-600'}`} />
                      </div>
                      <div className="ml-5">
                        <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">{item.name}</p>
                        <p className="text-2xl font-extrabold text-gray-900 mt-1">{item.value}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Enrolled Courses */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900 tracking-tight">My Courses</h2>
                  <button 
                    onClick={() => router.push('/dashboard/student/mycourses')}
                    className="text-indigo-600 hover:text-indigo-800 text-sm font-bold transition-colors"
                  >
                    View All
                  </button>
                </div>

                <div className="space-y-4">
                  {enrolledCourses.length > 0 ? (
                    enrolledCourses.slice(0, 3).map((course) => (
                      <div key={course._id} className="flex items-center space-x-4 p-4 border border-transparent rounded-xl hover:border-indigo-100 bg-gray-50/50 hover:bg-indigo-50/30 transition-all duration-300 group">
                        <div className="flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden bg-indigo-50 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform duration-300">
                          {course.thumbnail ? (
                            <Image
                              src={course.thumbnail}
                              alt={course.title}
                              width={64}
                              height={64}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <BookOpenIcon className="h-8 w-8 text-indigo-600" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-bold text-gray-900 truncate group-hover:text-indigo-700 transition-colors">{course.title}</h3>
                          <p className="text-sm text-gray-500 truncate font-medium">{course.instructor.name}</p>
                          <div className="mt-2">
                            <div className="flex items-center justify-between text-xs text-gray-500 font-medium mb-1.5">
                              <span>Progress</span>
                              <span className="text-indigo-600">{course.progress}%</span>
                            </div>
                            <div className="w-full bg-gray-200/80 rounded-full h-2 overflow-hidden shadow-inner">
                              <div 
                                className={`h-full rounded-full transition-all duration-500 ${getProgressColor(course.progress)}`}
                                style={{ width: `${course.progress}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleContinueCourse(course._id)}
                          className="flex-shrink-0 bg-gradient-to-br from-indigo-600 via-blue-600 to-purple-700 text-white px-5 py-2.5 rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 text-sm font-bold"
                        >
                          {course.progress === 100 ? 'Review' : 'Continue'}
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-10 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
                      <div className="mx-auto w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100 mb-4">
                        <BookOpenIcon className="h-8 w-8 text-gray-400" />
                      </div>
                      <p className="text-lg font-bold text-gray-900 tracking-tight">You haven't enrolled in any courses yet.</p>
                      <button
                        onClick={() => router.push('/courses')}
                        className="mt-6 px-6 py-2.5 bg-gradient-to-br from-indigo-600 via-blue-600 to-purple-700 text-white rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 font-bold"
                      >
                        Browse Courses
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-bold text-gray-900 tracking-tight mb-6">Recent Activity</h2>

                <div className="space-y-4">
                  {recentActivity.length > 0 ? (
                    recentActivity.slice(0, 5).map((activity) => (
                      <div key={activity._id} className="flex items-start space-x-4 p-3 -mx-3 rounded-xl hover:bg-gray-50/80 transition-colors group">
                        <div className="flex-shrink-0 mt-1 bg-gray-50 p-2 rounded-xl group-hover:scale-110 group-hover:bg-white group-hover:shadow-sm ring-1 ring-transparent group-hover:ring-gray-100 transition-all duration-300">
                          {getActionIcon(activity.action)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 group-hover:text-indigo-700 transition-colors">
                            {getActionText(activity)}
                          </p>
                          <p className="text-xs text-gray-500 mt-1 font-medium">
                            {formatDate(activity.timestamp)}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-10 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
                      <div className="mx-auto w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100 mb-4">
                        <ClockIcon className="h-8 w-8 text-gray-400" />
                      </div>
                      <p className="text-lg font-bold text-gray-900 tracking-tight">No recent activity</p>
                      <p className="text-gray-500 mt-1 font-medium">Start learning to see your progress here.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}