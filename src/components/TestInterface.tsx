import React, { useState, useEffect, useRef } from 'react';
import { Camera, Play, Pause, RotateCcw, CheckCircle, AlertCircle } from 'lucide-react';
import { tmManager } from '../utils/teachableMachine';
import { PostureFeedback } from '../types';

interface TestInterfaceProps {
  testType: 'plank' | 'pushups' | 'situps';
  onTestComplete: (result: { duration?: number; reps?: number; validReps?: number }) => void;
  onCancel: () => void;
}

export const TestInterface: React.FC<TestInterfaceProps> = ({ testType, onTestComplete, onCancel }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isActive, setIsActive] = useState(false);
  const [time, setTime] = useState(0);
  const [reps, setReps] = useState(0);
  const [validReps, setValidReps] = useState(0);
  const [feedback, setFeedback] = useState<PostureFeedback | null>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [lastValidRep, setLastValidRep] = useState(false);

  const testConfig = {
    plank: {
      title: 'Plank Hold Test',
      description: 'Hold the plank position as long as possible',
      instruction: 'Position yourself in a plank and hold until failure',
      color: 'blue',
      metric: 'Time'
    },
    pushups: {
      title: 'Push-ups Test',
      description: 'Perform as many push-ups as possible',
      instruction: 'Complete full range push-ups with proper form',
      color: 'green',
      metric: 'Reps'
    },
    situps: {
      title: 'Sit-ups Test',
      description: 'Perform as many sit-ups as possible',
      instruction: 'Complete full sit-ups with hands behind head',
      color: 'orange',
      metric: 'Reps'
    }
  };

  const config = testConfig[testType];

  useEffect(() => {
    initializeCamera();
    return () => {
      tmManager.cleanup();
    };
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isActive && cameraReady) {
      interval = setInterval(async () => {
        if (testType === 'plank') {
          setTime(prev => prev + 1);
        }
        
        // Analyze pose
        try {
          const poseFeedback = await tmManager.analyzePose(testType);
          setFeedback(poseFeedback);
          
          // Count reps for push-ups and sit-ups
          if (testType !== 'plank' && poseFeedback.isValid && !lastValidRep) {
            setReps(prev => prev + 1);
            setValidReps(prev => prev + 1);
            setLastValidRep(true);
          } else if (!poseFeedback.isValid && lastValidRep) {
            setLastValidRep(false);
          }
        } catch (error) {
          console.error('Pose analysis error:', error);
        }
      }, 100);
    }
    
    return () => clearInterval(interval);
  }, [isActive, cameraReady, testType, lastValidRep]);

  const initializeCamera = async () => {
    try {
      await tmManager.initialize();
      if (videoRef.current) {
        await tmManager.setupWebcam(videoRef.current);
        setCameraReady(true);
      }
    } catch (error) {
      console.error('Camera initialization failed:', error);
    }
  };

  const startTest = () => {
    setIsActive(true);
  };

  const pauseTest = () => {
    setIsActive(false);
  };

  const completeTest = () => {
    setIsActive(false);
    if (testType === 'plank') {
      onTestComplete({ duration: time });
    } else {
      onTestComplete({ reps, validReps });
    }
  };

  const resetTest = () => {
    setIsActive(false);
    setTime(0);
    setReps(0);
    setValidReps(0);
    setFeedback(null);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-600 text-white border-blue-600',
      green: 'bg-green-600 text-white border-green-600',
      orange: 'bg-orange-600 text-white border-orange-600'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{config.title}</h1>
              <p className="text-gray-600">{config.description}</p>
            </div>
            <button
              onClick={onCancel}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Camera Feed */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-gray-800 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center">
                <Camera className="w-5 h-5 text-white mr-2" />
                <span className="text-white font-medium">Live Camera Feed</span>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                cameraReady ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {cameraReady ? 'Ready' : 'Initializing...'}
              </div>
            </div>
            
            <div className="relative bg-black aspect-square">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              
              {/* Pose Overlay */}
              <div className="absolute inset-0 pointer-events-none">
                {feedback && (
                  <div className={`absolute top-4 left-4 right-4 p-3 rounded-lg ${
                    feedback.isValid 
                      ? 'bg-green-900/80 text-green-100' 
                      : 'bg-red-900/80 text-red-100'
                  }`}>
                    <div className="flex items-center space-x-2">
                      {feedback.isValid ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        <AlertCircle className="w-5 h-5" />
                      )}
                      <span className="font-medium">{feedback.message}</span>
                    </div>
                    {feedback.corrections && (
                      <div className="mt-2 text-sm">
                        {feedback.corrections.map((correction, idx) => (
                          <div key={idx}>• {correction}</div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Controls & Metrics */}
          <div className="space-y-6">
            {/* Metrics Display */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
              
              <div className="grid grid-cols-2 gap-4">
                {testType === 'plank' ? (
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-3xl font-bold text-blue-600">{formatTime(time)}</div>
                    <div className="text-blue-600 font-medium">Duration</div>
                  </div>
                ) : (
                  <>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-3xl font-bold text-green-600">{validReps}</div>
                      <div className="text-green-600 font-medium">Valid Reps</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-3xl font-bold text-gray-600">{reps}</div>
                      <div className="text-gray-600 font-medium">Total Attempts</div>
                    </div>
                  </>
                )}
                
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {feedback ? Math.round(feedback.confidence * 100) : 0}%
                  </div>
                  <div className="text-purple-600 font-medium">Confidence</div>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Instructions</h3>
              <p className="text-gray-600 mb-4">{config.instruction}</p>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-yellow-800 text-sm font-medium">
                  💡 Position yourself so your full body is visible in the camera for accurate analysis
                </p>
              </div>
            </div>

            {/* Controls */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex space-x-3">
                {!isActive ? (
                  <button
                    onClick={startTest}
                    disabled={!cameraReady}
                    className={`flex-1 py-3 px-6 rounded-lg font-semibold flex items-center justify-center space-x-2 ${getColorClasses(config.color)} disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <Play className="w-5 h-5" />
                    <span>Start Test</span>
                  </button>
                ) : (
                  <button
                    onClick={pauseTest}
                    className="flex-1 py-3 px-6 bg-yellow-600 text-white rounded-lg font-semibold flex items-center justify-center space-x-2"
                  >
                    <Pause className="w-5 h-5" />
                    <span>Pause</span>
                  </button>
                )}
                
                <button
                  onClick={resetTest}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold flex items-center justify-center hover:bg-gray-50"
                >
                  <RotateCcw className="w-5 h-5" />
                </button>
                
                <button
                  onClick={completeTest}
                  className="px-6 py-3 bg-gray-800 text-white rounded-lg font-semibold hover:bg-gray-900"
                >
                  Complete
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};