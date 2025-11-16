'use client';
import { useState, useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { Bars3Icon, XMarkIcon, BookOpenIcon } from '@heroicons/react/24/outline';
import { jwtDecode } from 'jwt-decode';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<{ name?: string; role?: string } | null>(null);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const checkAuth = () => {
      const tokenFromUrl = searchParams.get('token');
      
      // ✅ Save token from URL if present (for Google OAuth)
      if (tokenFromUrl) {
        localStorage.setItem('token', tokenFromUrl);
        // Remove token from URL without reload
        const newUrl = window.location.pathname;
        window.history.replaceState({}, '', newUrl);
      }

      const token = localStorage.getItem('token');
      if (token) {
        try {
          const decoded = jwtDecode<{ name?: string; role?: string; exp?: number }>(token);
          
          // ✅ Check if token is expired
          if (decoded.exp && Date.now() >= decoded.exp * 1000) {
            localStorage.removeItem('token');
            setUser(null);
          } else {
            setUser(decoded);
          }
        } catch (error) {
          console.error('Token decoding error:', error);
          localStorage.removeItem('token');
          setUser(null);
        }
      } else {
        setUser(null);
      }
    };

    checkAuth();
  }, [pathname, searchParams]); // ✅ Re-run when route or URL params change

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    window.location.href = '/auth/signin';
  };

  return (
    <nav className="bg-white/80 backdrop-blur-md shadow-lg fixed w-full z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <BookOpenIcon className="h-8 w-8 text-indigo-600 mr-2" />
            <span className="text-xl font-bold text-gray-800">LearnAI Hub</span>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <a href="/courses" className="text-gray-700 hover:text-indigo-600">Courses</a>
            <a href="#" className="text-gray-700 hover:text-indigo-600">About</a>
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-gray-700">Hello, {user.name}</span>
                {user.role === 'instructor' && (
                  <a 
                    href="/dashboard/instructor" 
                    className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200 text-sm"
                  >
                    Instructor Dashboard
                  </a>
                )}
                {user.role === 'admin' && (
                  <a 
                    href="/dashboard/admin" 
                    className="px-3 py-1 bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 text-sm"
                  >
                    Admin Dashboard
                  </a>
                )}
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 text-sm"
                >
                  Logout
                </button>
              </div>
            ) : (
              <>
                <a href="/auth/signin" className="text-gray-700 hover:text-indigo-600">Login</a>
                <a href="/auth/signup" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
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
              <a href="/courses" className="block px-3 py-2 text-gray-700 hover:text-indigo-600">Courses</a>
              <a href="#" className="block px-3 py-2 text-gray-700 hover:text-indigo-600">About</a>
              {user ? (
                <div className="space-y-2">
                  <span className="block px-3 py-2 text-gray-700">Hello, {user.name}</span>
                  {user.role === 'instructor' && (
                    <a 
                      href="/dashboard/instructor" 
                      className="block px-3 py-2 bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200"
                    >
                      Instructor Dashboard
                    </a>
                  )}
                  {user.role === 'admin' && (
                    <a 
                      href="/dashboard/admin" 
                      className="block px-3 py-2 bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200"
                    >
                      Admin Dashboard
                    </a>
                  )}
                  <button
                    onClick={handleLogout}
                    className="block w-full text-center px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <a href="/auth/signin" className="block px-3 py-2 text-gray-700 hover:text-indigo-600">Login</a>
                  <a href="/auth/signup" className="block w-full text-center px-3 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                    Sign Up
                  </a>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}