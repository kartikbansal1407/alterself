import type { PoseLandmark } from "@/pose/types";

const RAD_TO_DEG = 180 / Math.PI;

export function angleAt(
  first: PoseLandmark,
  vertex: PoseLandmark,
  third: PoseLandmark,
) {
  const firstVector = { x: first.x - vertex.x, y: first.y - vertex.y };
  const secondVector = { x: third.x - vertex.x, y: third.y - vertex.y };
  const firstLength = Math.hypot(firstVector.x, firstVector.y);
  const secondLength = Math.hypot(secondVector.x, secondVector.y);
  if (firstLength === 0 || secondLength === 0) return 0;
  const cosine =
    (firstVector.x * secondVector.x + firstVector.y * secondVector.y) /
    (firstLength * secondLength);
  return Math.acos(Math.max(-1, Math.min(1, cosine))) * RAD_TO_DEG;
}

export function angleFromVertical(first: PoseLandmark, second: PoseLandmark) {
  const dx = second.x - first.x;
  const dy = second.y - first.y;
  if (dx === 0 && dy === 0) return 0;
  return Math.atan2(Math.abs(dx), Math.abs(dy)) * RAD_TO_DEG;
}

export function midpoint(first: PoseLandmark, second: PoseLandmark): PoseLandmark {
  return {
    x: (first.x + second.x) / 2,
    y: (first.y + second.y) / 2,
    z: ((first.z ?? 0) + (second.z ?? 0)) / 2,
    visibility: Math.min(first.visibility ?? 0, second.visibility ?? 0),
  };
}

export function signedPointToLineOffset(
  point: PoseLandmark,
  lineStart: PoseLandmark,
  lineEnd: PoseLandmark,
) {
  const dx = lineEnd.x - lineStart.x;
  const dy = lineEnd.y - lineStart.y;
  const length = Math.hypot(dx, dy);
  if (length === 0) return 0;
  return (dx * (point.y - lineStart.y) - dy * (point.x - lineStart.x)) / length;
}

export function distance(first: PoseLandmark, second: PoseLandmark) {
  return Math.hypot(first.x - second.x, first.y - second.y);
}

export function roundAngle(value: number) {
  return Math.round(value * 10) / 10;
}

