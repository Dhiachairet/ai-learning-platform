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
import Footer from '../components/Footer';

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
        <section className="container mx-auto px-4 mb-8">
          <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-800 to-purple-600 tracking-tight">Explore Courses</h1>

          <div className="mt-8 max-w-2xl">
            <div className="relative group">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
              <input
                type="text"
                placeholder="Search courses..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 shadow-sm hover:shadow-md transition-all font-medium text-lg"
              />
            </div>
          </div>
        </section>

        {/* Filters + Grid */}
        <section className="container mx-auto px-4 pb-16">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filters Sidebar */}
            <aside className="lg:w-64 flex-shrink-0">
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-sm border border-gray-100 p-6 sticky top-28 transition-all hover:shadow-md">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center tracking-tight">
                    <FunnelIcon className="h-5 w-5 mr-2 text-indigo-600" /> Filters
                  </h3>
                  <button 
                    className="text-indigo-600 hover:text-indigo-800 text-sm font-medium transition-colors"
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
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-2xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer font-medium appearance-none"
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
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Level</label>
                  <select
                    value={selectedLevel}
                    onChange={(e) => setSelectedLevel(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-2xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer font-medium appearance-none"
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
              <div className="flex justify-between items-center mb-6 bg-white/60 backdrop-blur-sm p-4 rounded-3xl border border-gray-100 shadow-sm">
                <p className="text-gray-600 font-medium pl-2">
                  <strong className="text-indigo-600 text-lg">{filteredCourses.length}</strong> courses found
                </p>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-5 py-2.5 bg-white border border-gray-200 rounded-2xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium cursor-pointer shadow-sm hover:shadow transition-all appearance-none"
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
                        className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100 flex flex-col"
                      >
                        <div className="h-48 bg-gradient-to-br from-indigo-500 to-purple-600 relative overflow-hidden">
                          {course.thumbnail ? (
                            <Image 
                              src={course.thumbnail} 
                              alt={course.title} 
                              fill 
                              className="object-cover transform transition-transform duration-500 group-hover:scale-105"
                              onError={(e) => {
                                // Fallback if image fails to load
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center transform transition-transform duration-500 group-hover:scale-105">
                              <BookOpenIcon className="h-12 w-12 text-indigo-300" />
                            </div>
                          )}
                          <span
                            className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold text-white backdrop-blur-md shadow-sm ${
                              course.level === 'beginner'
                                ? 'bg-emerald-500/90'
                                : course.level === 'intermediate'
                                ? 'bg-yellow-500/90'
                                : 'bg-red-500/90'
                            }`}
                          >
                            {course.level.charAt(0).toUpperCase() + course.level.slice(1)}
                          </span>
                          <span className="absolute top-3 left-3 px-3 py-1 bg-white/90 text-indigo-700 backdrop-blur-md shadow-sm text-xs font-bold rounded-full border border-white/20">
                            {course.category}
                          </span>
                        </div>

                        <div className="p-6 flex flex-col flex-1">
                          <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors line-clamp-1">{course.title}</h3>
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{course.description}</p>

                          <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                            <span>
                              <ClockIcon className="inline h-4 w-4 mr-1" />
                              Self-paced
                            </span>
                            
                          </div>

                          <div className="flex items-center mb-6 mt-auto">
                            <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm ring-2 ring-white">
                              {course.instructor.name
                                .split(' ')
                                .map((n) => n[0])
                                .join('')}
                            </div>
                            <span className="ml-3 text-sm font-medium text-gray-700">{course.instructor.name}</span>
                          </div>

                         <button 
  onClick={() => router.push(`/courses/${course._id}`)}
  className="w-full bg-indigo-50 text-indigo-700 py-3 rounded-xl hover:bg-indigo-600 hover:text-white transition-all duration-300 flex items-center justify-center font-semibold group-hover:shadow-md mt-auto"
>
  <PlayIcon className="h-5 w-5 mr-2" /> View Course
</button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-1 md:col-span-2 lg:col-span-3">
                      <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-sm border border-gray-100 p-16 text-center">
                        <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6">
                          <BookOpenIcon className="h-12 w-12 text-indigo-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-3 tracking-tight">No courses found</h3>
                        <p className="text-gray-500 max-w-md mx-auto text-lg">
                          {courses.length === 0 
                            ? "No courses available at the moment. Please check back later!" 
                            : "Try adjusting your search or filters to find what you're looking for."
                          }
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
           
          </div>
         
        </section>
         < Footer />
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