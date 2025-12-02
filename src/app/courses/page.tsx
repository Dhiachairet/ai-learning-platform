'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  StarIcon,
  ClockIcon,
  PlayIcon,
  BookOpenIcon,
} from '@heroicons/react/24/outline';
import Navbar from '../components/Navbar';

interface Course {
  _id: string;
  title: string;
  description: string;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  status: "draft" | "pending" | "approved" | "rejected" | "reported";
  studentsEnrolled: number;
  createdAt: string;
  updatedAt: string;
  thumbnail?: string;
  materials: any[];
  instructor: {
    _id: string;
    name: string;
    email: string;
  };
}

const categories = ['All Categories', 'Programming', 'Data Science', 'Design', 'Business', 'Marketing', 'Music', 'Photography', 'Health & Fitness'];
const levels = ['All Levels', 'Beginner', 'Intermediate', 'Advanced'];



export default function CourseCatalog() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedLevel, setSelectedLevel] = useState('All Levels');
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('Most Popular');
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/auth/api/courses');
        
        if (!response.ok) {
          throw new Error('Failed to fetch courses');
        }
        
        const data = await response.json();
        console.log('Fetched courses data:', data);
        
        // The API already returns only approved courses, so no need to filter again
        setCourses(data.courses || []);
        
        console.log('Courses set:', data.courses);
      } catch (error) {
        console.error('Error fetching courses:', error);
        setCourses([]); // Set empty array on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const filteredCourses = courses.filter((course) => {
    const matchesSearch = course.title.toLowerCase().includes(search.toLowerCase()) || 
                         course.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'All Categories' || course.category === selectedCategory;
    const matchesLevel = selectedLevel === 'All Levels' || 
                        course.level.toLowerCase() === selectedLevel.toLowerCase();
    
    return matchesSearch && matchesCategory && matchesLevel;
  });

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <main className="pt-20 lg:pt-24">
        {/* Header + Search */}
        <section className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-gray-800">Explore Courses</h1>

          <div className="mt-8 max-w-2xl">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search courses..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </section>

        {/* Filters + Grid */}
        <section className="container mx-auto px-4 pb-16">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filters Sidebar */}
            <aside className="lg:w-64">
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                    <FunnelIcon className="h-5 w-5 mr-2 text-indigo-600" /> Filters
                  </h3>
                  <button 
                    className="text-indigo-600 hover:text-indigo-800 text-sm"
                    onClick={() => {
                      setSelectedCategory('All Categories');
                      setSelectedLevel('All Levels');
                      setSelectedFeatures([]);
                      setSearch('');
                    }}
                  >
                    Clear Filters
                  </button>
                </div>

                {/* Category */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Level */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Level</label>
                  <select
                    value={selectedLevel}
                    onChange={(e) => setSelectedLevel(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {levels.map((lvl) => (
                      <option key={lvl} value={lvl}>
                        {lvl}
                      </option>
                    ))}
                  </select>
                </div>

           
                
              </div>
            </aside>

            {/* Course Grid */}
            <div className="flex-1">
              <div className="flex justify-between items-center mb-6">
                <p className="text-gray-600">
                  <strong>{filteredCourses.length}</strong> courses found
                </p>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option>Most Popular</option>
                  <option>Highest Rated</option>
                  <option>Newest</option>
                </select>
              </div>

            
             
              {isLoading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredCourses.length > 0 ? (
                    filteredCourses.map((course) => (
                      <div
                        key={course._id}
                        className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                      >
                        <div className="h-48 bg-gradient-to-r from-indigo-500 to-purple-600 relative">
                          {course.thumbnail ? (
                            <Image 
                              src={course.thumbnail} 
                              alt={course.title} 
                              fill 
                              className="object-cover"
                              onError={(e) => {
                                // Fallback if image fails to load
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                              <BookOpenIcon className="h-12 w-12 text-gray-400" />
                            </div>
                          )}
                          <span
                            className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold text-white ${
                              course.level === 'beginner'
                                ? 'bg-emerald-500'
                                : course.level === 'intermediate'
                                ? 'bg-yellow-500'
                                : 'bg-red-500'
                            }`}
                          >
                            {course.level.charAt(0).toUpperCase() + course.level.slice(1)}
                          </span>
                          <span className="absolute top-3 left-3 px-3 py-1 bg-indigo-500 text-white text-xs font-bold rounded-full">
                            {course.category}
                          </span>
                        </div>

                        <div className="p-6">
                          <h3 className="text-xl font-bold text-gray-800 mb-2">{course.title}</h3>
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{course.description}</p>

                          <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                            <span>
                              <ClockIcon className="inline h-4 w-4 mr-1" />
                              Self-paced
                            </span>
                            <span>
                              <StarIcon className="inline h-4 w-4 mr-1 text-yellow-400" />
                              {course.studentsEnrolled} students
                            </span>
                          </div>

                          <div className="flex items-center mb-4">
                            <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                              {course.instructor.name
                                .split(' ')
                                .map((n) => n[0])
                                .join('')}
                            </div>
                            <span className="ml-3 text-sm text-gray-700">{course.instructor.name}</span>
                          </div>

                         <button 
  onClick={() => router.push(`/courses/${course._id}`)}
  className="w-full bg-indigo-600 text-white py-2.5 rounded-lg hover:bg-indigo-700 transition flex items-center justify-center"
>
  <PlayIcon className="h-4 w-4 mr-2" /> View Course
</button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-3 text-center py-12">
                      <BookOpenIcon className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">No courses found</h3>
                      <p className="text-gray-600">
                        {courses.length === 0 
                          ? "No courses available at the moment." 
                          : "Try adjusting your search or filters."
                        }
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <style jsx>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}