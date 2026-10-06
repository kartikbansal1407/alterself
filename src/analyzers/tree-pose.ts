import { angleAt, midpoint, roundAngle } from "@/analyzers/geometry";
import {
  HoldTracker,
  landmarkConfidence,
  LEFT,
  readyResult,
  RIGHT,
  unavailableResult,
} from "@/analyzers/shared";
import type { ExerciseAnalyzer, FeedbackCue } from "@/analyzers/types";
import type { PoseLandmark } from "@/pose/types";

const VERSION = "tree-pose-rules-1.0.0-beta";
const MIN_CONFIDENCE = 0.55;
const REQUIRED = [LEFT.shoulder, RIGHT.shoulder, LEFT.hip, RIGHT.hip, LEFT.knee, RIGHT.knee, LEFT.ankle, RIGHT.ankle];

export class TreePoseAnalyzer implements ExerciseAnalyzer {
  readonly exercise = "tree-pose" as const;
  readonly version = VERSION;
  private readonly hold = new HoldTracker();

  update(landmarks: PoseLandmark[], capturedAt: number) {
    const confidence = landmarkConfidence(landmarks, REQUIRED);
    if (confidence < MIN_CONFIDENCE) {
      this.hold.pause(capturedAt);
      return unavailableResult(this.exercise, VERSION, confidence, 0, this.hold.holdMs, "Unable to assess reliably. Keep both shoulders, hips, knees, and ankles visible.");
    }

    const leftKnee = angleAt(landmarks[LEFT.hip], landmarks[LEFT.knee], landmarks[LEFT.ankle]);
    const rightKnee = angleAt(landmarks[RIGHT.hip], landmarks[RIGHT.knee], landmarks[RIGHT.ankle]);
    const standingKnee = Math.max(leftKnee, rightKnee);
    const raisedKnee = Math.min(leftKnee, rightKnee);
    const shoulderCenter = midpoint(landmarks[LEFT.shoulder], landmarks[RIGHT.shoulder]);
    const hipCenter = midpoint(landmarks[LEFT.hip], landmarks[RIGHT.hip]);
    const torsoOffset = Math.abs(shoulderCenter.x - hipCenter.x);
    const supportStraight = standingKnee >= 155;
    const legRaised = raisedKnee <= 145;
    const torsoCentered = torsoOffset <= 0.07;
    const feedback: FeedbackCue[] = [];
    if (!supportStraight) feedback.push({ id: "tree-support", message: "Lengthen your standing leg without locking the knee.", kind: "form", priority: 80 });
    if (!legRaised) feedback.push({ id: "tree-raised", message: "Turn the raised knee outward within a comfortable range.", kind: "form", priority: 70 });
    if (!torsoCentered) feedback.push({ id: "tree-center", message: "Bring your shoulders back over the center of your hips.", kind: "form", priority: 60 });
    if (!feedback.length) feedback.push({ id: "tree-clear", message: "Tree Pose looks balanced. Keep breathing.", kind: "encouragement", priority: 10 });
    const valid = supportStraight && legRaised && torsoCentered;
    const stage = this.hold.update(valid, capturedAt);

    return readyResult({
      exercise: this.exercise,
      version: VERSION,
      confidence,
      stage,
      holdMs: this.hold.holdMs,
      score: 100 - Math.max(0, 165 - standingKnee) - Math.max(0, raisedKnee - 130) * 0.5 - torsoOffset * 240,
      angles: { standingKnee: roundAngle(standingKnee), raisedKnee: roundAngle(raisedKnee) },
      feedback,
      limitation: "Two-dimensional video cannot determine foot pressure, stability causes, or a safe range for your body.",
    });
  }

  pause(capturedAt: number) {
    this.hold.pause(capturedAt);
  }

  reset() {
    this.hold.reset();
  }
}
