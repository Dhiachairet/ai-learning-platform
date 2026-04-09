import { PlayIcon, UserIcon, ChatBubbleLeftIcon, TrophyIcon } from '@heroicons/react/24/outline';

const features = [
  {
    icon: PlayIcon,
    title: 'Interactive Learning',
    description: 'Engage with hands-on projects, quizzes, and real-world assignments that reinforce your learning.',
  },
  {
    icon: UserIcon,
    title: 'Expert Instructors',
    description: 'Learn from industry professionals with years of experience in their respective fields.',
  },
  {
    icon: ChatBubbleLeftIcon,
    title: 'AI Chatbot Tutor',
    description: 'Get real-time, context-aware answers to your questions powered by Gemini API.',
  },
  {
    icon: TrophyIcon,
    title: 'Smart Recommendations',
    description: 'Discover personalized courses based on your progress, interests, and similar learners.',
  },
];

export default function WhyChooseUs() {
  return (
    <div className="py-24 bg-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.02]"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-20">
          <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-800 to-purple-600 tracking-tight">Why Choose LearnAI Hub?</h2>
          <p className="mt-5 text-xl text-gray-500 font-medium max-w-2xl mx-auto leading-relaxed">
            We provide everything you need to succeed in your learning journey, from expert instructors to community support.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, idx) => (
            <div key={idx} className="group bg-white p-8 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1.5 border border-gray-100 flex items-start">
              <div className="flex-shrink-0">
                <div className="h-16 w-16 bg-indigo-50 border border-indigo-100/50 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:bg-indigo-600 transition-all duration-500 shadow-sm">
                  <feature.icon className="h-8 w-8 text-indigo-600 group-hover:text-white transition-colors duration-500" />
                </div>
              </div>
              <div className="ml-6">
                <h3 className="text-xl font-bold text-gray-900 mb-3 tracking-tight group-hover:text-indigo-600 transition-colors">{feature.title}</h3>
                <p className="text-gray-500 leading-relaxed font-medium">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}