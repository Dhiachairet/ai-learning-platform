import { StarIcon, ClockIcon, UserIcon } from '@heroicons/react/24/solid';
import Image from 'next/image';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import connectDB from '../lib/db';
import Course from '../model/Course';

export default async function FeaturedCourses() {
  await connectDB();

  // Fetch approved courses from DB
  const coursesRaw = await Course.find({ status: 'approved' })
    .populate('instructor', 'name email')
    .sort({ createdAt: -1 })
    .limit(3)
    .lean();

  // Map to safely serializable info
  const courses = coursesRaw.map((course: any) => ({
    _id: course._id.toString(),
    title: course.title,
    level: course.level ? course.level.charAt(0).toUpperCase() + course.level.slice(1) : 'All Levels',
    category: course.category || 'General',
    price: course.price || 'Free',
    duration: course.materials && course.materials.length > 0 ? `${course.materials.length} Lessons` : '8 weeks',
    rating: 4.8, 
    instructor: course.instructor?.name || 'Expert Instructor',
    image: course.thumbnail || '/images/placeholder-web.jpg',
    description: course.description
  }));

  return (
    <div className="py-24 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col md:flex-row md:justify-between items-start md:items-end mb-16 gap-6">
          <div>
            <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-800 to-purple-600 tracking-tight mb-3">Featured Courses</h2>
            <p className="text-xl text-gray-500 font-medium">Discover our most popular courses taught by industry experts</p>
          </div>
          <Link href="/courses" className="text-indigo-600 hover:text-indigo-700 font-semibold flex items-center group transition-colors">
            View All Courses <ArrowRightIcon className="ml-2 h-5 w-5 transform group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
        
        {courses.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No courses available at the moment. Please check back later!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {courses.map((course) => (
              <div key={course._id} className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-2 border border-gray-100 flex flex-col">
                <div className="relative h-56 bg-gradient-to-br from-indigo-500 to-purple-600 overflow-hidden">
                  <Image 
                    src={course.image.startsWith('http') || course.image.startsWith('/') ? course.image : `/${course.image}`} 
                    alt={course.title} 
                    fill 
                    className="object-cover transform transition-transform duration-700 group-hover:scale-110" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
                <div className="p-8 flex flex-col flex-1 relative">
                  <div className="flex justify-between items-center mb-4 absolute -top-5 left-6 right-6">
                    <span className={`px-4 py-1.5 rounded-full text-xs font-bold shadow-md backdrop-blur-md border border-white/20 ${
                      course.level === 'Beginner' ? 'bg-emerald-500/90 text-white' :
                      course.level === 'Intermediate' ? 'bg-yellow-500/90 text-white' : 'bg-red-500/90 text-white'
                    }`}>
                      {course.level}
                    </span>
                    <span className="px-4 py-1.5 bg-white/95 text-indigo-700 backdrop-blur-md rounded-full text-xs font-bold shadow-md border border-gray-100">{course.category}</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mt-2 mb-3 group-hover:text-indigo-600 transition-colors leading-tight line-clamp-2">{course.title}</h3>
                  <p className="text-gray-500 mb-6 line-clamp-2 text-sm leading-relaxed">{course.description}</p>
                  <div className="flex justify-between items-center mb-6 pt-4 border-t border-gray-100 mt-auto">
                    <div className="flex items-center">
                      <span className="text-xl font-extrabold text-indigo-600">{course.price}</span>
                    </div>
                    <div className="flex items-center">
                      <div className="flex items-center bg-yellow-50 px-2 py-1 rounded-lg">
                        <StarIcon className="h-4 w-4 text-yellow-500" />
                        <span className="ml-1.5 text-sm font-bold text-yellow-700">{course.rating}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mb-8 text-sm font-medium text-gray-500">
                    <span className="flex items-center line-clamp-1"><UserIcon className="h-4 w-4 mr-2 flex-shrink-0" /> {course.instructor}</span>
                    <span className="flex items-center text-indigo-500 bg-indigo-50 px-2.5 py-1 rounded-lg flex-shrink-0"><ClockIcon className="h-4 w-4 mr-1.5" />{course.duration}</span>
                  </div>
                  <Link
                    href={`/courses/${course._id}`}
                    className="w-full text-center py-4 bg-indigo-50 text-indigo-700 rounded-xl hover:bg-indigo-600 hover:text-white transition-all duration-300 font-semibold group-hover:shadow-lg"
                  >
                    View Course Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}