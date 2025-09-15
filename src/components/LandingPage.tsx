import React from 'react';
import { Play, Zap, Target, Trophy, Lock } from 'lucide-react';
import { AuthButton } from './AuthButton';

interface LandingPageProps {
  onStartTest: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStartTest }) => {
  const futureSports = [
    { name: 'High Jump', icon: '🏃‍♂️', category: 'Track & Field' },
    { name: 'Long Jump', icon: '🏃‍♀️', category: 'Track & Field' },
    { name: 'Javelin Throw', icon: '🏹', category: 'Field Events' },
    { name: 'Gymnastics', icon: '🤸‍♀️', category: 'Artistic' },
    { name: 'Weightlifting', icon: '🏋️‍♂️', category: 'Strength' },
    { name: 'Boxing/MMA', icon: '🥊', category: 'Combat' },
    { name: 'Running', icon: '🏃', category: 'Endurance' },
    { name: 'Cycling', icon: '🚴‍♀️', category: 'Endurance' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-end mb-4">
            <AuthButton showSignUp={true} />
          </div>
          <div className="flex items-center justify-center mb-6">
            <div className="bg-blue-600 p-3 rounded-full mr-4">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900">FitAssess Pro</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Advanced AI-powered fitness assessment with real-time posture analysis
          </p>
        </div>

        {/* Main CTA Section */}
        <div className="max-w-4xl mx-auto mb-16">
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-8 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold mb-4">Standard Fitness Assessment</h2>
                  <p className="text-blue-100 text-lg mb-6">
                    Complete our comprehensive 3-test evaluation: Plank Hold, Push-ups, and Sit-ups
                  </p>
                  <div className="flex items-center space-x-6 text-blue-100 mb-8">
                    <div className="flex items-center">
                      <Target className="w-5 h-5 mr-2" />
                      <span>AI Posture Detection</span>
                    </div>
                    <div className="flex items-center">
                      <Trophy className="w-5 h-5 mr-2" />
                      <span>Instant Results</span>
                    </div>
                  </div>
                </div>
                <div className="hidden md:block">
                  <div className="bg-white/10 p-6 rounded-2xl">
                    <div className="text-center">
                      <div className="text-3xl font-bold">~10</div>
                      <div className="text-blue-200">minutes</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-8">
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="text-center">
                  <div className="bg-blue-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <span className="text-2xl">⏱️</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Plank Hold</h3>
                  <p className="text-gray-600 text-sm">Timed endurance test with posture validation</p>
                </div>
                <div className="text-center">
                  <div className="bg-green-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <span className="text-2xl">💪</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Push-ups</h3>
                  <p className="text-gray-600 text-sm">Rep counting with form analysis</p>
                </div>
                <div className="text-center">
                  <div className="bg-orange-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <span className="text-2xl">🏃</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Sit-ups</h3>
                  <p className="text-gray-600 text-sm">Core strength assessment with real-time feedback</p>
                </div>
              </div>
              
              <button
                onClick={onStartTest}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 px-8 rounded-xl font-semibold text-lg flex items-center justify-center space-x-3 hover:from-blue-700 hover:to-blue-800 transform hover:scale-[1.02] transition-all duration-200 shadow-lg"
              >
                <Play className="w-6 h-6" />
                <span>Start Standard Test</span>
              </button>
              
              <p className="text-center text-gray-500 mt-4 text-sm">
                No sign-up required • Get instant results • Save results with account
              </p>
            </div>
          </div>
        </div>

        {/* Future Sports Categories */}
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Coming Soon</h3>
            <p className="text-gray-600">Advanced sport-specific assessments in development</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {futureSports.map((sport, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-md border border-gray-100 opacity-60">
                <div className="relative">
                  <div className="text-center">
                    <div className="text-3xl mb-3">{sport.icon}</div>
                    <h4 className="font-semibold text-gray-900 mb-1">{sport.name}</h4>
                    <p className="text-sm text-gray-500 mb-3">{sport.category}</p>
                  </div>
                  <div className="absolute -top-2 -right-2 bg-gray-400 p-1 rounded-full">
                    <Lock className="w-4 h-4 text-white" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};