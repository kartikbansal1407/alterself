import type { NormalizedLandmark } from "@mediapipe/tasks-vision";

export type PoseLandmark = NormalizedLandmark;

export interface PoseFrame {
  capturedAt: number;
  processingMs: number;
  landmarks: PoseLandmark[] | null;
}

export interface PoseEngine {
  readonly id: string;
  readonly version: string;
  initialize(): Promise<void>;
  estimate(video: HTMLVideoElement, capturedAt: number): PoseFrame;
  dispose(): void;
}

export type TrackingReliability =
  | { state: "no_pose"; message: string; detail: string }
  | { state: "limited"; message: string; detail: string }
  | { state: "ready"; message: string; detail: string };

