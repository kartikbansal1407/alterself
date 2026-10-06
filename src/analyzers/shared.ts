import type {
  AnalyzerResult,
  ExerciseId,
  FeedbackCue,
} from "@/analyzers/types";
import type { PoseLandmark } from "@/pose/types";

export const LEFT = {
  shoulder: 11,
  elbow: 13,
  wrist: 15,
  hip: 23,
  knee: 25,
  ankle: 27,
  heel: 29,
  foot: 31,
} as const;

export const RIGHT = {
  shoulder: 12,
  elbow: 14,
  wrist: 16,
  hip: 24,
  knee: 26,
  ankle: 28,
  heel: 30,
  foot: 32,
} as const;

export type SideLandmarks = typeof LEFT;

export function landmarkConfidence(landmarks: PoseLandmark[], indices: readonly number[]) {
  if (!indices.length) return 0;
  return indices.reduce(
    (total, index) => total + (landmarks[index]?.visibility ?? 0),
    0,
  ) / indices.length;
}

export function chooseSide(
  landmarks: PoseLandmark[],
  names: readonly (keyof SideLandmarks)[],
) {
  const leftIndices = names.map((name) => LEFT[name]);
  const rightIndices = names.map((name) => RIGHT[name]);
  const leftConfidence = landmarkConfidence(landmarks, leftIndices);
  const rightConfidence = landmarkConfidence(landmarks, rightIndices);
  return leftConfidence >= rightConfidence
    ? { side: LEFT, confidence: leftConfidence, label: "left" as const }
    : { side: RIGHT, confidence: rightConfidence, label: "right" as const };
}

export function unavailableResult(
  exercise: ExerciseId,
  version: string,
  confidence: number,
  repetitions: number,
  holdMs: number,
  message: string,
): AnalyzerResult {
  return {
    exercise,
    analyzerVersion: version,
    reliable: false,
    confidence,
    stage: "unable-to-assess",
    repetitions,
    holdMs,
    formScore: null,
    angles: {},
    feedback: [
      {
        id: "visibility",
        message,
        kind: "visibility",
        priority: 100,
      },
    ],
  };
}

export function readyResult(options: {
  exercise: ExerciseId;
  version: string;
  confidence: number;
  stage: string;
  repetitions?: number;
  holdMs?: number;
  score: number;
  angles: Record<string, number>;
  feedback?: FeedbackCue[];
  limitation?: string;
}): AnalyzerResult {
  return {
    exercise: options.exercise,
    analyzerVersion: options.version,
    reliable: true,
    confidence: options.confidence,
    stage: options.stage,
    repetitions: options.repetitions ?? 0,
    holdMs: options.holdMs ?? 0,
    formScore: Math.max(0, Math.min(100, Math.round(options.score))),
    angles: options.angles,
    feedback: [...(options.feedback ?? [])].sort(
      (first, second) => second.priority - first.priority,
    ),
    limitation: options.limitation,
  };
}

export class RepetitionTracker {
  repetitions = 0;
  stage: "extended" | "flexed" = "extended";
  private previousAngle: number | null = null;

  constructor(
    private readonly flexedThreshold: number,
    private readonly extendedThreshold: number,
  ) {}

  update(angle: number) {
    const delta = this.previousAngle === null ? 0 : angle - this.previousAngle;
    this.previousAngle = angle;

    if (this.stage === "extended" && angle <= this.flexedThreshold) {
      this.stage = "flexed";
    } else if (this.stage === "flexed" && angle >= this.extendedThreshold) {
      this.stage = "extended";
      this.repetitions += 1;
    }

    if (Math.abs(delta) < 1.5) return this.stage === "extended" ? "ready" : "bottom";
    return delta < 0 ? "lowering" : "rising";
  }

  reset() {
    this.repetitions = 0;
    this.stage = "extended";
    this.previousAngle = null;
  }
}

export class HoldTracker {
  holdMs = 0;
  private lastCapturedAt: number | null = null;
  private active = false;

  update(valid: boolean, capturedAt: number) {
    if (valid && this.active && this.lastCapturedAt !== null) {
      this.holdMs += Math.min(250, Math.max(0, capturedAt - this.lastCapturedAt));
    }
    this.active = valid;
    this.lastCapturedAt = capturedAt;
    return valid ? "holding" : "adjusting";
  }

  pause(capturedAt: number) {
    this.active = false;
    this.lastCapturedAt = capturedAt;
  }

  reset() {
    this.holdMs = 0;
    this.lastCapturedAt = null;
    this.active = false;
  }
}

export class AngleSmoother {
  private value: number | null = null;

  constructor(private readonly alpha = 0.45) {}

  update(next: number) {
    this.value = this.value === null
      ? next
      : this.alpha * next + (1 - this.alpha) * this.value;
    return this.value;
  }

  reset() {
    this.value = null;
  }
}
