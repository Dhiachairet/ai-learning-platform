'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  UsersIcon,
  BookOpenIcon,
  ChartBarIcon,
  CogIcon,
  ShieldCheckIcon,
  Bars3Icon,
  XMarkIcon,
  UserGroupIcon,
  DocumentCheckIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

// Define types for our statistics
interface DashboardStats {
  totalUsers: number;
  totalCourses: number;
  totalInstructors: number;
  pendingApprovals: number;
  recentActivities: Activity[];
  systemOverview: {
    uptime: string;
    storageUsed: string;
    activeSessions: number;
    systemAlerts: number;
  };
}

interface Activity {
  id: string;
  action: string;
  user: string;
  time: string;
  type: 'user' | 'course' | 'system';
}

export default function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Fetch dashboard statistics
  const fetchStats = async () => {
    try {
      setError(null);
      const response = await fetch('/dashboard/admin/api/stats');
      
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard statistics');
      }

      const data = await response.json();
      setStats(data);
    } catch (err) {
      console.error('Error fetching stats:', err);
      setError('Failed to load dashboard data. Please try again.');
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

        // Verify token and admin role (you'll implement this)
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.role !== 'admin') {
          router.push('/');
          return;
        }

        await fetchStats();
      } catch (error) {
        console.error('Auth error:', error);
        localStorage.removeItem('token');
        router.push('/auth/signin');
      }
    };

    checkAuth();
  }, [router]);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard/admin', icon: ChartBarIcon, current: true },
    { name: 'User Management', href: '/dashboard/admin/users', icon: UsersIcon, current: false },
    { name: 'Course Management', href: '/dashboard/admin/courses', icon: BookOpenIcon, current: false },
    { name: 'System Settings', href: '/dashboard/admin/settings', icon: CogIcon, current: false },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/auth/signin');
  };

  const handleQuickAction = (path: string) => {
    router.push(path);
  };

  // Format time for display
  const formatTime = (timeString: string) => {
    const time = new Date(timeString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
    return `${Math.floor(diffInMinutes / 1440)} days ago`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-lg font-semibold text-gray-900">Loading Admin Dashboard...</div>
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
              <h1 className="text-2xl font-bold text-blue-600">LearnAI Hub - Admin</h1>
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
              <button
                onClick={handleLogout}
                className="flex items-center w-full p-3 text-red-600 rounded-lg hover:bg-red-50 transition-colors mt-4"
              >
                <ShieldCheckIcon className="h-5 w-5 mr-3" />
                Logout
              </button>
            </nav>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-80 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-6 pb-4">
          <div className="flex h-16 shrink-0 items-center">
            <h1 className="text-2xl font-bold text-blue-600">LearnAI Hub - Admin</h1>
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
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full p-3 text-red-600 rounded-lg hover:bg-red-50 transition-colors group"
                >
                  <ShieldCheckIcon className="h-5 w-5 mr-3 text-red-400" />
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
          <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Bars3Icon className="h-6 w-6" />
          </button>

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6 justify-end">
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              <span className="text-sm text-gray-700">Admin</span>
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
            {/* Error Message */}
            {error && (
              <div className="rounded-md bg-red-50 p-4 border border-red-200">
                <div className="flex">
                  <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Error</h3>
                    <p className="text-sm text-red-700 mt-1">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Welcome Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-700 rounded-2xl p-8 text-white">
              <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
              <p className="text-blue-100 text-lg">
                Welcome back! Manage your platform efficiently.
              </p>
              {stats && (
                <div className="flex items-center mt-4 space-x-4">
                  <div className="flex items-center">
                    <CheckCircleIcon className="h-5 w-5 text-green-300 mr-2" />
                    <span className="text-sm">System Operational</span>
                  </div>
                  <div className="flex items-center">
                    <ClockIcon className="h-5 w-5 text-blue-200 mr-2" />
                    <span className="text-sm">
                      Last updated: {new Date().toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Stats Grid - Show real data or loading state */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {!stats ? (
                // Loading skeletons
                Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="bg-white rounded-lg shadow border border-gray-200 p-6 animate-pulse">
                    <div className="flex items-center">
                      <div className="rounded-full bg-gray-200 h-8 w-8"></div>
                      <div className="ml-4 flex-1">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                // Actual stats cards
                [
                  { name: 'Total Users', value: stats.totalUsers, icon: UsersIcon, color: 'blue' },
                  { name: 'Total Courses', value: stats.totalCourses, icon: BookOpenIcon, color: 'green' },
                  { name: 'Instructors', value: stats.totalInstructors, icon: UserGroupIcon, color: 'purple' },
                  { name: 'Pending Approvals', value: stats.pendingApprovals, icon: DocumentCheckIcon, color: 'orange' },
                ].map((item) => (
                  <div key={item.name} className="bg-white rounded-lg shadow border border-gray-200 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center">
                      <div className={`p-2 rounded-lg bg-${item.color}-100`}>
                        <item.icon className={`h-6 w-6 text-${item.color}-600`} />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">{item.name}</p>
                        <p className="text-2xl font-bold text-gray-900">{item.value.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
              {/* Recent Activity */}
              <div className="bg-white rounded-lg shadow border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                </div>
                <div className="p-6">
                  {!stats ? (
                    // Loading state
                    <div className="space-y-4">
                      {Array.from({ length: 3 }).map((_, index) => (
                        <div key={index} className="animate-pulse">
                          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      ))}
                    </div>
                  ) : stats.recentActivities.length > 0 ? (
                    <div className="space-y-4">
                      {stats.recentActivities.map((activity) => (
                        <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                          <div className={`w-2 h-2 mt-2 rounded-full ${
                            activity.type === 'user' ? 'bg-blue-500' : 
                            activity.type === 'course' ? 'bg-green-500' : 'bg-purple-500'
                          }`} />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                            <p className="text-sm text-gray-500">by {activity.user}</p>
                          </div>
                          <div className="text-sm text-gray-400">{formatTime(activity.time)}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">No recent activity</p>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-lg shadow border border-gray-200 text-center hover:shadow-md transition-shadow">
                  <UsersIcon className="h-12 w-12 mx-auto mb-4 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Manage Users</h3>
                  <p className="text-gray-600 mb-4">View and manage all platform users</p>
                  <button 
                    onClick={() => handleQuickAction('/dashboard/admin/users')}
                    className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Manage Users
                  </button>
                </div>

                <div className="bg-white p-6 rounded-lg shadow border border-gray-200 text-center hover:shadow-md transition-shadow">
                  <DocumentCheckIcon className="h-12 w-12 mx-auto mb-4 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Pending Approvals</h3>
                  <p className="text-gray-600 mb-4">
                    {stats ? `${stats.pendingApprovals} courses waiting for review` : 'Review and approve new courses'}
                  </p>
                  <button 
                    onClick={() => handleQuickAction('/dashboard/admin/approvals')}
                    className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Review Courses
                  </button>
                </div>
              </div>
            </div>

            {/* System Overview */}
            {stats && (
              <div className="bg-white rounded-lg shadow border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">System Overview</h3>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-xl font-bold text-green-900">{stats.systemOverview.uptime}</div>
                      <div className="text-sm text-green-700">Uptime</div>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-xl font-bold text-blue-900">{stats.systemOverview.storageUsed}</div>
                      <div className="text-sm text-blue-700">Storage Used</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-xl font-bold text-purple-900">{stats.systemOverview.activeSessions}</div>
                      <div className="text-sm text-purple-700">Active Sessions</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-xl font-bold text-gray-900">{stats.systemOverview.systemAlerts}</div>
                      <div className="text-sm text-gray-700">System Alerts</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}