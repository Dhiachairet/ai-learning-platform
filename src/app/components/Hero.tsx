import { ArrowRightIcon, UsersIcon, AcademicCapIcon, BookOpenIcon } from '@heroicons/react/24/outline';
import connectDB from '../lib/db';
import User from '../model/User';
import Course from '../model/Course';

export default async function Hero() {
  await connectDB();

  // Fetch real counts concurrently
  const [totalStudents, approvedCourses] = await Promise.all([
    User.countDocuments({ role: 'student' }),
    Course.find({ status: 'approved' }).select('materials').lean()
  ]);

  const totalCoursesCount = approvedCourses.length;
  const totalLessons = approvedCourses.reduce((acc: number, course: any) => acc + (course.materials?.length || 0), 0);

  // Provide realistic fallback if db is empty during testing
  const displayStudents = totalStudents > 0 ? totalStudents : '50K+';
  const displayCourses = totalCoursesCount > 0 ? totalCoursesCount : '200+';
  const displayLessons = totalLessons > 0 ? totalLessons : '1000+';

  const stats = [
    { icon: UsersIcon, label: displayStudents, description: 'Students' },
    { icon: AcademicCapIcon, label: displayCourses, description: 'Courses' },
    { icon: BookOpenIcon, label: displayLessons, description: 'Lessons' },
  ];

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5"></div>
      <div className="relative max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl lg:text-7xl mb-6 tracking-tight drop-shadow-sm">
            Learn Without <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Limits</span>
          </h1>
          <p className="mx-auto max-w-3xl text-xl text-gray-600 mb-8 font-medium leading-relaxed">
            Join thousands of learners mastering new skills with expert-led courses, interactive projects, and a supportive community. Start your learning journey today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <a
              href="/auth/signup"
              className="inline-flex items-center justify-center px-8 py-4 bg-indigo-600 text-white font-semibold rounded-2xl hover:bg-indigo-700 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              Get Started Free <ArrowRightIcon className="ml-2 h-5 w-5" />
            </a>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 max-w-4xl mx-auto gap-8 mt-16">
          {stats.map((stat, idx) => (
            <div key={idx} className="group text-center bg-white border border-indigo-100 p-6 rounded-3xl hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-500 shadow-sm">
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500">
                <stat.icon className="h-8 w-8 text-indigo-600" />
              </div>
              <div className="text-4xl font-extrabold tracking-tight mb-1 text-gray-900">{stat.label}</div>
              <div className="text-gray-500 font-bold text-sm uppercase tracking-wider">{stat.description}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}