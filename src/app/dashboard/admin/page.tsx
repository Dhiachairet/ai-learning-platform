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
  const [userName, setUserName] = useState('Admin');
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
        if (payload.name) {
          setUserName(payload.name);
        }
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
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-gradient-to-b from-indigo-900 to-indigo-950 border-r border-indigo-800/50 shadow-2xl relative px-6 pb-4">
          {/* Subtle Grid Overlay */}
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5 pointer-events-none"></div>

          <div className="flex h-16 shrink-0 items-center relative z-10">
            <h1 className="text-2xl font-bold text-white tracking-tight">LearnAI Hub</h1>
            <span className="ml-2 px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 text-xs font-medium border border-indigo-400/20">
              Admin
            </span>
          </div>
          <nav className="flex flex-1 flex-col relative z-10">
            <ul className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul className="-mx-2 space-y-2">
                  {navigation.map((item) => (
                    <li key={item.name}>
                      <button
                        onClick={() => router.push(item.href)}
                        className={`flex items-center w-full p-3 rounded-xl transition-all duration-300 group ${
                          item.current 
                            ? 'bg-indigo-600/40 text-white shadow-inner border border-indigo-500/30' 
                            : 'text-indigo-200 hover:bg-indigo-800/30 hover:text-white hover:-translate-y-0.5'
                        }`}
                      >
                        <item.icon className="h-5 w-5 mr-3 text-indigo-400 group-hover:text-indigo-300" />
                        {item.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </li>
              
              <li className="mt-auto space-y-4">
                {/* User Profile Widget */}
                <div className="p-4 bg-indigo-900/50 border border-indigo-800/50 rounded-2xl backdrop-blur-sm flex items-center gap-3 shadow-inner">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg ring-2 ring-indigo-400/20">
                    {userName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{userName}</p>
                    <p className="text-xs text-indigo-300 truncate">Administrator</p>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="flex items-center justify-center w-full p-3 text-red-50 bg-red-950/30 border border-red-900/50 rounded-xl hover:bg-red-600 hover:border-red-500 transition-all duration-300 group shadow-sm hover:shadow-red-600/20"
                >
                  <ShieldCheckIcon className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                  <span className="font-semibold tracking-wide">Logout</span>
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-80">
        {/* Top bar */}
        <div className="sticky top-0 z-40 flex h-20 shrink-0 items-center gap-x-4 border-b border-gray-100 bg-white/80 backdrop-blur-xl px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8 transition-all duration-300">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-700 lg:hidden hover:bg-gray-50 rounded-lg transition-colors"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          </button>

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6 justify-end">
            <div className="flex items-center gap-x-6">
              {/* Profile Dropdown Area */}
              <div className="flex items-center gap-x-4 bg-indigo-50/50 py-1.5 px-2.5 rounded-2xl border border-indigo-100/50">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-sm ring-2 ring-white">
                  {userName.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-semibold text-indigo-950 pr-2">{userName}</span>
              </div>
              
              <button 
                onClick={handleLogout}
                className="text-sm font-semibold text-red-600 bg-red-50 border border-red-100 px-4 py-2 rounded-xl hover:bg-red-500 hover:text-white transition-all duration-300 shadow-sm hover:shadow-red-500/20"
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
            <div className="bg-gradient-to-br from-indigo-600 via-blue-600 to-purple-700 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
              <div className="absolute -top-10 -right-10 opacity-10">
                <ChartBarIcon className="w-64 h-64" />
              </div>
              <div className="relative z-10">
                <h1 className="text-3xl font-extrabold mb-2 tracking-tight">Admin Overview</h1>
                <p className="text-blue-100 text-lg font-medium">
                  Welcome back! Manage your platform efficiently.
                </p>
                {stats && (
                  <div className="flex flex-wrap items-center mt-6 gap-4">
                    <div className="flex items-center bg-white/20 px-4 py-2 rounded-full backdrop-blur-md border border-white/10 shadow-sm">
                      <CheckCircleIcon className="h-5 w-5 text-green-300 mr-2" />
                      <span className="text-sm font-semibold tracking-wide">System Operational</span>
                    </div>
                    <div className="flex items-center bg-white/10 px-4 py-2 rounded-full backdrop-blur-md border border-white/5">
                      <ClockIcon className="h-5 w-5 text-blue-100 mr-2" />
                      <span className="text-sm font-medium">
                        Last updated: {new Date().toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Stats Grid - Show real data or loading state */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {!stats ? (
                // Loading skeletons
                Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-pulse">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
                        <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                      </div>
                      <div className="rounded-xl bg-gray-100 h-12 w-12"></div>
                    </div>
                  </div>
                ))
              ) : (
                // Actual stats cards
                [
                  { name: 'Total Users', value: stats.totalUsers, icon: UsersIcon, color: 'blue' },
                  { name: 'Total Courses', value: stats.totalCourses, icon: BookOpenIcon, color: 'green' },
                  { name: 'Instructors', value: stats.totalInstructors, icon: UserGroupIcon, color: 'indigo' },
                  { name: 'Review Pending', value: stats.pendingApprovals, icon: DocumentCheckIcon, color: 'amber' },
                ].map((item) => (
                  <div key={item.name} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-1">{item.name}</p>
                        <p className="text-3xl font-extrabold text-gray-900">{item.value.toLocaleString()}</p>
                      </div>
                      <div className={`p-3 rounded-xl bg-${item.color}-50 ring-1 ring-${item.color}-100/50 shadow-inner`}>
                        <item.icon className={`h-7 w-7 text-${item.color}-600`} />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              {/* Recent Activity */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 lg:col-span-2 overflow-hidden">
                <div className="px-8 py-6 border-b border-gray-100 bg-gray-50/50">
                  <h3 className="text-lg font-bold text-gray-900">Recent Activity Flow</h3>
                </div>
                <div className="p-8">
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
                    <div className="space-y-6">
                      {stats.recentActivities.map((activity) => (
                        <div key={activity.id} className="relative flex items-start group">
                          <div className={`absolute top-2 left-3 -ml-px h-full w-0.5 bg-gray-200 group-last:hidden`} aria-hidden="true"></div>
                          <div className="relative flex items-center justify-center h-6 w-6 rounded-full ring-4 ring-white shrink-0 mt-0.5">
                            <span className={`h-3 w-3 rounded-full shadow-sm ${
                              activity.type === 'user' ? 'bg-indigo-500' : 
                              activity.type === 'course' ? 'bg-emerald-500' : 'bg-fuchsia-500'
                            }`} />
                          </div>
                          
                          <div className="ml-6 flex-1 bg-white border border-gray-100 shadow-sm group-hover:shadow-md transition-shadow rounded-xl p-4">
                            <div className="flex flex-col sm:flex-row sm:justify-between">
                              <p className="text-sm font-semibold text-gray-900">{activity.action}</p>
                              <div className="text-xs font-medium text-gray-400 mt-1 sm:mt-0 flex items-center">
                                <ClockIcon className="h-3 w-3 mr-1" />
                                {formatTime(activity.time)}
                              </div>
                            </div>
                            <p className="text-sm text-gray-500 mt-1 flex items-center">
                              <UsersIcon className="h-4 w-4 mr-1 text-gray-300" />
                              Initiated by <span className="font-semibold text-gray-700 ml-1">{activity.user}</span>
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                      <ClockIcon className="h-12 w-12 text-gray-300 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900">No activity yet</h3>
                      <p className="mt-1 text-sm text-gray-500">Wait for users to start engaging with the platform.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="space-y-6 lg:col-span-1">
                <div className="bg-gradient-to-br from-white to-gray-50 p-8 rounded-2xl shadow-sm border border-gray-100 text-center hover:shadow-lg transition-all duration-300 group">
                  <div className="mx-auto bg-indigo-50 w-20 h-20 rounded-full flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                    <UsersIcon className="h-10 w-10 text-indigo-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Network Control</h3>
                  <p className="text-gray-500 text-sm mb-6 px-2">Access the global registry to oversee user profiles and permissions.</p>
                  <button 
                    onClick={() => handleQuickAction('/dashboard/admin/users')}
                    className="w-full bg-indigo-600 text-white font-semibold py-3 px-4 rounded-xl hover:bg-indigo-700 hover:shadow-md transition-all active:scale-95"
                  >
                    Open Directory
                  </button>
                </div>

                <div className="bg-gradient-to-br from-white to-orange-50 p-8 rounded-2xl shadow-sm border border-orange-100/50 text-center hover:shadow-lg transition-all duration-300 group">
                  <div className="mx-auto bg-orange-100 w-20 h-20 rounded-full flex items-center justify-center mb-5 group-hover:scale-110 transition-transform relative">
                    <DocumentCheckIcon className="h-10 w-10 text-orange-600" />
                    {stats && stats.pendingApprovals > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-sm ring-2 ring-white">
                        {stats.pendingApprovals}
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Publish Queue</h3>
                  <p className="text-gray-500 text-sm mb-6 px-2">
                    {stats 
                      ? (stats.pendingApprovals > 0 ? `${stats.pendingApprovals} pending submissions require vetting.` : 'All course structures are processed.') 
                      : 'Review and approve new courses'}
                  </p>
                  <button 
                    onClick={() => handleQuickAction('/dashboard/admin/courses')}
                    className="w-full bg-amber-500 text-white font-semibold py-3 px-4 rounded-xl hover:bg-amber-600 hover:shadow-md transition-all active:scale-95"
                  >
                    Moderate Content
                  </button>
                </div>
              </div>
            </div>

            {/* System Overview */}
            {stats && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-8 py-5 border-b border-gray-100 bg-gray-50/50">
                  <h3 className="text-lg font-bold text-gray-900 tracking-tight">System Telemetry</h3>
                </div>
                <div className="p-8">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="text-center p-6 bg-emerald-50/50 rounded-2xl border border-emerald-100/50 hover:bg-emerald-50 transition-colors">
                      <div className="text-3xl font-black text-emerald-700 tracking-tighter">{stats.systemOverview.uptime}</div>
                      <div className="text-xs font-bold uppercase tracking-widest text-emerald-600/70 mt-2">Uptime</div>
                    </div>
                    <div className="text-center p-6 bg-sky-50/50 rounded-2xl border border-sky-100/50 hover:bg-sky-50 transition-colors">
                      <div className="text-3xl font-black text-sky-700 tracking-tighter">{stats.systemOverview.storageUsed}</div>
                      <div className="text-xs font-bold uppercase tracking-widest text-sky-600/70 mt-2">Storage Volume</div>
                    </div>
                    <div className="text-center p-6 bg-fuchsia-50/50 rounded-2xl border border-fuchsia-100/50 hover:bg-fuchsia-50 transition-colors">
                      <div className="text-3xl font-black text-fuchsia-700 tracking-tighter">{stats.systemOverview.activeSessions}</div>
                      <div className="text-xs font-bold uppercase tracking-widest text-fuchsia-600/70 mt-2">Active Streams</div>
                    </div>
                    <div className="text-center p-6 bg-slate-50/50 rounded-2xl border border-slate-100/50 hover:bg-slate-100 transition-colors">
                      <div className="text-3xl font-black text-slate-700 tracking-tighter">{stats.systemOverview.systemAlerts}</div>
                      <div className="text-xs font-bold uppercase tracking-widest text-slate-500 mt-2">Core Alerts</div>
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