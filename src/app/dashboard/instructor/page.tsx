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

export default function InstructorDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const initializeAuth = () => {
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
        setIsLoading(false);

      } catch (error) {
        console.error('Token decode error:', error);
        localStorage.removeItem('token');
        router.push('/auth/signin');
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

  const stats = [
    {
      name: 'Total Students',
      value: '1,248',
      change: '+12%',
      icon: UserGroupIcon,
      changeType: 'positive',
    },
    {
      name: 'Courses Published',
      value: '8',
      change: '+2',
      icon: BookOpenIcon,
      changeType: 'positive',
    },
    {
      name: 'Completion Rate',
      value: '84%',
      change: '+5%',
      icon: ChartBarIcon,
      changeType: 'positive',
    },
    {
      name: 'Student Satisfaction',
      value: '4.9/5',
      change: '+0.2',
      icon: AcademicCapIcon,
      changeType: 'positive',
    },
  ];

  const recentCourses = [
    {
      id: 1,
      name: 'Advanced React Patterns',
      students: 324,
      rating: '4.9',
      progress: 75,
    },
    {
      id: 2,
      name: 'Node.js Microservices',
      students: 198,
      rating: '4.8',
      progress: 60,
    },
    {
      id: 3,
      name: 'Python Data Science',
      students: 456,
      rating: '4.9',
      progress: 90,
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
              {stats.map((item) => (
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
                <div className="space-y-6">
                  {recentCourses.map((course) => (
                    <div key={course.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-gray-900">{course.name}</h4>
                        <div className="mt-2 flex items-center space-x-6 text-sm text-gray-600">
                          <span className="flex items-center">
                            <UserGroupIcon className="h-4 w-4 mr-1" />
                            {course.students} students
                          </span>
                          <span className="flex items-center">
                            <ChartBarIcon className="h-4 w-4 mr-1" />
                            Rating: {course.rating}/5
                          </span>
                        </div>
                        <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="h-2 rounded-full transition-all duration-300"
                            style={{ 
                              width: `${course.progress}%`,
                              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                            }}
                          ></div>
                        </div>
                      </div>
                      <button 
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
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div className="bg-white p-6 shadow rounded-lg border border-gray-200 text-center hover:shadow-md transition-shadow">
                <BookOpenIcon className="h-12 w-12 mx-auto mb-4" style={{ color: '#667eea' }} />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Create New Course</h3>
                <p className="text-gray-600 mb-4">Start building your next course</p>
                <button 
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