const fs = require('fs');
const file = 'src/app/auth/select-role/page.tsx';
let content = fs.readFileSync(file, 'utf8');
const oldPart = fs.readFileSync('temp.txt', 'utf8');

const newReturn = `  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <div className="text-center bg-white/90 backdrop-blur-sm p-8 rounded-xl shadow-2xl">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-lg font-semibold text-gray-900">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <div className="absolute inset-0 bg-black/10" />
      
      <div className="relative max-w-3xl w-full space-y-8 bg-white/90 backdrop-blur-sm p-10 rounded-2xl shadow-2xl">
        <div>
          <h2 className="text-center text-4xl font-extrabold text-gray-900 tracking-tight">
            Choose Your Path
          </h2>
          <p className="mt-3 text-center text-sm text-gray-500">
            Select your primary goal on the platform to personalize your experience
          </p>
        </div>

        <form className="space-y-8" onSubmit={handleRoleSelection}>
          {/* Role Selection Cards */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {/* Student Card */}
            <div
              onClick={() => setRole('student')}
              className={\`relative rounded-2xl border-2 p-6 cursor-pointer flex flex-col items-center text-center transition-all duration-300 transform \${
                role === 'student'
                  ? 'border-indigo-600 bg-indigo-50/70 shadow-lg scale-[1.02] ring-2 ring-indigo-600 ring-offset-2'
                  : 'border-gray-200 bg-white hover:border-indigo-300 hover:shadow-md hover:-translate-y-1'
              }\`}
            >
              {role === 'student' && <CheckCircleIcon className="absolute top-4 right-4 h-6 w-6 text-indigo-600" />}
              <div className={\`p-4 rounded-full mb-4 \${role === 'student' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-500'}\`}>
                <AcademicCapIcon className="h-10 w-10" />
              </div>
              <h3 className={\`text-xl font-bold \${role === 'student' ? 'text-indigo-900' : 'text-gray-900'}\`}>Student</h3>
              <p className="text-sm text-gray-500 mt-2">I want to learn, enroll in courses, and master new skills.</p>
            </div>

            {/* Instructor Card */}
            <div
              onClick={() => setRole('instructor')}
              className={\`relative rounded-2xl border-2 p-6 cursor-pointer flex flex-col items-center text-center transition-all duration-300 transform \${
                role === 'instructor'
                  ? 'border-indigo-600 bg-indigo-50/70 shadow-lg scale-[1.02] ring-2 ring-indigo-600 ring-offset-2'
                  : 'border-gray-200 bg-white hover:border-indigo-300 hover:shadow-md hover:-translate-y-1'
              }\`}
            >
              {role === 'instructor' && <CheckCircleIcon className="absolute top-4 right-4 h-6 w-6 text-indigo-600" />}
              <div className={\`p-4 rounded-full mb-4 \${role === 'instructor' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-500'}\`}>
                <BriefcaseIcon className="h-10 w-10" />
              </div>
              <h3 className={\`text-xl font-bold \${role === 'instructor' ? 'text-indigo-900' : 'text-gray-900'}\`}>Instructor</h3>
              <p className="text-sm text-gray-500 mt-2">I want to create courses, teach, and share my knowledge.</p>
            </div>
          </div>

          <div className="min-h-[120px] transition-all duration-300">
            {/* Student Fields */}
            {role === 'student' && (
              <div className="animate-fade-in-up bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <label htmlFor="educationLevel" className="block text-sm font-semibold text-gray-700 mb-2">
                  Current Education Level
                </label>
                <select
                  id="educationLevel"
                  value={educationLevel}
                  onChange={(e) => setEducationLevel(e.target.value)}
                  className="block w-full px-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow text-gray-900"
                >
                  <option value="">Select Level</option>
                  <option value="high-school">High School</option>
                  <option value="undergraduate">Undergraduate</option>
                  <option value="postgraduate">Postgraduate</option>
                  <option value="self-learner">Self-Learner</option>
                </select>
              </div>
            )}

            {/* Instructor Fields */}
            {role === 'instructor' && (
               <div className="animate-fade-in-up bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Expertise Areas <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {['Development', 'Data Science', 'Design', 'Marketing', 'Business', 'Other'].map((category) => {
                    const value = category.toLowerCase().replace(' ', '-');
                    const isChecked = expertiseArea.includes(value);
                    return (
                      <div 
                        key={category} 
                        onClick={() => {
                          if (isChecked) {
                            setExpertiseArea(expertiseArea.filter(item => item !== value));
                          } else {
                            setExpertiseArea([...expertiseArea, value]);
                          }
                        }}
                        className={\`flex items-center p-3 rounded-lg border cursor-pointer transition-colors \${
                          isChecked ? 'bg-indigo-50 border-indigo-200' : 'hover:bg-gray-50 border-gray-200'
                        }\`}
                      >
                        <input
                          type="checkbox"
                          value={value}
                          checked={isChecked}
                          readOnly
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded cursor-pointer"
                        />
                        <span className="ml-2 text-sm font-medium text-gray-700 whitespace-nowrap">{category}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {message && (
            <div className={\`p-4 rounded-lg text-sm font-medium text-center shadow-sm \${
              message.includes('Error') ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            }\`}>
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={!role || isLoading}
            className="w-full flex justify-center py-4 px-4 border border-transparent text-base font-bold rounded-xl text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none transform hover:-translate-y-0.5"
          >
            {isLoading ? 'Setting up your account...' : 'Complete Profile'}
          </button>
        </form>
      </div>
    </div>
  );
}

`;

content = content.replace(oldPart, newReturn);
fs.writeFileSync(file, content);
console.log('done!');
