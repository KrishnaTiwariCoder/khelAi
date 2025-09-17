import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  const [initializationError, setInitializationError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

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

  // Initialize camera only once
  const initializeCamera = useCallback(async () => {
    try {
      setIsInitializing(true);
      setInitializationError(null);
      setCameraReady(false);
      
      console.log('🚀 Starting camera initialization...');
      
      // First initialize the model
      console.log('📚 Loading AI model...');
      const modelLoaded = await tmManager.initialize();
      if (!modelLoaded) {
        throw new Error('Failed to load Teachable Machine model');
      }
      console.log('✅ AI model loaded successfully');
      
      // Then setup the webcam
      if (videoRef.current) {
        console.log('🎥 Setting up webcam...');
        const webcam = await tmManager.setupWebcam(videoRef.current);
        
        if (!webcam) {
          throw new Error('Webcam setup failed - no webcam instance returned');
        }
        
        // Double check that everything is ready
        console.log('🔍 Verifying camera readiness...');
        let retries = 0;
        while (!tmManager.isReady() && retries < 10) {
          console.log(`⏳ Waiting for camera... (attempt ${retries + 1}/10)`);
          await new Promise(resolve => setTimeout(resolve, 500));
          retries++;
        }
        
        if (tmManager.isReady()) {
          console.log('🎉 All systems ready! Camera initialization complete.');
          setCameraReady(true);
        } else {
          throw new Error(`Camera setup incomplete after ${retries} retries`);
        }
      } else {
        throw new Error('Video element not found');
      }
    } catch (error) {
      console.error('❌ Camera initialization failed:', error);
      setInitializationError(error instanceof Error ? error.message : 'Unknown error');
      setCameraReady(false);
    } finally {
      setIsInitializing(false);
    }
  }, []);

  // Initialize on component mount
  useEffect(() => {
    initializeCamera();
    
    // Cleanup on unmount
    return () => {
      tmManager.cleanup();
    };
  }, [initializeCamera]);

  // Pose analysis effect - only runs when camera is ready and test is active
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isActive && cameraReady && tmManager.isReady()) {
      console.log('▶️ Starting pose analysis loop...');
      
      interval = setInterval(async () => {
        try {
          // Analyze pose
          const poseFeedback = await tmManager.analyzePose(testType);
          setFeedback(poseFeedback);
          
          // Handle plank timing
          if (testType === 'plank') {
            if (poseFeedback.isValid) {
              setTime(prev => prev + 0.1);
            }
          } else {
            // Handle reps for push-ups and sit-ups
            if (poseFeedback.isValid && !lastValidRep) {
              setReps(prev => prev + 1);
              setValidReps(prev => prev + 1);
              setLastValidRep(true);
              console.log('✅ Valid rep detected!');
            } else if (!poseFeedback.isValid && lastValidRep) {
              setLastValidRep(false);
            }
          }
        } catch (error) {
          console.error('❌ Pose analysis error:', error);
          setFeedback({
            isValid: false,
            confidence: 0,
            message: 'Analysis error occurred'
          });
        }
      }, 100);
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isActive, cameraReady, testType, lastValidRep]);

  const startTest = () => {
    if (!cameraReady || !tmManager.isReady()) {
      console.warn('⚠️ Attempted to start test but camera not ready');
      return;
    }
    
    console.log('🏁 Starting test...');
    setIsActive(true);
  };

  const pauseTest = () => {
    console.log('⏸️ Pausing test...');
    setIsActive(false);
  };

  const completeTest = () => {
    console.log('🏁 Completing test...');
    setIsActive(false);
    
    if (testType === 'plank') {
      onTestComplete({ duration: Math.round(time * 10) / 10 });
    } else {
      onTestComplete({ reps, validReps });
    }
  };

  const resetTest = () => {
    console.log('🔄 Resetting test...');
    setIsActive(false);
    setTime(0);
    setReps(0);
    setValidReps(0);
    setFeedback(null);
    setLastValidRep(false);
  };

  const retryInitialization = () => {
    console.log('🔄 Retrying camera initialization...');
    setCameraReady(false);
    setInitializationError(null);
    initializeCamera();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const tenths = Math.floor((seconds % 1) * 10);
    return `${mins}:${secs.toString().padStart(2, '0')}.${tenths}`;
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
                cameraReady ? 'bg-green-100 text-green-800' : 
                isInitializing ? 'bg-yellow-100 text-yellow-800' :
                initializationError ? 'bg-red-100 text-red-800' : 
                'bg-gray-100 text-gray-800'
              }`}>
                {cameraReady ? 'Ready' : 
                 isInitializing ? 'Initializing...' :
                 initializationError ? 'Error' : 'Not Ready'}
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
              
              {/* Error Message Overlay */}
              {initializationError && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/80">
                  <div className="text-center text-white p-6">
                    <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Camera Initialization Failed</h3>
                    <p className="text-sm text-gray-300 mb-4">{initializationError}</p>
                    <button
                      onClick={retryInitialization}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Retry
                    </button>
                  </div>
                </div>
              )}

              {/* Loading Overlay */}
              {isInitializing && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/80">
                  <div className="text-center text-white">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                    <p>Initializing camera and AI model...</p>
                  </div>
                </div>
              )}
              
              {/* Pose Feedback Overlay */}
              {feedback && cameraReady && (
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

          {/* Controls & Metrics */}
          <div className="space-y-6">
            {/* Metrics Display */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
              
              <div className="grid grid-cols-2 gap-4">
                {testType === 'plank' ? (
                  <div className="text-center p-4 bg-blue-50 rounded-lg col-span-2">
                    <div className="text-4xl font-bold text-blue-600">{formatTime(time)}</div>
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
                    disabled={!cameraReady || isInitializing}
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
                  disabled={isInitializing}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold flex items-center justify-center hover:bg-gray-50 disabled:opacity-50"
                >
                  <RotateCcw className="w-5 h-5" />
                </button>
                
                <button
                  onClick={completeTest}
                  disabled={!cameraReady || isInitializing}
                  className="px-6 py-3 bg-gray-800 text-white rounded-lg font-semibold hover:bg-gray-900 disabled:opacity-50"
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