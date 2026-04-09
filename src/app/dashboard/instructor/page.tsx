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
         
          const coursesPublished = data.stats?.publishedCourses || 0;
          const completionRate = 0; // You'll need to implement this based on your data
          const studentSatisfaction = 4.9; // You'll need to implement this based on your data

          setStats({
           
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
    
    
  ];

  const dashboardStats = [
   
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
                  <div className="text-xs text-indigo-400 font-bold uppercase tracking-widest mb-1">Instructor</div>
                  <div className="font-extrabold text-indigo-50 truncate text-sm">{userName}</div>
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

      {/* Main content area */}
      <div className="lg:pl-80">
        {/* Top bar */}
        <div className="sticky top-0 z-40 flex h-20 shrink-0 items-center gap-x-4 border-b border-gray-100 bg-white/80 backdrop-blur-xl px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8 transition-all">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-700 lg:hidden hover:text-indigo-600 transition-colors"
            onClick={() => setSidebarOpen(true)}
          >
            <Bars3Icon className="h-6 w-6" />
          </button>

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6 justify-end">
            <div className="flex items-center justify-end gap-x-4 lg:gap-x-6">
              <div className="hidden sm:flex items-center gap-3 bg-indigo-50/50 px-4 py-2 rounded-2xl border border-indigo-100/50">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-sm">
                  {userName ? userName.charAt(0).toUpperCase() : 'I'}
                </div>
                <span className="text-sm font-bold text-gray-700 hidden md:block">{userName}</span>
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
            {/* Welcome Header - Updated with user name */}
            <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-blue-600 to-purple-700 rounded-2xl p-8 text-white shadow-lg border border-indigo-500/20">
              <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-20" />
              <h1 className="relative z-10 text-3xl font-extrabold mb-2 tracking-tight">Welcome back, {userName}!</h1>
              <p className="relative z-10 text-indigo-100 text-lg font-medium">
                Here's what's happening with your courses today.
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {dashboardStats.map((item) => (
                <div
                  key={item.name}
                  className="bg-white overflow-hidden shadow-sm rounded-2xl border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
                >
                  <div className="p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 p-3 bg-indigo-50 ring-1 ring-indigo-100/50 rounded-xl group-hover:scale-110 transition-transform duration-300">
                        <item.icon className="h-7 w-7 text-indigo-600" />
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
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50">
                <h3 className="text-lg font-bold text-gray-900 tracking-tight">Recent Courses</h3>
              </div>
              <div className="p-6">
                {recentCourses.length > 0 ? (
                  <div className="space-y-6">
                    {recentCourses.map((course) => (
                      <div key={course._id} className="flex items-center justify-between p-4 bg-gray-50/50 rounded-xl border border-transparent hover:border-indigo-100 hover:bg-indigo-50/30 transition-all duration-300 group">
                        <div className="flex-1">
                          <h4 className="text-lg font-bold text-gray-900 group-hover:text-indigo-700 transition-colors">{course.title}</h4>
                          <div className="mt-2 flex items-center space-x-6 text-sm text-gray-500 font-medium">
                            <span className="flex items-center">
                              <UserGroupIcon className="h-4 w-4 mr-1 text-gray-400" />
                              {course.studentsEnrolled || 0} students
                            </span>
                            <span className="flex items-center">
                              <ChartBarIcon className="h-4 w-4 mr-1 text-gray-400" />
                              Status: <span className="ml-1 text-indigo-600 capitalize">{course.status}</span>
                            </span>
                          </div>
                        </div>
                        <button 
                          onClick={() => router.push(`/dashboard/instructor/courses`)}
                          className="ml-4 px-5 py-2.5 bg-gradient-to-br from-indigo-600 via-blue-600 to-purple-700 text-white rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 text-sm font-bold"
                        >
                          Manage
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
                    <div className="mx-auto w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100 mb-4">
                      <BookOpenIcon className="h-8 w-8 text-gray-400" />
                    </div>
                    <p className="text-lg font-bold text-gray-900 tracking-tight">No courses yet</p>
                    <p className="text-gray-500 mt-1 font-medium">Create your first course to get started</p>
                    <button 
                      onClick={() => router.push('/dashboard/instructor/courses')}
                      className="mt-6 px-6 py-2.5 bg-gradient-to-br from-indigo-600 via-blue-600 to-purple-700 text-white rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 font-bold"
                    >
                      Create Your First Course
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group cursor-pointer" onClick={() => router.push('/dashboard/instructor/courses')}>
                <div className="mx-auto w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-indigo-100 transition-all duration-300">
                  <BookOpenIcon className="h-8 w-8 text-indigo-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-indigo-700 transition-colors">Create New Course</h3>
                <p className="text-gray-500 mb-6 font-medium text-sm">Start building your next course</p>
                <button 
                  className="w-full bg-gray-50/50 group-hover:bg-gradient-to-br from-indigo-600 via-blue-600 to-purple-700 text-indigo-600 group-hover:text-white py-2.5 rounded-xl font-bold shadow-sm group-hover:shadow-md transition-all duration-300 border border-gray-200 group-hover:border-transparent"
                >
                  Get Started
                </button>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group cursor-pointer" onClick={() => router.push('/dashboard/instructor/students')}>
                <div className="mx-auto w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-indigo-100 transition-all duration-300">
                  <UserGroupIcon className="h-8 w-8 text-indigo-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-indigo-700 transition-colors">Student Analytics</h3>
                <p className="text-gray-500 mb-6 font-medium text-sm">View detailed student progress</p>
                <button 
                  className="w-full bg-gray-50/50 group-hover:bg-gradient-to-br from-indigo-600 via-blue-600 to-purple-700 text-indigo-600 group-hover:text-white py-2.5 rounded-xl font-bold shadow-sm group-hover:shadow-md transition-all duration-300 border border-gray-200 group-hover:border-transparent"
                >
                  View Analytics
                </button>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group cursor-pointer" onClick={() => router.push('/dashboard/instructor/courses')}>
                <div className="mx-auto w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-indigo-100 transition-all duration-300">
                  <AcademicCapIcon className="h-8 w-8 text-indigo-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-indigo-700 transition-colors">Course Insights</h3>
                <p className="text-gray-500 mb-6 font-medium text-sm">Check performance & feedback</p>
                <button 
                  className="w-full bg-gray-50/50 group-hover:bg-gradient-to-br from-indigo-600 via-blue-600 to-purple-700 text-indigo-600 group-hover:text-white py-2.5 rounded-xl font-bold shadow-sm group-hover:shadow-md transition-all duration-300 border border-gray-200 group-hover:border-transparent"
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