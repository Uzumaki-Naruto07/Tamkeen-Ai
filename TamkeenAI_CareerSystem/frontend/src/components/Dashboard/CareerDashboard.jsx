import React from 'react';
import { useTranslation } from 'react-i18next';
import './CareerDashboard.css'; // Import the CSS file

const CareerDashboard = () => {
  const { t } = useTranslation();

  return (
    <div className="bg-gray-50 p-6 min-h-screen">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left section - User Profile and stats */}
        <div className="lg:col-span-2">
          {/* User profile and dashboard header */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-6 progress-card">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-full overflow-hidden shrink-0">
                <img 
                  src="https://via.placeholder.com/150" 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://via.placeholder.com/150?text=Profile";
                  }}
                />
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-800">Your Career Dashboard</h1>
                <p className="text-gray-600">Complete your resume for better visibility to potential employers.</p>
                <button className="mt-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm transition-colors">
                  Update Resume
                </button>
              </div>
            </div>
          </div>

          {/* Winner Vibe section */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-6 progress-card">
            <div className="flex items-center mb-2">
              <span className="text-blue-400 text-xl mr-2 diamond-icon">💎</span>
              <h2 className="text-xl font-bold text-blue-600">Winner Vibe</h2>
              <span className="text-blue-400 text-xl ml-2 diamond-icon">💎</span>
            </div>
            <p className="text-gray-800 text-lg italic mb-1">The race for excellence has no finish line.</p>
            <p className="text-gray-600 text-sm">— Sheikh Mohammed bin Rashid</p>
            <div className="w-full mt-2">
              <div className="h-1.5 rounded-full bg-gray-200 w-full">
                <div className="h-1.5 rounded-full bg-blue-400 w-2/3 winner-vibe-progress"></div>
              </div>
            </div>
          </div>

          {/* Application Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow-md p-4 stats-card">
              <div className="flex flex-col items-center">
                <span className="text-2xl font-bold text-gray-800">23</span>
                <span className="text-sm text-gray-600">Applications</span>
                <div className="text-green-500 text-xs mt-1 flex items-center">
                  <span className="mr-1">▲</span>
                  <span>75 week</span>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-md p-4 stats-card">
              <div className="flex flex-col items-center">
                <span className="text-2xl font-bold text-gray-800">6</span>
                <span className="text-sm text-gray-600">On Hold</span>
                <div className="text-green-500 text-xs mt-1 flex items-center">
                  <span className="mr-1">▲</span>
                  <span>3 week</span>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-md p-4 stats-card">
              <div className="flex flex-col items-center">
                <span className="text-2xl font-bold text-gray-800">3</span>
                <span className="text-sm text-gray-600">Rejected</span>
                <div className="text-red-500 text-xs mt-1 flex items-center">
                  <span className="mr-1">▼</span>
                  <span>3 week</span>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-md p-4 stats-card">
              <div className="flex flex-col items-center">
                <span className="text-2xl font-bold text-gray-800">25.9</span>
                <span className="text-sm text-gray-600">Total Applied</span>
                <div className="text-gray-500 text-xs mt-1 flex items-center">
                  <span className="mr-1">✓</span>
                  <span>25:03</span>
                </div>
              </div>
            </div>
          </div>

          {/* Career Progress */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-6 progress-card">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Career Progress</h2>
            <div className="grid grid-cols-4 gap-4">
              <div className="flex flex-col items-center">
                <div className="bg-blue-500 h-16 w-16 rounded-lg flex items-center justify-center text-white text-2xl mb-2 achievement-icon">
                  ★
                </div>
                <span className="text-blue-600 text-sm">Resume Champion</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="bg-yellow-500 h-16 w-16 rounded-lg flex items-center justify-center text-white text-2xl mb-2 achievement-icon">
                  ★
                </div>
                <span className="text-yellow-600 text-sm">Emiratis Pagness</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="bg-green-500 h-16 w-16 rounded-lg flex items-center justify-center text-white text-2xl mb-2 achievement-icon">
                  ◆
                </div>
                <span className="text-green-600 text-sm">Skill Explorer</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="bg-blue-600 h-16 w-16 rounded-lg flex items-center justify-center text-white text-2xl mb-2 achievement-icon">
                  ◉
                </div>
                <span className="text-blue-600 text-sm">Journey Starter</span>
              </div>
            </div>
          </div>

          {/* Achievements */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-6 progress-card">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Achievements</h2>
            <div className="space-y-4">
              <div className="flex items-center achievement-card">
                <div className="bg-yellow-100 h-12 w-12 rounded-lg flex items-center justify-center text-yellow-500 text-xl mr-4 achievement-icon">
                  🏆
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-md font-semibold text-gray-800">Ángi Tamkeen</span>
                    <span className="text-green-500">✓</span>
                  </div>
                  <p className="text-sm text-gray-600">Lantresd naras</p>
                </div>
              </div>
              
              <div className="flex items-center achievement-card">
                <div className="bg-purple-100 h-12 w-12 rounded-lg flex items-center justify-center text-purple-500 text-xl mr-4 achievement-icon">
                  🎖️
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-md font-semibold text-gray-800">Emirati Progressor</span>
                    <span className="text-green-500">✓</span>
                  </div>
                  <p className="text-sm text-gray-600">Rig Highers</p>
                </div>
              </div>
              
              <div className="flex items-center achievement-card">
                <div className="bg-orange-100 h-12 w-12 rounded-lg flex items-center justify-center text-orange-500 text-xl mr-4 achievement-icon">
                  🏅
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-md font-semibold text-gray-800">Journey Starter</span>
                    <span className="text-green-500">✓</span>
                  </div>
                  <p className="text-sm text-gray-600"></p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right section - Score and AI assistance */}
        <div className="lg:col-span-1">
          {/* Resume Score */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-6 progress-card">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Resume Score</h2>
            <div className="flex justify-center mb-4">
              <div className="relative w-40 h-40">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  <circle
                    className="text-gray-200 stroke-current"
                    strokeWidth="8"
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                  ></circle>
                  <circle
                    className="text-blue-500 progress-ring stroke-current"
                    strokeWidth="8"
                    strokeLinecap="round"
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    strokeDasharray="251.2"
                    strokeDashoffset="62.8"
                    transform="rotate(-90 50 50)"
                  ></circle>
                  <text
                    x="50"
                    y="50"
                    fontFamily="Arial"
                    fontSize="24"
                    textAnchor="middle"
                    alignmentBaseline="central"
                    fill="#1a202c"
                  >
                    75
                  </text>
                </svg>
                <div className="absolute bottom-0 right-0">
                  <div className="w-10 h-10 flex items-center justify-center">
                    <span className="text-blue-500 text-2xl diamond-icon">💎</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Skill Gap Analysis */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-6 progress-card">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Skill Gap Analysis</h2>
            <div className="mb-4">
              <div className="flex justify-center">
                <div className="relative w-32 h-32 skill-chart">
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    <path 
                      d="M50,50 L50,10 A40,40 0 0,1 85,60 Z" 
                      fill="rgba(147, 197, 253, 0.5)" 
                      stroke="rgba(59, 130, 246, 0.8)" 
                      strokeWidth="1"
                    />
                    <path 
                      d="M50,50 L85,60 A40,40 0 0,1 15,60 Z" 
                      fill="rgba(147, 197, 253, 0.5)" 
                      stroke="rgba(59, 130, 246, 0.8)" 
                      strokeWidth="1"
                    />
                    <path 
                      d="M50,50 L15,60 A40,40 0 0,1 50,10 Z" 
                      fill="rgba(147, 197, 253, 0.2)" 
                      stroke="rgba(59, 130, 246, 0.6)" 
                      strokeWidth="1"
                    />
                    <circle cx="50" cy="10" r="3" fill="#3b82f6" />
                    <circle cx="85" cy="60" r="3" fill="#3b82f6" />
                    <circle cx="15" cy="60" r="3" fill="#3b82f6" />
                    <circle cx="50" cy="50" r="2" fill="#1e3a8a" />
                  </svg>
                </div>
              </div>
              <div className="mt-4 text-center text-sm text-gray-700">
                <p>Strangthο, vs. Weakdrinesseѕs</p>
              </div>
            </div>
            <div className="flex justify-around text-sm mt-4">
              <div className="flex items-center">
                <span className="h-3 w-3 rounded-full bg-green-500 mr-2"></span>
                <span>Strentgences</span>
              </div>
              <div className="flex items-center">
                <span className="h-3 w-3 rounded-full bg-blue-500 mr-2"></span>
                <span>Teamwork</span>
              </div>
            </div>
          </div>

          {/* Emirati Graduate section */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-6 progress-card">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Emirati Graduate to AI Engineer</h2>
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="h-4 w-4 rounded-full bg-blue-500 mr-2"></div>
                <span className="text-md font-medium">MAτ Tangisdan</span>
              </div>
              <div className="flex items-center text-sm text-gray-700">
                <span>لم · سـ</span>
              </div>
              <div className="flex items-center text-gray-600">
                <span className="mr-2">↻</span>
                <span>Ask Tamkeen</span>
                <span className="ml-2">↻</span>
              </div>
            </div>
          </div>

          {/* Learning Quest section */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-6 progress-card">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Learning Quest</h2>
              <span className="bg-blue-500 text-white font-bold py-1 px-3 rounded-full text-sm">3</span>
            </div>
            <div className="mb-4">
              <div className="mb-1">
                <p className="text-md font-semibold text-gray-800">Protential matches</p>
                <p className="text-sm text-gray-600">Career revelopment</p>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-blue-500 font-bold">12%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div className="bg-blue-500 h-2 rounded-full winner-vibe-progress" style={{ width: '12%' }}></div>
              </div>
            </div>
            <div className="flex justify-between text-sm mt-4 items-center">
              <div>Career Devel...</div>
              <div>Marktes</div>
              <button className="text-blue-500 font-medium">Details</button>
            </div>
          </div>

          {/* Job opportunities section */}
          <div className="bg-white rounded-xl shadow-md p-6 progress-card">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">opportunity Alerts</h2>
              <span className="bg-blue-500 text-white font-bold py-1 px-3 rounded-full text-sm">3</span>
            </div>
            <div className="mb-4">
              <div className="relative h-16 opportunity-alert-chart">
                <div className="absolute inset-0">
                  <svg viewBox="0 0 100 30" className="w-full h-full">
                    <path
                      d="M0,15 Q10,10 20,15 T40,15 T60,15 T80,15 T100,5"
                      fill="none"
                      stroke="#dbeafe"
                      strokeWidth="2"
                    />
                    <path
                      d="M0,15 Q10,10 20,15 T40,15 T60,15 T80,5"
                      fill="none"
                      stroke="#3b82f6"
                      strokeWidth="2"
                    />
                    <circle cx="20" cy="15" r="2" fill="#3b82f6" />
                    <circle cx="40" cy="15" r="2" fill="#3b82f6" />
                    <circle cx="60" cy="15" r="2" fill="#3b82f6" />
                    <circle cx="80" cy="5" r="2" fill="#3b82f6" />
                    <circle cx="80" cy="5" r="4" fill="none" stroke="#3b82f6" strokeWidth="1" />
                  </svg>
                </div>
              </div>
              <div className="mt-2">
                <p className="text-md font-semibold text-gray-800">Software Engineer</p>
                <p className="text-sm text-gray-600">New Graduate</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 text-sm text-gray-700">
              <div className="text-center">AJ</div>
              <div className="text-center">Engineer</div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer with quote */}
      <div className="mt-8 text-center text-gray-700">
        <p className="font-medium italic">"We, as a prople, are not satisfied with anything but first place. 🇦🇪</p>
      </div>
    </div>
  );
};

export default CareerDashboard; 