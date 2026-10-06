import { angleAt, angleFromVertical, roundAngle } from "@/analyzers/geometry";
import {
  AngleSmoother,
  chooseSide,
  readyResult,
  RepetitionTracker,
  unavailableResult,
} from "@/analyzers/shared";
import type { ExerciseAnalyzer } from "@/analyzers/types";
import type { PoseLandmark } from "@/pose/types";

const VERSION = "squat-rules-1.0.0-beta";
const MIN_CONFIDENCE = 0.55;

export class SquatAnalyzer implements ExerciseAnalyzer {
  readonly exercise = "squat" as const;
  readonly version = VERSION;
  private readonly knee = new AngleSmoother();
  private readonly trunk = new AngleSmoother();
  private readonly reps = new RepetitionTracker(108, 158);

  update(landmarks: PoseLandmark[]) {
    const view = chooseSide(landmarks, ["shoulder", "hip", "knee", "ankle"]);
    if (view.confidence < MIN_CONFIDENCE) {
      return unavailableResult(this.exercise, VERSION, view.confidence, this.reps.repetitions, 0, "Unable to assess reliably. Keep one full side of your body visible.");
    }

    const side = view.side;
    const kneeAngle = this.knee.update(angleAt(landmarks[side.hip], landmarks[side.knee], landmarks[side.ankle]));
    const trunkAngle = this.trunk.update(angleFromVertical(landmarks[side.shoulder], landmarks[side.hip]));
    const stage = this.reps.update(kneeAngle);
    const feedback = trunkAngle > 50
      ? [{ id: "squat-trunk", message: "Keep your chest a little taller.", kind: "form" as const, priority: 80 }]
      : [{ id: "squat-clear", message: "Squat path looks clear.", kind: "encouragement" as const, priority: 10 }];

    return readyResult({
      exercise: this.exercise,
      version: VERSION,
      confidence: view.confidence,
      stage,
      repetitions: this.reps.repetitions,
      score: 100 - Math.max(0, trunkAngle - 35) * 1.4,
      angles: { knee: roundAngle(kneeAngle), trunk: roundAngle(trunkAngle) },
      feedback,
      limitation: "A side view cannot reliably assess knee tracking across the foot or load distribution.",
    });
  }

  reset() {
    this.knee.reset();
    this.trunk.reset();
    this.reps.reset();
  }
}
