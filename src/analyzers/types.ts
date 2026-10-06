import type { PoseLandmark } from "@/pose/types";

export type ExerciseId =
  | "squat"
  | "push-up"
  | "deadlift"
  | "plank"
  | "warrior-ii"
  | "tree-pose";

export interface ExerciseDefinition {
  id: ExerciseId;
  name: string;
  tracking: "Repetitions" | "Hold time";
  view: string;
  instruction: string;
  requiredLandmarks: string;
  limitations: string;
}

export interface FeedbackCue {
  id: string;
  message: string;
  kind: "form" | "encouragement" | "visibility";
  priority: number;
}

export interface AnalyzerResult {
  exercise: ExerciseId;
  analyzerVersion: string;
  reliable: boolean;
  confidence: number;
  stage: string;
  repetitions: number;
  holdMs: number;
  formScore: number | null;
  angles: Record<string, number>;
  feedback: FeedbackCue[];
  limitation?: string;
}

export interface ExerciseAnalyzer {
  readonly exercise: ExerciseId;
  readonly version: string;
  update(landmarks: PoseLandmark[], capturedAt: number): AnalyzerResult;
  pause?(capturedAt: number): void;
  reset(): void;
}
