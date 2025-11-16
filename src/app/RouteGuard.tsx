'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function RouteGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuthAndRole = async () => {
      setIsChecking(true);
      
      // Wait a bit to ensure localStorage is updated
      await new Promise(resolve => setTimeout(resolve, 100));

      const token = localStorage.getItem('token');
      
      // If no token and trying to access protected routes, redirect to login
      if (!token) {
        if (pathname.startsWith('/dashboard') || pathname.startsWith('/admin')) {
          router.push('/auth/signin');
        }
        setIsChecking(false);
        return;
      }

      try {
        // Decode JWT token to get user data
        const payload = JSON.parse(atob(token.split('.')[1]));
        const userRole = payload.role;

        console.log('RouteGuard: User role:', userRole, 'Path:', pathname);

        // Route protection based on roles
        if (pathname.startsWith('/dashboard/instructor') && userRole !== 'instructor') {
          console.log('Redirecting student away from instructor dashboard');
          router.push('/');
          return;
        }

        if (pathname.startsWith('/dashboard/admin') && userRole !== 'admin') {
          router.push('/');
          return;
        }

        // If user has a role and is on auth pages, redirect to appropriate page
        if ((pathname === '/auth/signin' || pathname === '/auth/signup') && userRole) {
          console.log('Redirecting authenticated user from auth page');
          if (userRole === 'instructor') {
            router.push('/dashboard/instructor');
          } else if (userRole === 'admin') {
            router.push('/dashboard/admin');
          } else {
            router.push('/');
          }
          return;
        }

      } catch (error) {
        console.error('Token validation error:', error);
        localStorage.removeItem('token');
        if (pathname.startsWith('/dashboard') || pathname.startsWith('/admin')) {
          router.push('/auth/signin');
        }
      } finally {
        setIsChecking(false);
      }
    };

    checkAuthAndRole();
  }, [pathname, router]);

  // Show loading while checking auth
  if (isChecking && (pathname.startsWith('/dashboard') || pathname.startsWith('/admin'))) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-900">Loading...</div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}