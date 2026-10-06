import { describe, expect, it } from "vitest";
import { createAnalyzer, EXERCISE_DEFINITIONS } from "@/analyzers/registry";
import { LEFT, RIGHT } from "@/analyzers/shared";
import type { ExerciseId } from "@/analyzers/types";
import type { PoseLandmark } from "@/pose/types";

function point(x: number, y: number, visibility = 0.95): PoseLandmark {
  return { x, y, z: 0, visibility };
}

function pose(visibility = 0.95) {
  return Array.from({ length: 33 }, () => point(0.5, 0.5, visibility));
}

function placeThirdAtAngle(
  first: PoseLandmark,
  vertex: PoseLandmark,
  degrees: number,
  length = 0.2,
) {
  const direction = Math.atan2(first.y - vertex.y, first.x - vertex.x) + degrees * Math.PI / 180;
  return point(vertex.x + Math.cos(direction) * length, vertex.y + Math.sin(direction) * length);
}

function squatPose(kneeAngle: number) {
  const landmarks = pose();
  landmarks[LEFT.shoulder] = point(0.47, 0.2);
  landmarks[LEFT.hip] = point(0.5, 0.42);
  landmarks[LEFT.knee] = point(0.5, 0.62);
  landmarks[LEFT.ankle] = placeThirdAtAngle(landmarks[LEFT.hip], landmarks[LEFT.knee], kneeAngle);
  return landmarks;
}

function pushUpPose(elbowAngle: number) {
  const landmarks = pose();
  landmarks[LEFT.shoulder] = point(0.25, 0.5);
  landmarks[LEFT.elbow] = point(0.4, 0.5);
  landmarks[LEFT.wrist] = placeThirdAtAngle(landmarks[LEFT.shoulder], landmarks[LEFT.elbow], elbowAngle, 0.15);
  landmarks[LEFT.hip] = point(0.55, 0.5);
  landmarks[LEFT.ankle] = point(0.85, 0.5);
  return landmarks;
}

function deadliftPose(hipAngle: number) {
  const landmarks = pose();
  landmarks[LEFT.shoulder] = point(0.5, 0.25);
  landmarks[LEFT.hip] = point(0.5, 0.45);
  landmarks[LEFT.knee] = placeThirdAtAngle(landmarks[LEFT.shoulder], landmarks[LEFT.hip], hipAngle);
  landmarks[LEFT.ankle] = point(landmarks[LEFT.knee].x, 0.85);
  landmarks[LEFT.wrist] = point(landmarks[LEFT.ankle].x, 0.6);
  return landmarks;
}

function plankPose() {
  const landmarks = pose();
  landmarks[LEFT.shoulder] = point(0.2, 0.5);
  landmarks[LEFT.elbow] = point(0.25, 0.65);
  landmarks[LEFT.wrist] = point(0.2, 0.75);
  landmarks[LEFT.hip] = point(0.5, 0.5);
  landmarks[LEFT.ankle] = point(0.82, 0.5);
  return landmarks;
}

function warriorPose() {
  const landmarks = pose();
  landmarks[LEFT.shoulder] = point(0.42, 0.3);
  landmarks[LEFT.elbow] = point(0.31, 0.3);
  landmarks[LEFT.wrist] = point(0.2, 0.3);
  landmarks[RIGHT.shoulder] = point(0.58, 0.3);
  landmarks[RIGHT.elbow] = point(0.69, 0.3);
  landmarks[RIGHT.wrist] = point(0.8, 0.3);
  landmarks[LEFT.hip] = point(0.44, 0.5);
  landmarks[LEFT.knee] = point(0.35, 0.68);
  landmarks[LEFT.ankle] = placeThirdAtAngle(landmarks[LEFT.hip], landmarks[LEFT.knee], 95);
  landmarks[RIGHT.hip] = point(0.56, 0.5);
  landmarks[RIGHT.knee] = point(0.65, 0.68);
  landmarks[RIGHT.ankle] = placeThirdAtAngle(landmarks[RIGHT.hip], landmarks[RIGHT.knee], 175);
  return landmarks;
}

function treePose() {
  const landmarks = pose();
  landmarks[LEFT.shoulder] = point(0.42, 0.28);
  landmarks[RIGHT.shoulder] = point(0.58, 0.28);
  landmarks[LEFT.hip] = point(0.46, 0.5);
  landmarks[RIGHT.hip] = point(0.54, 0.5);
  landmarks[LEFT.knee] = point(0.46, 0.7);
  landmarks[LEFT.ankle] = placeThirdAtAngle(landmarks[LEFT.hip], landmarks[LEFT.knee], 175);
  landmarks[RIGHT.knee] = point(0.62, 0.63);
  landmarks[RIGHT.ankle] = placeThirdAtAngle(landmarks[RIGHT.hip], landmarks[RIGHT.knee], 100);
  return landmarks;
}

function repeatUpdate(id: ExerciseId, frames: PoseLandmark[][]) {
  const analyzer = createAnalyzer(id);
  let result = analyzer.update(frames[0], 0);
  frames.forEach((landmarks, index) => {
    result = analyzer.update(landmarks, (index + 1) * 100);
  });
  return result;
}

describe("exercise analyzer registry", () => {
  it("provides a replaceable analyzer for every Beta exercise", () => {
    expect(EXERCISE_DEFINITIONS).toHaveLength(6);
    for (const definition of EXERCISE_DEFINITIONS) {
      expect(createAnalyzer(definition.id).exercise).toBe(definition.id);
    }
  });

  it.each([
    ["squat" as const, squatPose(170), squatPose(90)],
    ["push-up" as const, pushUpPose(170), pushUpPose(85)],
    ["deadlift" as const, deadliftPose(170), deadliftPose(90)],
  ])("counts a complete %s repetition", (id, extended, flexed) => {
    const frames = [extended, extended, ...Array(5).fill(flexed), ...Array(6).fill(extended)];
    expect(repeatUpdate(id, frames).repetitions).toBe(1);
  });

  it.each([
    ["plank" as const, plankPose()],
    ["warrior-ii" as const, warriorPose()],
    ["tree-pose" as const, treePose()],
  ])("tracks reliable %s hold time", (id, landmarks) => {
    const analyzer = createAnalyzer(id);
    const first = analyzer.update(landmarks, 1000);
    const second = analyzer.update(landmarks, 1100);
    expect(first.reliable).toBe(true);
    expect(second.stage).toBe("holding");
    expect(second.holdMs).toBe(100);
  });

  it("suppresses corrective assessment below the landmark threshold", () => {
    const result = createAnalyzer("squat").update(pose(0.2), 0);
    expect(result.reliable).toBe(false);
    expect(result.formScore).toBeNull();
    expect(result.feedback[0].message).toContain("Unable to assess reliably");
  });
});
