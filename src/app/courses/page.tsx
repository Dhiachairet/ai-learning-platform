'use client';

import { useState } from 'react';
import Image from 'next/image';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  StarIcon,
  ClockIcon,
  PlayIcon,
} from '@heroicons/react/24/outline';
import Navbar from '../components/Navbar';

interface Course {
  id: string;
  title: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  category: string;
  duration: string;
  rating: number;
  students: string;
  instructor: string;
  image: string;
  description: string;
  features: string[];
}

const mockCourses: Course[] = [
  {
    id: '1',
    title: 'Complete Web Development Bootcamp',
    level: 'Intermediate',
    category: 'Development',
    duration: '12 weeks',
    rating: 4.8,
    students: '15,420',
    instructor: 'Sarah Johnson',
    image: '/images/placeholder-web.jpg',
    description: 'Learn HTML, CSS, JavaScript, React, Node.js, and MongoDB. Build real-world projects and become a full-stack developer.',
    features: ['Certificate included', 'Hands-on projects', 'Lifetime access', 'Mobile friendly'],
  },
  {
    id: '2',
    title: 'Data Science with Python',
    level: 'Advanced',
    category: 'Data Science',
    duration: '10 weeks',
    rating: 4.9,
    students: '8,930',
    instructor: 'Dr. Michael Chen',
    image: '/images/placeholder-data.jpg',
    description: 'Master data analysis, visualization, and machine learning with Python. Work with real datasets and build predictive models.',
    features: ['Certificate included', 'Hands-on projects', 'Lifetime access'],
  },
  {
    id: '3',
    title: 'Digital Marketing Fundamentals',
    level: 'Beginner',
    category: 'Marketing',
    duration: '6 weeks',
    rating: 4.7,
    students: '12,300',
    instructor: 'Emma Rodriguez',
    image: '/images/placeholder-marketing.jpg',
    description: 'Learn SEO, social media marketing, email campaigns, and analytics. Create effective marketing strategies for any business.',
    features: ['Certificate included', 'Lifetime access', 'Mobile friendly'],
  },
];

const categories = ['All Categories', 'Development', 'Data Science', 'Design', 'Marketing', 'Business'];
const levels = ['All Levels', 'Beginner', 'Intermediate', 'Advanced'];
const features = ['Certificate included', 'Hands-on projects', 'Lifetime access', 'Mobile friendly'];

export default function CourseCatalog() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedLevel, setSelectedLevel] = useState('All Levels');
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('Most Popular');

  const filteredCourses = mockCourses.filter((course) => {
    const matchesSearch = course.title.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'All Categories' || course.category === selectedCategory;
    const matchesLevel = selectedLevel === 'All Levels' || course.level === selectedLevel;
    const matchesFeatures =
      selectedFeatures.length === 0 || selectedFeatures.every((f) => course.features.includes(f));
    return matchesSearch && matchesCategory && matchesLevel && matchesFeatures;
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
                  <button className="text-indigo-600 hover:text-indigo-800 text-sm">
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

                {/* Features */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Features</label>
                  <div className="space-y-2">
                    {features.map((feat) => (
                      <label key={feat} className="flex items-center text-sm text-gray-700">
                        <input
                          type="checkbox"
                          checked={selectedFeatures.includes(feat)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedFeatures((prev) => [...prev, feat]);
                            } else {
                              setSelectedFeatures((prev) => prev.filter((f) => f !== feat));
                            }
                          }}
                          className="mr-2 h-4 w-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                        />
                        {feat}
                      </label>
                    ))}
                  </div>
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

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCourses.map((course) => (
                  <div
                    key={course.id}
                    className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                  >
                    <div className="h-48 bg-gradient-to-r from-indigo-500 to-purple-600 relative">
                      <Image src={course.image} alt={course.title} fill className="object-cover" />
                      <span
                        className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold text-white ${
                          course.level === 'Beginner'
                            ? 'bg-emerald-500'
                            : course.level === 'Intermediate'
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                        }`}
                      >
                        {course.level}
                      </span>
                      <span className="absolute top-3 left-3 px-3 py-1 bg-emerald-500 text-white text-xs font-bold rounded-full">
                        {course.category}
                      </span>
                    </div>

                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-800 mb-2">{course.title}</h3>
                      <p className="text-sm text-gray-600 mb-3">{course.description}</p>

                      <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                        <span>
                          <ClockIcon className="inline h-4 w-4 mr-1" />
                          {course.duration}
                        </span>
                        <span>
                          <StarIcon className="inline h-4 w-4 mr-1 text-yellow-400" />
                          {course.rating} ({course.students})
                        </span>
                      </div>

                      <div className="flex items-center mb-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {course.instructor
                            .split(' ')
                            .map((n) => n[0])
                            .join('')}
                        </div>
                        <span className="ml-3 text-sm text-gray-700">{course.instructor}</span>
                      </div>

                      {/* View Course Button – Full Width */}
                      <button className="w-full bg-indigo-600 text-white py-2.5 rounded-lg hover:bg-indigo-700 transition flex items-center justify-center">
                        <PlayIcon className="h-4 w-4 mr-2" /> View Course
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}