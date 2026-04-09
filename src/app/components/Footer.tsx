export default function Footer() {
  return (
    <footer id="about" className="bg-gradient-to-b from-indigo-900 to-indigo-950 text-indigo-50 py-16 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center bg-repeat opacity-[0.05]"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* About Section */}
        <div className="mb-16 grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-8 px-4 text-indigo-100">
          
          {/* Mission & Story Columns */}
          <div className="lg:col-span-1 flex flex-col space-y-8">
            <div>
              <h2 className="text-3xl font-extrabold text-white mb-4">About <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-purple-400">LearnAI Hub</span></h2>
              <p className="leading-relaxed text-indigo-200">
                LearnAI Hub is revolutionizing online education by combining expert-led courses with AI-powered learning assistance. We believe every learner deserves personalized support on their educational journey.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-3">Our Story</h3>
              <p className="leading-relaxed text-indigo-200">
                LearnAI Hub was founded in 2025 with a simple idea: online learning should be more interactive and personalized. Traditional e-learning platforms leave students stuck when they have questions. We built an AI assistant directly into the learning experience to solve this problem.
              </p>
            </div>
          </div>

          {/* Differentiators & Stats Column */}
          <div className="lg:col-span-1 flex flex-col space-y-8 lg:px-4">
            <div>
              <h3 className="text-xl font-bold text-white mb-4">What Makes Us Different</h3>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <span className="text-indigo-400 mr-3 mt-1 font-extrabold text-lg">•</span>
                  <span className="text-indigo-200"><strong className="text-white">AI Learning Assistant:</strong> Get instant answers and explanations while you learn.</span>
                </li>
               
                <li className="flex items-start">
                  <span className="text-indigo-400 mr-3 mt-1 font-extrabold text-lg">•</span>
                  <span className="text-indigo-200"><strong className="text-white">Industry Expert Instructors:</strong> Courses created by professionals with hands-on experience.</span>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-xl font-bold text-white mb-4">Join Our Community</h3>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <span className="text-purple-400 mr-3 mt-1 font-extrabold text-lg">•</span>
                  <span className="text-indigo-200"><strong className="text-white">13+ Courses</strong> across programming, data science, and design.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-400 mr-3 mt-1 font-extrabold text-lg">•</span>
                  <span className="text-indigo-200"><strong className="text-white">Active Learners</strong> building real skills.</span>
                </li>
               
              </ul>
            </div>
          </div>

          {/* Roles & CTA Column */}
          <div className="lg:col-span-1 flex flex-col space-y-6">
            <div className="bg-indigo-900/50 rounded-3xl p-6 border border-indigo-800/60 backdrop-blur-sm shadow-inner hover:bg-indigo-800/40 transition-colors">
              <h3 className="text-xl font-bold text-white mb-2">For Students</h3>
              <p className="leading-relaxed text-indigo-200 text-sm">
                Track your progress, learn at your own pace, and never get stuck with our AI chatbot ready to help 24/7.
              </p>
            </div>
            
            <div className="bg-indigo-900/50 rounded-3xl p-6 border border-indigo-800/60 backdrop-blur-sm shadow-inner hover:bg-indigo-800/40 transition-colors">
              <h3 className="text-xl font-bold text-white mb-2">For Instructors</h3>
              <p className="leading-relaxed text-indigo-200 text-sm">
                Share your expertise, reach global learners, and build your teaching brand with our powerful course creation tools.
              </p>
            </div>
            
            <div className="text-center p-6 border border-purple-500/30 bg-purple-900/20 rounded-2xl mt-4">
              <p className="text-purple-200 font-semibold italic text-lg shadow-sm">
                Start learning today at LearnAI Hub!
              </p>
            </div>
          </div>
        </div>

        {/* Existing Copyright / Small Links */}
        <div className="flex flex-col md:flex-row justify-between items-center border-t border-indigo-800/50 pt-8">
          <div className="flex flex-col items-center md:items-start mb-6 md:mb-0">
            <span className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 to-purple-400 mb-2">LearnAI Hub</span>
            <span className="text-indigo-300/80 text-sm font-medium">&copy; 2025 LearnAI. All rights reserved.</span>
          </div>
          <div className="flex space-x-6 backdrop-blur-sm bg-indigo-900/40 px-6 py-3 rounded-2xl border border-indigo-800/30">
            <a href="#" className="font-semibold text-indigo-200/80 hover:text-white hover:-translate-y-0.5 transition-all">Privacy</a>
            <a href="#" className="font-semibold text-indigo-200/80 hover:text-white hover:-translate-y-0.5 transition-all">Terms</a>
            <a href="#" className="font-semibold text-indigo-200/80 hover:text-white hover:-translate-y-0.5 transition-all">Support</a>
          </div>
        </div>
      </div>
    </footer>
  );
}