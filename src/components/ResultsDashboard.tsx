import React from 'react';
import { Trophy, Clock, Target, Share2, Save, BarChart3, Medal } from 'lucide-react';
import { TestResult } from '../types';

interface ResultsDashboardProps {
  results: TestResult[];
  onSaveResults: () => void;
  onShareResults: () => void;
  onStartOver: () => void;
  isAuthenticated: boolean;
}

export const ResultsDashboard: React.FC<ResultsDashboardProps> = ({
  results,
  onSaveResults,
  onShareResults,
  onStartOver,
  isAuthenticated
}) => {
  const calculateOverallScore = () => {
    // Simple scoring algorithm (can be enhanced)
    let totalScore = 0;
    results.forEach(result => {
      switch (result.type) {
        case 'plank':
          totalScore += Math.min((result.duration || 0) / 60 * 100, 100);
          break;
        case 'pushups':
          totalScore += Math.min((result.validReps || 0) * 5, 100);
          break;
        case 'situps':
          totalScore += Math.min((result.validReps || 0) * 3, 100);
          break;
      }
    });
    return Math.round(totalScore / results.length);
  };

  const getScoreGrade = (score: number) => {
    if (score >= 90) return { grade: 'A+', color: 'text-green-600', bg: 'bg-green-100' };
    if (score >= 80) return { grade: 'A', color: 'text-green-600', bg: 'bg-green-100' };
    if (score >= 70) return { grade: 'B+', color: 'text-blue-600', bg: 'bg-blue-100' };
    if (score >= 60) return { grade: 'B', color: 'text-blue-600', bg: 'bg-blue-100' };
    if (score >= 50) return { grade: 'C', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    return { grade: 'D', color: 'text-red-600', bg: 'bg-red-100' };
  };

  const getFeedbackMessage = (score: number) => {
    if (score >= 90) return "Outstanding performance! You're in excellent shape.";
    if (score >= 80) return "Great work! You have strong fitness fundamentals.";
    if (score >= 70) return "Good performance! Room for improvement in some areas.";
    if (score >= 60) return "Fair results. Consider focusing on specific areas.";
    return "Keep working! Every fitness journey starts somewhere.";
  };

  const overallScore = calculateOverallScore();
  const scoreData = getScoreGrade(overallScore);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className={`p-4 rounded-full ${scoreData.bg} mr-4`}>
              <Trophy className={`w-8 h-8 ${scoreData.color}`} />
            </div>
            <h1 className="text-4xl font-bold text-gray-900">Assessment Complete!</h1>
          </div>
          <p className="text-xl text-gray-600">Here's your comprehensive fitness evaluation</p>
        </div>

        {/* Overall Score */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-6 mb-6">
              <div className="text-center">
                <div className="text-6xl font-bold text-gray-900 mb-2">{overallScore}</div>
                <div className="text-gray-500 uppercase tracking-wide font-medium">Overall Score</div>
              </div>
              <div className="text-center">
                <div className={`text-4xl font-bold ${scoreData.color} mb-2`}>{scoreData.grade}</div>
                <div className="text-gray-500 uppercase tracking-wide font-medium">Grade</div>
              </div>
            </div>
            <div className="bg-gray-100 rounded-full h-4 mb-4">
              <div 
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-4 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${overallScore}%` }}
              ></div>
            </div>
            <p className="text-lg text-gray-700">{getFeedbackMessage(overallScore)}</p>
          </div>
        </div>

        {/* Individual Test Results */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {results.map((result, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className={`px-6 py-4 ${
                result.type === 'plank' ? 'bg-blue-600' :
                result.type === 'pushups' ? 'bg-green-600' : 'bg-orange-600'
              }`}>
                <div className="flex items-center justify-between">
                  <h3 className="text-white font-semibold capitalize">{result.type}</h3>
                  {result.type === 'plank' ? <Clock className="w-5 h-5 text-white" /> :
                   <Target className="w-5 h-5 text-white" />}
                </div>
              </div>
              
              <div className="p-6">
                {result.type === 'plank' ? (
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-900 mb-2">
                      {Math.floor((result.duration || 0) / 60)}:{((result.duration || 0) % 60).toString().padStart(2, '0')}
                    </div>
                    <div className="text-gray-500 mb-4">Duration</div>
                    <div className="bg-blue-50 rounded-lg p-3">
                      <div className="text-sm text-blue-800">
                        {result.duration && result.duration > 120 ? 'Excellent endurance!' :
                         result.duration && result.duration > 60 ? 'Good core strength!' :
                         'Keep building endurance!'}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">{result.validReps}</div>
                        <div className="text-gray-500 text-sm">Valid Reps</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-gray-600">{result.reps}</div>
                        <div className="text-gray-500 text-sm">Total</div>
                      </div>
                    </div>
                    <div className="bg-gray-100 rounded-full h-2 mb-3">
                      <div 
                        className={`h-2 rounded-full ${
                          result.type === 'pushups' ? 'bg-green-500' : 'bg-orange-500'
                        }`}
                        style={{ width: `${((result.validReps || 0) / Math.max(result.reps || 1, 1)) * 100}%` }}
                      ></div>
                    </div>
                    <div className={`${
                      result.type === 'pushups' ? 'bg-green-50' : 'bg-orange-50'
                    } rounded-lg p-3`}>
                      <div className={`text-sm ${
                        result.type === 'pushups' ? 'text-green-800' : 'text-orange-800'
                      }`}>
                        {(result.validReps || 0) / Math.max(result.reps || 1, 1) > 0.8 ? 'Great form consistency!' :
                         (result.validReps || 0) / Math.max(result.reps || 1, 1) > 0.6 ? 'Good technique!' :
                         'Focus on proper form!'}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex flex-col md:flex-row gap-4">
            <button
              onClick={onStartOver}
              className="flex-1 py-3 px-6 border-2 border-blue-600 text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors flex items-center justify-center space-x-2"
            >
              <BarChart3 className="w-5 h-5" />
              <span>Take Test Again</span>
            </button>
            
            {isAuthenticated ? (
              <>
                <button
                  onClick={onSaveResults}
                  className="flex-1 py-3 px-6 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <Save className="w-5 h-5" />
                  <span>Save to Profile</span>
                </button>
                <button
                  onClick={onShareResults}
                  className="flex-1 py-3 px-6 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <Share2 className="w-5 h-5" />
                  <span>Share Results</span>
                </button>
              </>
            ) : (
              <button
                onClick={onSaveResults}
                className="flex-1 py-3 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center justify-center space-x-2"
              >
                <Medal className="w-5 h-5" />
                <span>Sign In to Save & Share</span>
              </button>
            )}
          </div>
          
          {!isAuthenticated && (
            <p className="text-center text-gray-500 mt-4 text-sm">
              Create an account to save your progress and share results with coaches
            </p>
          )}
        </div>
      </div>
    </div>
  );
};