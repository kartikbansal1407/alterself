import { angleAt, distance, roundAngle } from "@/analyzers/geometry";
import {
  AngleSmoother,
  chooseSide,
  readyResult,
  RepetitionTracker,
  unavailableResult,
} from "@/analyzers/shared";
import type { ExerciseAnalyzer } from "@/analyzers/types";
import type { PoseLandmark } from "@/pose/types";

const VERSION = "deadlift-rules-1.0.0-beta";
const MIN_CONFIDENCE = 0.55;

export class DeadliftAnalyzer implements ExerciseAnalyzer {
  readonly exercise = "deadlift" as const;
  readonly version = VERSION;
  private readonly hip = new AngleSmoother();
  private readonly reps = new RepetitionTracker(110, 160);

  update(landmarks: PoseLandmark[]) {
    const view = chooseSide(landmarks, ["shoulder", "wrist", "hip", "knee", "ankle"]);
    if (view.confidence < MIN_CONFIDENCE) {
      return unavailableResult(this.exercise, VERSION, view.confidence, this.reps.repetitions, 0, "Unable to assess reliably. Keep one side of your shoulders, hands, hips, knees, and ankles visible.");
    }

    const side = view.side;
    const hipAngle = this.hip.update(angleAt(landmarks[side.shoulder], landmarks[side.hip], landmarks[side.knee]));
    const torsoLength = Math.max(0.1, distance(landmarks[side.shoulder], landmarks[side.hip]));
    const handFromAnkle = Math.abs(landmarks[side.wrist].x - landmarks[side.ankle].x) / torsoLength;
    const stage = this.reps.update(hipAngle);
    const closePath = handFromAnkle <= 0.7;

    return readyResult({
      exercise: this.exercise,
      version: VERSION,
      confidence: view.confidence,
      stage,
      repetitions: this.reps.repetitions,
      score: 100 - Math.max(0, handFromAnkle - 0.45) * 45,
      angles: { hip: roundAngle(hipAngle), handPathRatio: Math.round(handFromAnkle * 100) / 100 },
      feedback: [closePath
        ? { id: "deadlift-clear", message: "Hip movement and hand path look consistent.", kind: "encouragement", priority: 10 }
        : { id: "deadlift-path", message: "Keep your hands closer to your mid-foot line.", kind: "form", priority: 80 }],
      limitation: "Two-dimensional landmarks cannot assess spinal loading, grip, bar weight, or depth accurately.",
    });
  }

  reset() {
    this.hip.reset();
    this.reps.reset();
  }
}
