import { describe, expect, it } from "vitest";
import { assessTracking } from "@/pose/reliability";
import type { PoseLandmark } from "@/pose/types";

function pose(overrides: Record<number, Partial<PoseLandmark>> = {}) {
  return Array.from({ length: 33 }, (_, index) => ({
    x: 0.5,
    y: 0.5,
    z: 0,
    visibility: 0.95,
    ...overrides[index],
  })) satisfies PoseLandmark[];
}

describe("assessTracking", () => {
  it("asks the user to enter the frame when no pose exists", () => {
    expect(assessTracking(null).state).toBe("no_pose");
  });

  it("withholds a ready state when required landmarks are unreliable", () => {
    const landmarks = pose({
      25: { visibility: 0.1 },
      26: { visibility: 0.1 },
      27: { visibility: 0.1 },
    });
    expect(assessTracking(landmarks).state).toBe("limited");
  });

  it("reports ready only when the required body landmarks are visible and framed", () => {
    expect(assessTracking(pose())).toEqual({
      state: "ready",
      message: "Position clear",
      detail: "Your main body landmarks are visible.",
    });
  });
});

