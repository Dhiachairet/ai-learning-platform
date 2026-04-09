export default function Testimonials() {
  const testimonials = [
    { quote: 'This platform changed how I learn!', author: 'Student A' },
    { quote: 'AI tutor is a game-changer.', author: 'Instructor B' },
  ];

  return (
    <div className="py-24 bg-indigo-50/30 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-800 to-purple-600 tracking-tight text-center mb-16">What Our Users Say</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {testimonials.map((testimonial) => (
            <div key={testimonial.author} className="group bg-white p-8 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 border border-indigo-50/50 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute -top-4 -right-4 text-9xl text-indigo-100/50 font-serif font-black select-none pointer-events-none group-hover:text-indigo-100 transition-colors">"</div>
              <p className="text-gray-600 text-lg font-medium italic relative z-10 leading-relaxed">"{testimonial.quote}"</p>
              <div className="mt-8 flex items-center justify-end relative z-10">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 mr-3 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                  {testimonial.author.charAt(0)}
                </div>
                <p className="text-gray-900 font-bold tracking-tight">{testimonial.author}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}