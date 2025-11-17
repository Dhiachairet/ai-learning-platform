'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ChartBarIcon,
  BookOpenIcon,
  UserGroupIcon,
  AcademicCapIcon,
  CogIcon,
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

interface DashboardStats {
  totalStudents: number;
  coursesPublished: number;
  completionRate: number;
  studentSatisfaction: number;
}

export default function InstructorDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentCourses, setRecentCourses] = useState<any[]>([]);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const initializeAuth = async () => {
      const tokenFromUrl = searchParams.get('token');
      
      // If token comes from URL (Google OAuth), save it to localStorage
      if (tokenFromUrl) {
        localStorage.setItem('token', tokenFromUrl);
        
        // Remove token from URL without page reload
        const newUrl = window.location.pathname;
        window.history.replaceState({}, '', newUrl);
      }

      // Check if user is actually an instructor
      const token = localStorage.getItem('token');
      
      if (!token) {
        router.push('/auth/signin');
        return;
      }

      try {
        const payload = JSON.parse(atob(token.split('.')[1]));

        // ✅ CRITICAL: Check if user has instructor role
        if (payload.role !== 'instructor') {
          router.push('/');
          return;
        }

        // ✅ Save user name for display
        setUserName(payload.name || 'Instructor');
        
        // Fetch real dashboard data
        await fetchDashboardData(token);
        setIsLoading(false);

      } catch (error) {
        console.error('Token decode error:', error);
        localStorage.removeItem('token');
        router.push('/auth/signin');
      }
    };

    const fetchDashboardData = async (token: string) => {
      try {
        const response = await fetch('/dashboard/instructor/api/courses', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          
          // Calculate stats from real data
          const totalStudents = data.stats?.totalStudents || 0;
          const coursesPublished = data.stats?.publishedCourses || 0;
          const completionRate = 0; // You'll need to implement this based on your data
          const studentSatisfaction = 4.9; // You'll need to implement this based on your data

          setStats({
            totalStudents,
            coursesPublished,
            completionRate,
            studentSatisfaction
          });

          // Get recent courses (last 3)
          setRecentCourses(data.courses?.slice(0, 3) || []);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // Set default empty stats if API fails
        setStats({
          totalStudents: 0,
          coursesPublished: 0,
          completionRate: 0,
          studentSatisfaction: 0
        });
        setRecentCourses([]);
      }
    };

    initializeAuth();
  }, [router, searchParams]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/auth/signin');
  };

  const navigation = [
    { name: 'Dashboard', href: '/dashboard/instructor', icon: ChartBarIcon, current: true },
    { name: 'My Courses', href: '/dashboard/instructor/courses', icon: BookOpenIcon, current: false },
    { name: 'Students', href: '/dashboard/instructor/students', icon: UserGroupIcon, current: false },
    { name: 'Settings', href: '/dashboard/instructor/settings', icon: CogIcon, current: false },
  ];

  const dashboardStats = [
    {
      name: 'Total Students',
      value: stats?.totalStudents.toLocaleString() || '0',
      change: '+0%',
      icon: UserGroupIcon,
      changeType: 'positive',
    },
    {
      name: 'Courses Published',
      value: stats?.coursesPublished.toString() || '0',
      change: '+0',
      icon: BookOpenIcon,
      changeType: 'positive',
    },
    {
      name: 'Completion Rate',
      value: stats?.completionRate ? `${stats.completionRate}%` : '0%',
      change: '+0%',
      icon: ChartBarIcon,
      changeType: 'positive',
    },
    {
      name: 'Student Satisfaction',
      value: stats?.studentSatisfaction ? `${stats.studentSatisfaction}/5` : '0/5',
      change: '+0.0',
      icon: AcademicCapIcon,
      changeType: 'positive',
    },
  ];

  // ✅ Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-900">Loading Dashboard...</div>
          <div className="mt-2 text-sm text-gray-600">Checking your permissions</div>
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
              <h1 className="text-2xl font-bold" style={{ color: '#667eea' }}>
                LearnAI Hub
              </h1>
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
                  className="flex items-center w-full p-3 text-gray-700 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors"
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
            <h1 className="text-2xl font-bold" style={{ color: '#667eea' }}>
              LearnAI Hub
            </h1>
          </div>
          <nav className="flex flex-1 flex-col">
            <ul className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul className="-mx-2 space-y-1">
                  {navigation.map((item) => (
                    <li key={item.name}>
                      <button
                        onClick={() => router.push(item.href)}
                        className="flex items-center w-full p-3 text-gray-700 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors group"
                      >
                        <item.icon className="h-5 w-5 mr-3 text-gray-400 group-hover:text-blue-600" />
                        {item.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </li>
              <li className="mt-auto">
                <div className="p-3 text-sm text-gray-600 border-t border-gray-200">
                  <div className="font-medium text-gray-900">{userName}</div>
                  <div className="text-gray-500">Instructor</div>
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

      {/* Main content area */}
      <div className="lg:pl-80">
        {/* Top bar */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Bars3Icon className="h-6 w-6" />
          </button>

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6 justify-end">
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              {/* ✅ ADDED: User name display */}
              <span className="text-sm text-gray-700">Hello, {userName}</span>
              <button 
                onClick={handleLogout}
                className="text-sm font-semibold text-red-600 hover:text-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Dashboard content */}
        <main className="py-8">
          <div className="px-4 sm:px-6 lg:px-8 space-y-8">
            {/* Welcome Header - Updated with user name */}
            <div 
              className="rounded-2xl p-8 text-white"
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
              }}
            >
              <h1 className="text-3xl font-bold mb-2">Welcome back, {userName}!</h1>
              <p className="text-blue-100 text-lg">
                Here's what's happening with your courses today.
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {dashboardStats.map((item) => (
                <div
                  key={item.name}
                  className="bg-white overflow-hidden shadow rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
                >
                  <div className="p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <item.icon className="h-8 w-8" style={{ color: '#667eea' }} />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            {item.name}
                          </dt>
                          <dd className="flex items-baseline">
                            <div className="text-2xl font-semibold text-gray-900">
                              {item.value}
                            </div>
                            <div
                              className={`ml-2 flex items-baseline text-sm font-semibold ${
                                item.changeType === 'positive'
                                  ? 'text-green-600'
                                  : 'text-red-600'
                              }`}
                            >
                              {item.change}
                            </div>
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Recent Courses */}
            <div className="bg-white shadow rounded-lg border border-gray-200">
              <div className="px-6 py-5 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Recent Courses</h3>
              </div>
              <div className="p-6">
                {recentCourses.length > 0 ? (
                  <div className="space-y-6">
                    {recentCourses.map((course) => (
                      <div key={course._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold text-gray-900">{course.title}</h4>
                          <div className="mt-2 flex items-center space-x-6 text-sm text-gray-600">
                            <span className="flex items-center">
                              <UserGroupIcon className="h-4 w-4 mr-1" />
                              {course.studentsEnrolled || 0} students
                            </span>
                            <span className="flex items-center">
                              <ChartBarIcon className="h-4 w-4 mr-1" />
                              Status: {course.status}
                            </span>
                          </div>
                        </div>
                        <button 
                          onClick={() => router.push(`/dashboard/instructor/courses`)}
                          className="ml-4 px-4 py-2 text-white rounded-lg hover:opacity-90 transition-colors text-sm font-medium"
                          style={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                          }}
                        >
                          Manage
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <BookOpenIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-lg font-medium text-gray-900">No courses yet</p>
                    <p className="text-gray-600 mt-1">Create your first course to get started</p>
                    <button 
                      onClick={() => router.push('/dashboard/instructor/courses')}
                      className="mt-4 px-6 py-2 text-white rounded-lg hover:opacity-90 transition-colors"
                      style={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                      }}
                    >
                      Create Your First Course
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div className="bg-white p-6 shadow rounded-lg border border-gray-200 text-center hover:shadow-md transition-shadow">
                <BookOpenIcon className="h-12 w-12 mx-auto mb-4" style={{ color: '#667eea' }} />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Create New Course</h3>
                <p className="text-gray-600 mb-4">Start building your next course</p>
                <button 
                  onClick={() => router.push('/dashboard/instructor/courses')}
                  className="w-full text-white py-2 rounded-lg hover:opacity-90 transition-colors"
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                  }}
                >
                  Get Started
                </button>
              </div>

              <div className="bg-white p-6 shadow rounded-lg border border-gray-200 text-center hover:shadow-md transition-shadow">
                <UserGroupIcon className="h-12 w-12 mx-auto mb-4" style={{ color: '#667eea' }} />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Student Analytics</h3>
                <p className="text-gray-600 mb-4">View detailed student progress</p>
                <button 
                  onClick={() => router.push('/dashboard/instructor/students')}
                  className="w-full text-white py-2 rounded-lg hover:opacity-90 transition-colors"
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                  }}
                >
                  View Analytics
                </button>
              </div>

              <div className="bg-white p-6 shadow rounded-lg border border-gray-200 text-center hover:shadow-md transition-shadow">
                <AcademicCapIcon className="h-12 w-12 mx-auto mb-4" style={{ color: '#667eea' }} />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Course Insights</h3>
                <p className="text-gray-600 mb-4">Check course performance & feedback</p>
                <button 
                  onClick={() => router.push('/dashboard/instructor/courses')}
                  className="w-full text-white py-2 rounded-lg hover:opacity-90 transition-colors"
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                  }}
                >
                  View Insights
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}