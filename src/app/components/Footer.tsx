export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div>&copy; 2025 LearnAI. All rights reserved.</div>
          <div className="mt-4 md:mt-0">
            <a href="#" className="text-gray-300 hover:text-white mx-2">Privacy</a>
            <a href="#" className="text-gray-300 hover:text-white mx-2">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
}