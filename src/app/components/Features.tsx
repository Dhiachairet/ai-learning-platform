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
    <div className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900">Why Choose LearnAI Hub?</h2>
          <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
            We provide everything you need to succeed in your learning journey, from expert instructors to community support.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, idx) => (
            <div key={idx} className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <feature.icon className="h-12 w-12 text-purple-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}