import { ArrowRightIcon, UsersIcon, AcademicCapIcon, BookOpenIcon, CheckBadgeIcon } from '@heroicons/react/24/outline';

const stats = [
  { icon: UsersIcon, label: '50K+', description: 'Students' },
  { icon: AcademicCapIcon, label: '200+', description: 'Courses' },
  { icon: BookOpenIcon, label: '1000+', description: 'Lessons' },
  { icon: CheckBadgeIcon, label: '95%', description: 'Satisfaction' },
];

export default function Hero() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-indigo-500 to-purple-600">
      <div className="absolute inset-0 bg-black/10" />
      <div className="relative max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white sm:text-5xl lg:text-6xl mb-6">
            Learn Without <span className="text-emerald-300">Limits</span>
          </h1>
          <p className="mx-auto max-w-3xl text-xl text-indigo-100 mb-8">
            Join thousands of learners mastering new skills with expert-led courses, interactive projects, and a supportive community. Start your learning journey today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <a
              href="/auth/signup"
              className="inline-flex items-center px-8 py-3 bg-white text-indigo-600 font-medium rounded-md hover:bg-gray-100 transition"
            >
              Get Started Free <ArrowRightIcon className="ml-2 h-5 w-5" />
            </a>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16">
          {stats.map((stat, idx) => (
            <div key={idx} className="text-center text-white">
              <stat.icon className="mx-auto h-12 w-12 text-emerald-300 mb-2" />
              <div className="text-3xl font-bold">{stat.label}</div>
              <div className="text-indigo-100">{stat.description}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}