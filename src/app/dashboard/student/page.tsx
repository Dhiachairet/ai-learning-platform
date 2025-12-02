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
  totalStudyTime: number;
  upcomingDeadlines: number;
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

  const router = useRouter();

  const navigation = [
    { name: "Dashboard", href: "/dashboard/student", icon: ChartBarIcon, current: true },
    { name: "My Courses", href: "/dashboard/student/courses", icon: BookOpenIcon, current: false },
    { name: "Progress", href: "/dashboard/student/progress", icon: ClockIcon, current: false },
    { name: "Settings", href: "/dashboard/student/settings", icon: CogIcon, current: false },
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
        totalStudyTime: 0,
        upcomingDeadlines: 0
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
        totalStudyTime: 0,
        upcomingDeadlines: 0
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
                  <div className="font-medium text-gray-900">Student</div>
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

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6 justify-end">
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              <span className="text-sm text-gray-700">Student</span>
              <button onClick={handleLogout} className="text-sm font-semibold text-red-600 hover:text-red-700">Logout</button>
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
            <div className="bg-gradient-to-r from-blue-600 to-purple-700 rounded-2xl p-8 text-white">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-bold mb-2">Student Dashboard</h1>
                  <p className="text-blue-100 text-lg">Track your learning progress and continue your courses.</p>
                </div>
                <button 
                  onClick={() => router.push('/courses')}
                  className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors flex items-center"
                >
                  <BookOpenIcon className="h-5 w-5 mr-2" />
                  Browse Courses
                </button>
              </div>
            </div>

            {/* Stats Overview */}
            {stats && (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
                {[
                  { name: "Total Courses", value: stats.totalCourses, icon: BookOpenIcon, color: "blue" },
                  { name: "In Progress", value: stats.inProgressCourses, icon: ClockIcon, color: "yellow" },
                  { name: "Completed", value: stats.completedCourses, icon: CheckCircleIcon, color: "green" },
                  { name: "Study Hours", value: `${stats.totalStudyTime}h`, icon: ClockIcon, color: "purple" },
                  { name: "Upcoming", value: stats.upcomingDeadlines, icon: CalendarIcon, color: "red" },
                ].map((item) => (
                  <div key={item.name} className="bg-white rounded-lg shadow border border-gray-200 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center">
                      <div className={`p-2 rounded-lg ${item.color === 'blue' ? 'bg-blue-100' : 
                                                   item.color === 'yellow' ? 'bg-yellow-100' : 
                                                   item.color === 'green' ? 'bg-green-100' : 
                                                   item.color === 'purple' ? 'bg-purple-100' : 'bg-red-100'}`}>
                        <item.icon className={`h-6 w-6 ${item.color === 'blue' ? 'text-blue-600' : 
                                                         item.color === 'yellow' ? 'text-yellow-600' : 
                                                         item.color === 'green' ? 'text-green-600' : 
                                                         item.color === 'purple' ? 'text-purple-600' : 'text-red-600'}`} />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">{item.name}</p>
                        <p className="text-2xl font-bold text-gray-900">{item.value}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Enrolled Courses */}
              <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">My Courses</h2>
                  <button 
                    onClick={() => router.push('/dashboard/student/courses')}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    View All
                  </button>
                </div>

                <div className="space-y-4">
                  {enrolledCourses.length > 0 ? (
                    enrolledCourses.slice(0, 3).map((course) => (
                      <div key={course._id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-blue-100 flex items-center justify-center">
                          {course.thumbnail ? (
                            <Image
                              src={course.thumbnail}
                              alt={course.title}
                              width={64}
                              height={64}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <BookOpenIcon className="h-8 w-8 text-blue-600" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-medium text-gray-900 truncate">{course.title}</h3>
                          <p className="text-sm text-gray-500 truncate">{course.instructor.name}</p>
                          <div className="mt-2">
                            <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                              <span>Progress</span>
                              <span>{course.progress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(course.progress)}`}
                                style={{ width: `${course.progress}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleContinueCourse(course._id)}
                          className="flex-shrink-0 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                        >
                          {course.progress === 100 ? 'Review' : 'Continue'}
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <BookOpenIcon className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                      <p className="text-gray-600">You haven't enrolled in any courses yet.</p>
                      <button
                        onClick={() => router.push('/courses')}
                        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                      >
                        Browse Courses
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Activity</h2>

                <div className="space-y-4">
                  {recentActivity.length > 0 ? (
                    recentActivity.slice(0, 5).map((activity) => (
                      <div key={activity._id} className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          {getActionIcon(activity.action)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900">
                            {getActionText(activity)}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {formatDate(activity.timestamp)}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <ClockIcon className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                      <p className="text-gray-600">No recent activity</p>
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