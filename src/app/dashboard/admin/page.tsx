'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  UsersIcon,
  BookOpenIcon,
  ChartBarIcon,
  CogIcon,
  ShieldCheckIcon,
  Bars3Icon,
  XMarkIcon,
  UserGroupIcon,
  AcademicCapIcon,
  DocumentCheckIcon,
} from '@heroicons/react/24/outline';

export default function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const initializeAuth = () => {
      const tokenFromUrl = searchParams.get('token');
      
      if (tokenFromUrl) {
        localStorage.setItem('token', tokenFromUrl);
        const newUrl = window.location.pathname;
        window.history.replaceState({}, '', newUrl);
      }

      const token = localStorage.getItem('token');
      
      if (!token) {
        router.push('/auth/signin');
        return;
      }

      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        
        // Check if user is admin
        if (payload.role !== 'admin') {
          router.push('/');
          return;
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Token decode error:', error);
        localStorage.removeItem('token');
        router.push('/auth/signin');
      }
    };

    initializeAuth();
  }, [router, searchParams]);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard/admin', icon: ChartBarIcon, current: true },
    { name: 'User Management', href: '/dashboard/admin/users', icon: UsersIcon, current: false },
    { name: 'Course Management', href: '/dashboard/admin/courses', icon: BookOpenIcon, current: false },
    { name: 'Approvals', href: '/dashboard/admin/approvals', icon: DocumentCheckIcon, current: false },
    { name: 'System Settings', href: '/dashboard/admin/settings', icon: CogIcon, current: false },
  ];

  const stats = [
    {
      name: 'Total Users',
      value: '2,458',
      change: '+18%',
      icon: UsersIcon,
      changeType: 'positive',
    },
    {
      name: 'Total Courses',
      value: '156',
      change: '+12',
      icon: BookOpenIcon,
      changeType: 'positive',
    },
    {
      name: 'Instructors',
      value: '48',
      change: '+5',
      icon: UserGroupIcon,
      changeType: 'positive',
    },
    {
      name: 'Pending Approvals',
      value: '23',
      change: '-8',
      icon: DocumentCheckIcon,
      changeType: 'negative',
    },
  ];

  const recentActivities = [
    { id: 1, action: 'New instructor registration', user: 'John Smith', time: '5 min ago', type: 'user' },
    { id: 2, action: 'Course submitted for review', user: 'Sarah Johnson', time: '12 min ago', type: 'course' },
    { id: 3, action: 'User account deactivated', user: 'Admin', time: '1 hour ago', type: 'system' },
    { id: 4, action: 'New student registered', user: 'Mike Chen', time: '2 hours ago', type: 'user' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/auth/signin');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
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
              <h1 className="text-2xl font-bold" style={{ color: '#667eea' }}>
                LearnAI Hub - Admin
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
            <h1 className="text-2xl font-bold" style={{ color: '#667eea' }}>
              LearnAI Hub - Admin
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
            {/* Welcome Header */}
            <div 
              className="rounded-2xl p-8 text-white"
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
              }}
            >
              <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
              <p className="text-blue-100 text-lg">
                Manage your platform and users efficiently.
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

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
              {/* Recent Activity */}
              <div className="bg-white shadow rounded-lg border border-gray-200">
                <div className="px-6 py-5 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {recentActivities.map((activity) => (
                      <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className={`flex-shrink-0 w-2 h-2 mt-2 rounded-full ${
                          activity.type === 'user' ? 'bg-blue-500' : 
                          activity.type === 'course' ? 'bg-green-500' : 'bg-purple-500'
                        }`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                          <p className="text-sm text-gray-500">by {activity.user}</p>
                        </div>
                        <div className="flex-shrink-0">
                          <p className="text-sm text-gray-400">{activity.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="space-y-6">
                <div className="bg-white p-6 shadow rounded-lg border border-gray-200 text-center hover:shadow-md transition-shadow">
                  <UsersIcon className="h-12 w-12 mx-auto mb-4" style={{ color: '#667eea' }} />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Manage Users</h3>
                  <p className="text-gray-600 mb-4">View and manage all platform users</p>
                  <button 
                    className="w-full text-white py-2 rounded-lg hover:opacity-90 transition-colors"
                    style={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                    }}
                  >
                    Manage Users
                  </button>
                </div>

                <div className="bg-white p-6 shadow rounded-lg border border-gray-200 text-center hover:shadow-md transition-shadow">
                  <DocumentCheckIcon className="h-12 w-12 mx-auto mb-4" style={{ color: '#667eea' }} />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Pending Approvals</h3>
                  <p className="text-gray-600 mb-4">Review and approve new courses</p>
                  <button 
                    className="w-full text-white py-2 rounded-lg hover:opacity-90 transition-colors"
                    style={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                    }}
                  >
                    Review Courses
                  </button>
                </div>
              </div>
            </div>

            {/* System Overview */}
            <div className="bg-white shadow rounded-lg border border-gray-200">
              <div className="px-6 py-5 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">System Overview</h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">98.5%</div>
                    <div className="text-sm text-gray-500">Uptime</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">2.4GB</div>
                    <div className="text-sm text-gray-500">Storage Used</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">1,204</div>
                    <div className="text-sm text-gray-500">Active Sessions</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">0</div>
                    <div className="text-sm text-gray-500">System Alerts</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}