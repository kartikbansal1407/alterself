import type { PoseLandmark, TrackingReliability } from "@/pose/types";

const BODY_LANDMARKS = [11, 12, 23, 24, 25, 26, 27, 28] as const;
const FRAME_MARGIN = 0.035;
const VISIBILITY_THRESHOLD = 0.55;

export function assessTracking(landmarks: PoseLandmark[] | null): TrackingReliability {
  if (!landmarks || landmarks.length < 29) {
    return {
      state: "no_pose",
      message: "Step into frame",
      detail: "Keep your shoulders, hips, knees, and ankles visible.",
    };
  }

  const required = BODY_LANDMARKS.map((index) => landmarks[index]);
  const visibleCount = required.filter(
    (landmark) => (landmark?.visibility ?? 0) >= VISIBILITY_THRESHOLD,
  ).length;

  if (visibleCount / required.length < 0.75) {
    return {
      state: "limited",
      message: "We cannot see enough clearly",
      detail: "Improve the lighting and face the recommended camera direction.",
    };
  }

  const outsideFrame = required.some(
    (landmark) =>
      landmark.x < FRAME_MARGIN ||
      landmark.x > 1 - FRAME_MARGIN ||
      landmark.y < FRAME_MARGIN ||
      landmark.y > 1 - FRAME_MARGIN,
  );

  if (outsideFrame) {
    return {
      state: "limited",
      message: "Move a little farther back",
      detail: "Keep your shoulders, hips, knees, and ankles inside the guide.",
    };
  }

  return {
    state: "ready",
    message: "Position clear",
    detail: "Your main body landmarks are visible.",
  };
}

