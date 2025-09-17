/* eslint-disable @typescript-eslint/no-explicit-any */
import * as tmPose from '@teachablemachine/pose';
import { PostureFeedback } from '../types';

export class TeachableMachineManager {
  private model: any = null;
  private webcam: any = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private isInitialized = false;
  private webcamReady = false;
  private maxPredictions = 0;

  async initialize() {
    try {
      // Use the model URL from the documentation
      const URL = "https://teachablemachine.withgoogle.com/models/uuMrJlamL/";
      const modelURL = URL + "model.json";
      const metadataURL = URL + "metadata.json";
      
      this.model = await tmPose.load(modelURL, metadataURL);
      this.maxPredictions = this.model.getTotalClasses();
      this.isInitialized = true;
      
      console.log('✅ Teachable Machine model loaded successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to load Teachable Machine model:', error);
      return false;
    }
  }

  async setupWebcam(videoElement: HTMLVideoElement): Promise<any> {
    if (!this.isInitialized || !this.model) {
      throw new Error('Model not initialized. Call initialize() first.');
    }

    try {
      // Prevent double init
      if (this.webcam && this.webcamReady) {
        console.warn("⚠️ Webcam already initialized");
        return this.webcam;
      }

      console.log('🎥 Setting up webcam...');
      const size = 320;
      const flip = true;

      this.webcam = new tmPose.Webcam(size, size, flip);
      
      // Setup webcam with proper error handling
      await this.webcam.setup({ facingMode: "user" });
      console.log('📷 Webcam setup complete');

      // Start webcam and wait for it to be ready
      await this.webcam.play();
      console.log('▶️ Webcam started successfully');

      // Wait a moment for webcam to stabilize
      await new Promise(resolve => setTimeout(resolve, 500));

      // Create canvas for pose visualization
      this.canvas = document.createElement('canvas');
      this.canvas.width = size;
      this.canvas.height = size;
      this.canvas.className = 'w-full h-full object-cover';
      this.ctx = this.canvas.getContext('2d');

      // Hide video element and append canvas
      videoElement.style.display = 'none';
      const parent = videoElement.parentElement;
      if (parent) {
        parent.appendChild(this.canvas);
      }

      // Start the render loop
      this.startRenderLoop();

      // Mark webcam as ready AFTER everything is set up
      this.webcamReady = true;
      console.log('✅ Webcam fully initialized and ready - all systems go!');

      // Return the webcam instance
      return this.webcam;
    } catch (error) {
      console.error('❌ Camera initialization failed:', error);
      this.webcamReady = false;
      throw error;
    }
  }

  private startRenderLoop() {
    const loop = () => {
      if (this.webcam && this.ctx && this.webcamReady) {
        try {
          this.webcam.update();
          this.ctx.drawImage(this.webcam.canvas, 0, 0);
        } catch (error) {
          console.error('Render loop error:', error);
        }
      }
      requestAnimationFrame(loop);
    };
    loop();
  }

  isReady(): boolean {
    return this.isInitialized && this.webcamReady && this.model && this.webcam && this.ctx && this.canvas;
  }

  async analyzePose(exerciseType: 'plank' | 'pushups' | 'situps'): Promise<PostureFeedback> {
    // Check if everything is properly initialized
    if (!this.isReady()) {
      console.warn('⚠️ Pose analysis called but system not ready');
      return {
        isValid: false,
        confidence: 0,
        message: 'Camera not initialized'
      };
    }

    try {
      // Update webcam frame
      this.webcam.update();

      // Get pose estimation
      const { pose, posenetOutput } = await this.model.estimatePose(this.webcam.canvas);
      
      // Get predictions from the model
      const prediction = await this.model.predict(posenetOutput);

      // Draw the webcam image and pose
      if (this.ctx) {
        this.ctx.drawImage(this.webcam.canvas, 0, 0);
        if (pose) {
          const minPartConfidence = 0.5;
          tmPose.drawKeypoints(pose.keypoints, minPartConfidence, this.ctx);
          tmPose.drawSkeleton(pose.keypoints, minPartConfidence, this.ctx);
        }
      }

      // Interpret predictions based on exercise type
      return this.interpretPrediction(prediction, exerciseType);
    } catch (error) {
      console.error('❌ Pose analysis error:', error);
      return {
        isValid: false,
        confidence: 0,
        message: 'Analysis error'
      };
    }
  }

  private interpretPrediction(prediction: any[], exerciseType: string): PostureFeedback {
    if (!prediction || prediction.length === 0) {
      return {
        isValid: false,
        confidence: 0,
        message: 'No prediction data available'
      };
    }

    // Find the prediction for the current exercise
    const exerciseMap: Record<string, string> = {
      'plank': 'plank',
      'pushups': 'pushup',
      'situps': 'situp'
    };

    const targetClass = exerciseMap[exerciseType];
    const exercisePrediction = prediction.find(p => 
      p.className.toLowerCase().includes(targetClass.toLowerCase())
    );
    const nonePrediction = prediction.find(p => 
      p.className.toLowerCase() === 'none' || p.className.toLowerCase() === 'background'
    );
    
    const exerciseConfidence = exercisePrediction ? exercisePrediction.probability : 0;
    const noneConfidence = nonePrediction ? nonePrediction.probability : 0;

    // Debug logging
    console.log(`📊 Predictions for ${exerciseType}:`, {
      exerciseConfidence: exerciseConfidence.toFixed(2),
      noneConfidence: noneConfidence.toFixed(2),
      allPredictions: prediction.map(p => ({
        class: p.className,
        confidence: p.probability.toFixed(2)
      }))
    });

    // Determine if the pose is valid (exercise confidence > none confidence and > threshold)
    const threshold = 0.6;
    const isValid = exerciseConfidence > noneConfidence && exerciseConfidence > threshold;
    const confidence = Math.max(exerciseConfidence, noneConfidence);

    if (isValid) {
      const messages: Record<string, string> = {
        'plank': 'Perfect plank form! Keep holding!',
        'pushups': 'Great push-up form!',
        'situps': 'Excellent sit-up technique!'
      };

      return {
        isValid: true,
        confidence: exerciseConfidence,
        message: messages[exerciseType] || 'Good form!'
      };
    } else {
      const corrections: Record<string, string[]> = {
        'plank': [
          'Keep your body in a straight line',
          'Don\'t let your hips sag or rise too high',
          'Engage your core muscles',
          'Keep your forearms flat on the ground'
        ],
        'pushups': [
          'Lower your chest closer to the ground',
          'Keep your body straight from head to heels',
          'Push up to full extension',
          'Keep your hands shoulder-width apart'
        ],
        'situps': [
          'Lift your torso towards your knees',
          'Keep your hands behind your head',
          'Complete the full range of motion',
          'Don\'t pull on your neck'
        ]
      };

      return {
        isValid: false,
        confidence,
        message: `Adjust your ${exerciseType} form`,
        corrections: corrections[exerciseType] || ['Adjust your form']
      };
    }
  }

  cleanup() {
    console.log('🧹 Cleaning up Teachable Machine resources...');
    
    this.webcamReady = false;
    
    if (this.webcam) {
      try {
        this.webcam.stop();
      } catch (error) {
        console.error('Error stopping webcam:', error);
      }
      this.webcam = null;
    }
    
    if (this.canvas && this.canvas.parentElement) {
      this.canvas.parentElement.removeChild(this.canvas);
    }
    
    this.canvas = null;
    this.ctx = null;
    
    console.log('✅ Cleanup complete');
  }
}

export const tmManager = new TeachableMachineManager();