import { angleAt, roundAngle } from "@/analyzers/geometry";
import {
  AngleSmoother,
  chooseSide,
  readyResult,
  RepetitionTracker,
  unavailableResult,
} from "@/analyzers/shared";
import type { ExerciseAnalyzer } from "@/analyzers/types";
import type { PoseLandmark } from "@/pose/types";

const VERSION = "push-up-rules-1.0.0-beta";
const MIN_CONFIDENCE = 0.55;

export class PushUpAnalyzer implements ExerciseAnalyzer {
  readonly exercise = "push-up" as const;
  readonly version = VERSION;
  private readonly elbow = new AngleSmoother();
  private readonly body = new AngleSmoother();
  private readonly reps = new RepetitionTracker(100, 155);

  update(landmarks: PoseLandmark[]) {
    const view = chooseSide(landmarks, ["shoulder", "elbow", "wrist", "hip", "ankle"]);
    if (view.confidence < MIN_CONFIDENCE) {
      return unavailableResult(this.exercise, VERSION, view.confidence, this.reps.repetitions, 0, "Unable to assess reliably. Keep your shoulder, working arm, hips, and ankles visible.");
    }

    const side = view.side;
    const elbowAngle = this.elbow.update(angleAt(landmarks[side.shoulder], landmarks[side.elbow], landmarks[side.wrist]));
    const bodyAngle = this.body.update(angleAt(landmarks[side.shoulder], landmarks[side.hip], landmarks[side.ankle]));
    const stage = this.reps.update(elbowAngle);
    const aligned = bodyAngle >= 165;

    return readyResult({
      exercise: this.exercise,
      version: VERSION,
      confidence: view.confidence,
      stage,
      repetitions: this.reps.repetitions,
      score: 100 - Math.max(0, 175 - bodyAngle) * 2.2,
      angles: { elbow: roundAngle(elbowAngle), bodyLine: roundAngle(bodyAngle) },
      feedback: [aligned
        ? { id: "push-up-clear", message: "Body line looks steady.", kind: "encouragement", priority: 10 }
        : { id: "push-up-line", message: "Bring shoulders, hips, and ankles into one line.", kind: "form", priority: 80 }],
      limitation: "A single side view cannot confirm hand pressure, shoulder rotation, or equal loading.",
    });
  }

  reset() {
    this.elbow.reset();
    this.body.reset();
    this.reps.reset();
  }
}
