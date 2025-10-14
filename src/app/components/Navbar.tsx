'use client';

import { useState } from 'react';
import { Bars3Icon, XMarkIcon, BookOpenIcon } from '@heroicons/react/24/outline';
import { useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<{ name?: string; role?: string } | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode<{ name?: string; role?: string; exp?: number }>(token);
        setUser(decoded);
      } catch (error) {
        console.error('Token decoding error:', error);
        localStorage.removeItem('token');
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    window.location.href = '/auth/signin'; // Redirect to sign-in page after logout
  };

  return (
    <nav className="bg-white/80 backdrop-blur-md shadow-lg fixed w-full z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <BookOpenIcon className="h-8 w-8 text-purple-600 mr-2" />
            <span className="text-xl font-bold text-gray-900">LearnAI Hub</span>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <a href="#" className="text-gray-700 hover:text-purple-600">Courses</a>
            <a href="#" className="text-gray-700 hover:text-purple-600">About</a>
            {user ? (
              <>
                <span className="text-gray-700">Hello, {user.name}</span>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <a href="/auth/signin" className="text-gray-700 hover:text-purple-600">Login</a>
                <a href="/auth/signup" className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700">
                  Sign Up
                </a>
              </>
            )}
          </div>
          <div className="-mr-2 flex items-center md:hidden">
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-gray-700">
              {mobileMenuOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
            </button>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <a href="#" className="block px-3 py-2 text-gray-700 hover:text-purple-600">Courses</a>
              <a href="#" className="block px-3 py-2 text-gray-700 hover:text-purple-600">About</a>
              {user ? (
                <>
                  <span className="block px-3 py-2 text-gray-700">Hello, {user.name}</span>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-center px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <a href="/auth/signin" className="block px-3 py-2 text-gray-700 hover:text-purple-600">Login</a>
                  <a href="/auth/signup" className="block w-full text-center px-3 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700">
                    Sign Up
                  </a>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}