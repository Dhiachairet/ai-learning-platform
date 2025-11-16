'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

export default function SelectRole() {
  const [role, setRole] = useState<'student' | 'instructor' | ''>('');
  const [educationLevel, setEducationLevel] = useState('');
  const [expertiseArea, setExpertiseArea] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      router.push('/auth/signin');
    }
  }, [token, router]);

  const handleRoleSelection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role || !token) return;

    setIsLoading(true);
    try {
      // ✅ FIX: Use the correct API endpoint
      const response = await fetch('/auth/api/update-role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          role,
          educationLevel: role === 'student' ? educationLevel : undefined,
          expertiseArea: role === 'instructor' ? expertiseArea : undefined
        }),
      });

      const result = await response.json();

    // In your handleRoleSelection function, update the success part:
if (response.ok) {
  localStorage.setItem('token', result.token);
  
  // ✅ Redirect based on selected role
  if (role === 'instructor') {
    router.push('/dashboard/instructor');
  } else {
    router.push('/'); // Student goes to homepage
  }
}
    } catch (error) {
      setMessage('An error occurred. Please try again.');
      console.error('Role selection error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-900">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Choose Your Role
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Please select how you'd like to use the platform
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleRoleSelection}>
          {/* Role Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-4">
              I want to:
            </label>
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  id="student"
                  name="role"
                  type="radio"
                  value="student"
                  checked={role === 'student'}
                  onChange={(e) => setRole(e.target.value as 'student')}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                />
                <label htmlFor="student" className="ml-3 block text-sm font-medium text-gray-700">
                  Learn courses as a Student
                </label>
              </div>

              <div className="flex items-center">
                <input
                  id="instructor"
                  name="role"
                  type="radio"
                  value="instructor"
                  checked={role === 'instructor'}
                  onChange={(e) => setRole(e.target.value as 'instructor')}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                />
                <label htmlFor="instructor" className="ml-3 block text-sm font-medium text-gray-700">
                  Teach courses as an Instructor
                </label>
              </div>
            </div>
          </div>

          {/* Student Fields */}
          {role === 'student' && (
            <div>
              <label htmlFor="educationLevel" className="block text-sm font-medium text-gray-700">
                Current Education Level
              </label>
              <select
                id="educationLevel"
                value={educationLevel}
                onChange={(e) => setEducationLevel(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option value="">Select Level</option>
                <option value="high-school">High School</option>
                <option value="undergraduate">Undergraduate</option>
                <option value="postgraduate">Postgraduate</option>
                <option value="self-learner">Self-Learner</option>
              </select>
            </div>
          )}

          {/* Instructor Fields */}
          {role === 'instructor' && (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Expertise Areas (Optional)
              </label>
              <div className="mt-2 space-y-2">
                {['Development', 'Data Science', 'Design', 'Marketing', 'Business'].map((category) => (
                  <div key={category} className="flex items-center">
                    <input
                      type="checkbox"
                      value={category.toLowerCase().replace(' ', '-')}
                      checked={expertiseArea.includes(category.toLowerCase().replace(' ', '-'))}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setExpertiseArea([...expertiseArea, e.target.value]);
                        } else {
                          setExpertiseArea(expertiseArea.filter(item => item !== e.target.value));
                        }
                      }}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 text-sm text-gray-700">{category}</label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {message && (
            <div className={`text-sm text-center ${
              message.includes('Error') ? 'text-red-600' : 'text-green-600'
            }`}>
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={!role || isLoading}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Setting up your account...' : 'Continue'}
          </button>
        </form>
      </div>
    </div>
  );
}