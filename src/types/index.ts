export interface TestResult {
  type: 'plank' | 'pushups' | 'situps';
  duration?: number; // for plank (seconds)
  reps?: number; // for pushups/situps
  validReps?: number;
  invalidReps?: number;
  completedAt: Date;
}

export interface AssessmentSession {
  id: string;
  userId?: string;
  results: TestResult[];
  startedAt: Date;
  completedAt?: Date;
  overallScore?: number;
}

export interface PoseModel {
  estimatePose: (element: HTMLVideoElement | HTMLCanvasElement) => Promise<any>;
  predict: (poses: any) => Promise<any>;
}

export interface PostureFeedback {
  isValid: boolean;
  confidence: number;
  message: string;
  corrections?: string[];
}