import React, { useState, useEffect } from 'react';
import { Timer, ChevronRight } from 'lucide-react';

interface RestScreenProps {
  nextTest: string;
  onComplete: () => void;
  duration?: number;
}

export const RestScreen: React.FC<RestScreenProps> = ({ nextTest, onComplete, duration = 30 }) => {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          onComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onComplete]);

  const progress = ((duration - timeLeft) / duration) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="mb-6">
            <div className="bg-blue-100 p-4 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <Timer className="w-10 h-10 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Rest Period</h2>
            <p className="text-gray-600">
              Take a moment to recover before your next test
            </p>
          </div>

          {/* Countdown Display */}
          <div className="mb-8">
            <div className="text-6xl font-bold text-blue-600 mb-2">{timeLeft}</div>
            <div className="text-gray-500">seconds remaining</div>
          </div>

          {/* Progress Ring */}
          <div className="relative w-32 h-32 mx-auto mb-8">
            <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
              <circle
                cx="60"
                cy="60"
                r="54"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="12"
              />
              <circle
                cx="60"
                cy="60"
                r="54"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 54}`}
                strokeDashoffset={`${2 * Math.PI * 54 * (1 - progress / 100)}`}
                className="transition-all duration-1000 ease-linear"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-lg font-semibold text-gray-800">{Math.round(progress)}%</div>
              </div>
            </div>
          </div>

          {/* Next Test Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center space-x-2 text-gray-700">
              <span>Next:</span>
              <span className="font-semibold">{nextTest}</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>

          {/* Tips */}
          <div className="text-left">
            <h3 className="font-semibold text-gray-900 mb-2">Quick Tips:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Take deep breaths to recover</li>
              <li>• Stay hydrated</li>
              <li>• Prepare for the next exercise</li>
              <li>• Position yourself for the camera</li>
            </ul>
          </div>

          {/* Skip Button */}
          <button
            onClick={onComplete}
            className="mt-6 w-full py-3 px-6 border-2 border-blue-600 text-blue-600 rounded-lg font-semibold hover:bg-blue-600 hover:text-white transition-colors"
          >
            Skip Rest Period
          </button>
        </div>
      </div>
    </div>
  );
};