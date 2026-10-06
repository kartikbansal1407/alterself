import { describe, expect, it } from "vitest";
import {
  angleAt,
  angleFromVertical,
  signedPointToLineOffset,
} from "@/analyzers/geometry";
import { AngleSmoother, HoldTracker, RepetitionTracker } from "@/analyzers/shared";
import type { PoseLandmark } from "@/pose/types";

const point = (x: number, y: number): PoseLandmark => ({
  x,
  y,
  z: 0,
  visibility: 1,
});

describe("movement state helpers", () => {
  it("smooths sudden angle changes", () => {
    const smoother = new AngleSmoother(0.5);
    expect(smoother.update(170)).toBe(170);
    expect(smoother.update(90)).toBe(130);
  });

  it("counts only a flexed-to-extended cycle", () => {
    const tracker = new RepetitionTracker(100, 155);
    tracker.update(170);
    tracker.update(90);
    tracker.update(170);
    expect(tracker.repetitions).toBe(1);
  });

  it("does not add paused time to a hold", () => {
    const tracker = new HoldTracker();
    tracker.update(true, 0);
    tracker.update(true, 100);
    tracker.pause(200);
    tracker.update(true, 1000);
    expect(tracker.holdMs).toBe(100);
  });
});

describe("pose geometry", () => {
  it("calculates a right angle", () => {
    expect(angleAt(point(0, 1), point(0, 0), point(1, 0))).toBeCloseTo(90);
  });

  it("calculates inclination from vertical", () => {
    expect(angleFromVertical(point(0, 0), point(1, 1))).toBeCloseTo(45);
  });

  it("preserves the direction of point-to-line offset", () => {
    expect(signedPointToLineOffset(point(0.5, 0.6), point(0, 0.5), point(1, 0.5))).toBeGreaterThan(0);
    expect(signedPointToLineOffset(point(0.5, 0.4), point(0, 0.5), point(1, 0.5))).toBeLessThan(0);
  });
});
