"use client";

import {
  FilesetResolver,
  PoseLandmarker,
  type PoseLandmarkerResult,
} from "@mediapipe/tasks-vision";
import type { PoseEngine, PoseFrame } from "@/pose/types";

const WASM_ROOT = "/wasm";
const MODEL_PATH = "/models/pose_landmarker_lite.task";

export class MediaPipePoseEngine implements PoseEngine {
  readonly id = "mediapipe-pose-landmarker";
  readonly version = "lite-float16-v1";
  private landmarker: PoseLandmarker | null = null;

  async initialize() {
    if (this.landmarker) return;

    const fileset = await FilesetResolver.forVisionTasks(WASM_ROOT);
    const options = {
      baseOptions: {
        modelAssetPath: MODEL_PATH,
        delegate: "GPU" as const,
      },
      runningMode: "VIDEO" as const,
      numPoses: 1,
      minPoseDetectionConfidence: 0.55,
      minPosePresenceConfidence: 0.55,
      minTrackingConfidence: 0.55,
      outputSegmentationMasks: false,
    };

    try {
      this.landmarker = await PoseLandmarker.createFromOptions(fileset, options);
    } catch {
      this.landmarker = await PoseLandmarker.createFromOptions(fileset, {
        ...options,
        baseOptions: { modelAssetPath: MODEL_PATH, delegate: "CPU" },
      });
    }
  }

  estimate(video: HTMLVideoElement, capturedAt: number): PoseFrame {
    if (!this.landmarker) throw new Error("Pose engine has not been initialized.");
    const startedAt = performance.now();
    const result: PoseLandmarkerResult = this.landmarker.detectForVideo(video, capturedAt);
    return {
      capturedAt,
      processingMs: performance.now() - startedAt,
      landmarks: result.landmarks[0] ?? null,
    };
  }

  dispose() {
    this.landmarker?.close();
    this.landmarker = null;
  }
}

