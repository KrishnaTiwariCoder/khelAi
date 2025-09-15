import * as tmPose from '@teachablemachine/pose';
import { PostureFeedback } from '../types';

export class TeachableMachineManager {
  private model: any = null;
  private webcam: any = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private isInitialized = false;
  private maxPredictions = 0;

  async initialize() {
    try {
      // Use the model URL from the documentation
      const URL = "https://teachablemachine.withgoogle.com/models/n_Ba_DbAD/";
      const modelURL = URL + "model.json";
      const metadataURL = URL + "metadata.json";
      
      this.model = await tmPose.load(modelURL, metadataURL);
      this.maxPredictions = this.model.getTotalClasses();
      this.isInitialized = true;
      
      return true;
    } catch (error) {
      console.error('Failed to load Teachable Machine model:', error);
      return false;
    }
  }

  async setupWebcam(videoElement: HTMLVideoElement) {
    if (!this.isInitialized || !this.model) {
      throw new Error('Model not initialized');
    }

    try {
      // Create webcam with proper size
      const size = 320;
      const flip = true;
      this.webcam = new tmPose.Webcam(size, size, flip);
      await this.webcam.setup();
      await this.webcam.play();

      // Create canvas for drawing
      this.canvas = document.createElement('canvas');
      this.canvas.width = size;
      this.canvas.height = size;
      this.canvas.className = 'w-full h-full object-cover';
      this.ctx = this.canvas.getContext('2d');

      // Hide the video element and append canvas
      videoElement.style.display = 'none';
      const parent = videoElement.parentElement;
      if (parent) {
        parent.appendChild(this.canvas);
      }

      return this.webcam;
    } catch (error) {
      console.error('Webcam setup failed:', error);
      throw error;
    }
  }

  async analyzePose(exerciseType: 'plank' | 'pushups' | 'situps'): Promise<PostureFeedback> {
    if (!this.model || !this.webcam || !this.ctx || !this.canvas) {
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
      this.ctx.drawImage(this.webcam.canvas, 0, 0);
      if (pose) {
        const minPartConfidence = 0.5;
        tmPose.drawKeypoints(pose.keypoints, minPartConfidence, this.ctx);
        tmPose.drawSkeleton(pose.keypoints, minPartConfidence, this.ctx);
      }

      // Interpret predictions based on exercise type
      return this.interpretPrediction(prediction, exerciseType);
    } catch (error) {
      console.error('Pose analysis error:', error);
      return {
        isValid: false,
        confidence: 0,
        message: 'Analysis error'
      };
    }
  }

  private interpretPrediction(prediction: any[], exerciseType: string): PostureFeedback {
    // Find the prediction for the current exercise
    const exerciseMap: Record<string, string> = {
      'plank': 'plank',
      'pushups': 'pushup',
      'situps': 'situp'
    };

    const targetClass = exerciseMap[exerciseType];
    const exercisePrediction = prediction.find(p => p.className.toLowerCase() === targetClass);
    const nonePrediction = prediction.find(p => p.className.toLowerCase() === 'none');
    
    const exerciseConfidence = exercisePrediction ? exercisePrediction.probability : 0;
    const noneConfidence = nonePrediction ? nonePrediction.probability : 0;

    // Determine if the pose is valid (exercise confidence > none confidence and > threshold)
    const isValid = exerciseConfidence > noneConfidence && exerciseConfidence > 0.6;
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
          'Engage your core muscles'
        ],
        'pushups': [
          'Lower your chest closer to the ground',
          'Keep your body straight',
          'Push up to full extension'
        ],
        'situps': [
          'Lift your torso towards your knees',
          'Keep your hands behind your head',
          'Complete the full range of motion'
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
    if (this.webcam) {
      this.webcam.stop();
      this.webcam = null;
    }
    if (this.canvas && this.canvas.parentElement) {
      this.canvas.parentElement.removeChild(this.canvas);
    }
    this.canvas = null;
    this.ctx = null;
  }
}

export const tmManager = new TeachableMachineManager();