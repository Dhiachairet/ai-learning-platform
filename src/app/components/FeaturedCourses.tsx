import { StarIcon, PlayIcon, ClockIcon } from '@heroicons/react/24/solid';
import Image from 'next/image';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
const courses = [
  {
    title: 'Complete Web Development Bootcamp',
    level: 'Intermediate',
    category: 'Development',
    price: '$89',
    duration: '12 weeks',
    rating: 4.8,
    instructor: 'Sarah Johnson',
    image: '/placeholder-web.jpg',  // Add images to public/
    description: 'Learn HTML, CSS, JavaScript, React, Node.js, and MongoDB. Build real-world projects and become a full-stack developer.',
  },
  {
    title: 'Data Science with Python',
    level: 'Advanced',
    category: 'Data Science',
    price: '$129',
    duration: '10 weeks',
    rating: 4.9,
    instructor: 'Dr. Michael Chen',
    image: '/placeholder-data.jpg',
    description: 'Master data analysis, visualization, and machine learning with Python. Work with real datasets and build predictive models.',
  },
  {
    title: 'Digital Marketing Fundamentals',
    level: 'Beginner',
    category: 'Marketing',
    price: '$49',
    duration: '6 weeks',
    rating: 4.7,
    instructor: 'Emma Rodriguez',
    image: '/placeholder-marketing.jpg',
    description: 'Learn SEO, social media marketing, email campaigns, and analytics. Develop effective marketing strategies for any business.',
  },
];

export default function FeaturedCourses() {
  return (
    <div className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-16">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Featured Courses</h2>
            <p className="text-xl text-gray-600 mt-2">Discover our most popular courses taught by industry experts</p>
          </div>
          <a href="/courses" className="text-purple-600 hover:underline flex items-center">
            View All Courses <ArrowRightIcon className="ml-2 h-5 w-5" />
          </a>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {courses.map((course, idx) => (
            <div key={idx} className="bg-gray-50 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow">
              <div className="relative h-48 bg-gray-200">
                <Image src={course.image} alt={course.title} fill className="object-cover" />
              </div>
              <div className="p-6">
                <div className="flex justify-between items-center mb-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    course.level === 'Beginner' ? 'bg-green-100 text-green-800' :
                    course.level === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {course.level}
                  </span>
                  <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">{course.category}</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{course.title}</h3>
                <p className="text-gray-600 mb-4">{course.description}</p>
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center">
                    <span className="text-lg font-bold text-gray-900">{course.price}</span>
                    <div className="ml-4 flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <StarIcon key={i} className={`h-4 w-4 ${i < course.rating ? 'text-yellow-400' : 'text-gray-300'}`} />
                      ))}
                      <span className="ml-1 text-sm text-gray-600">({course.rating})</span>
                    </div>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <ClockIcon className="h-4 w-4 mr-1" />
                    {course.duration}
                  </div>
                </div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-gray-500">By {course.instructor}</span>
                </div>
                <a
                  href="#"
                  className="w-full block text-center py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition"
                >
                  View Course
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}