export default function Testimonials() {
  const testimonials = [
    { quote: 'This platform changed how I learn!', author: 'Student A' },
    { quote: 'AI tutor is a game-changer.', author: 'Instructor B' },
  ];

  return (
    <div className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-8">What Our Users Say</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {testimonials.map((testimonial) => (
            <div key={testimonial.author} className="bg-white p-6 rounded-lg shadow-md">
              <p className="text-gray-600 italic">"{testimonial.quote}"</p>
              <p className="mt-4 text-right text-gray-900">- {testimonial.author}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}