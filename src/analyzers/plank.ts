import { angleAt, roundAngle } from "@/analyzers/geometry";
import {
  AngleSmoother,
  chooseSide,
  HoldTracker,
  readyResult,
  unavailableResult,
} from "@/analyzers/shared";
import type { ExerciseAnalyzer } from "@/analyzers/types";
import type { PoseLandmark } from "@/pose/types";

const VERSION = "plank-rules-1.0.0-beta";
const MIN_CONFIDENCE = 0.55;

export class PlankAnalyzer implements ExerciseAnalyzer {
  readonly exercise = "plank" as const;
  readonly version = VERSION;
  private readonly body = new AngleSmoother();
  private readonly hold = new HoldTracker();

  update(landmarks: PoseLandmark[], capturedAt: number) {
    const view = chooseSide(landmarks, ["shoulder", "elbow", "wrist", "hip", "ankle"]);
    if (view.confidence < MIN_CONFIDENCE) {
      this.hold.pause(capturedAt);
      return unavailableResult(this.exercise, VERSION, view.confidence, 0, this.hold.holdMs, "Unable to assess reliably. Keep your support arm, hips, and ankles visible from the side.");
    }

    const side = view.side;
    const bodyAngle = this.body.update(angleAt(landmarks[side.shoulder], landmarks[side.hip], landmarks[side.ankle]));
    const aligned = bodyAngle >= 165;
    const stage = this.hold.update(aligned, capturedAt);

    return readyResult({
      exercise: this.exercise,
      version: VERSION,
      confidence: view.confidence,
      stage,
      holdMs: this.hold.holdMs,
      score: 100 - Math.max(0, 175 - bodyAngle) * 2.2,
      angles: { bodyLine: roundAngle(bodyAngle) },
      feedback: [aligned
        ? { id: "plank-clear", message: "Strong line. Keep breathing.", kind: "encouragement", priority: 10 }
        : { id: "plank-line", message: "Bring shoulders, hips, and ankles into one line.", kind: "form", priority: 80 }],
      limitation: "The camera cannot measure abdominal bracing, pressure, pain, or shoulder loading.",
    });
  }

  pause(capturedAt: number) {
    this.hold.pause(capturedAt);
  }

  reset() {
    this.body.reset();
    this.hold.reset();
  }
}
