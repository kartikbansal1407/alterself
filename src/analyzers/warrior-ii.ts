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

const VERSION = "warrior-ii-rules-1.0.0-beta";
const MIN_CONFIDENCE = 0.55;
const REQUIRED = [LEFT.shoulder, LEFT.elbow, LEFT.wrist, RIGHT.shoulder, RIGHT.elbow, RIGHT.wrist, LEFT.hip, RIGHT.hip, LEFT.knee, RIGHT.knee, LEFT.ankle, RIGHT.ankle];

export class WarriorIIAnalyzer implements ExerciseAnalyzer {
  readonly exercise = "warrior-ii" as const;
  readonly version = VERSION;
  private readonly hold = new HoldTracker();

  update(landmarks: PoseLandmark[], capturedAt: number) {
    const confidence = landmarkConfidence(landmarks, REQUIRED);
    if (confidence < MIN_CONFIDENCE) {
      this.hold.pause(capturedAt);
      return unavailableResult(this.exercise, VERSION, confidence, 0, this.hold.holdMs, "Unable to assess reliably. Keep both arms, hips, knees, and ankles visible.");
    }

    const leftElbow = angleAt(landmarks[LEFT.shoulder], landmarks[LEFT.elbow], landmarks[LEFT.wrist]);
    const rightElbow = angleAt(landmarks[RIGHT.shoulder], landmarks[RIGHT.elbow], landmarks[RIGHT.wrist]);
    const leftKnee = angleAt(landmarks[LEFT.hip], landmarks[LEFT.knee], landmarks[LEFT.ankle]);
    const rightKnee = angleAt(landmarks[RIGHT.hip], landmarks[RIGHT.knee], landmarks[RIGHT.ankle]);
    const frontKnee = Math.min(leftKnee, rightKnee);
    const shoulderCenter = midpoint(landmarks[LEFT.shoulder], landmarks[RIGHT.shoulder]);
    const wristCenter = midpoint(landmarks[LEFT.wrist], landmarks[RIGHT.wrist]);
    const armLevelOffset = Math.abs(shoulderCenter.y - wristCenter.y);
    const elbowsLong = Math.min(leftElbow, rightElbow) >= 150;
    const frontKneeReady = frontKnee >= 75 && frontKnee <= 125;
    const armsLevel = armLevelOffset <= 0.07;
    const feedback: FeedbackCue[] = [];
    if (!elbowsLong || !armsLevel) feedback.push({ id: "warrior-arms", message: "Reach both arms long and level with your shoulders.", kind: "form", priority: 80 });
    if (!frontKneeReady) feedback.push({ id: "warrior-knee", message: "Bend the front knee toward a right angle, within a comfortable range.", kind: "form", priority: 70 });
    if (!feedback.length) feedback.push({ id: "warrior-clear", message: "Warrior II shape looks steady.", kind: "encouragement", priority: 10 });
    const valid = elbowsLong && armsLevel && frontKneeReady;
    const stage = this.hold.update(valid, capturedAt);

    return readyResult({
      exercise: this.exercise,
      version: VERSION,
      confidence,
      stage,
      holdMs: this.hold.holdMs,
      score: 100 - Math.max(0, 150 - Math.min(leftElbow, rightElbow)) - Math.abs(95 - frontKnee) * 0.4 - armLevelOffset * 180,
      angles: { leftElbow: roundAngle(leftElbow), rightElbow: roundAngle(rightElbow), frontKnee: roundAngle(frontKnee) },
      feedback,
      limitation: "The front camera view cannot assess foot pressure, exact joint rotation, balance, or pain.",
    });
  }

  pause(capturedAt: number) {
    this.hold.pause(capturedAt);
  }

  reset() {
    this.hold.reset();
  }
}
