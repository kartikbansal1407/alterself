import { describe, expect, it } from "vitest";
import type { AnalyzerResult } from "@/analyzers/types";
import { WorkoutSession } from "@/workouts/session";

function result(overrides: Partial<AnalyzerResult> = {}): AnalyzerResult {
  return {
    exercise: "squat",
    analyzerVersion: "squat-test",
    reliable: true,
    confidence: 0.9,
    stage: "rising",
    repetitions: 1,
    holdMs: 0,
    formScore: 80,
    angles: { knee: 90 },
    feedback: [{
      id: "chest",
      message: "Keep your chest a little taller.",
      kind: "form",
      priority: 80,
    }],
    ...overrides,
  };
}

describe("WorkoutSession", () => {
  it("aggregates only reliable workout summaries", () => {
    const session = new WorkoutSession("squat", "squat-test", 1000, "workout-1");
    session.record(result());
    session.record(result({
      repetitions: 2,
      formScore: 100,
      angles: { knee: 170 },
    }));
    session.record(result({ reliable: false, repetitions: 99 }));

    const workout = session.finish(61000);
    expect(workout).toMatchObject({
      id: "workout-1",
      durationMs: 60000,
      repetitions: 2,
      formScore: 90,
      reliableSamples: 2,
      syncStatus: "local-only",
    });
    expect(workout.angles.knee).toEqual({ min: 90, max: 170, mean: 130 });
    expect(workout.feedback).toEqual(["Keep your chest a little taller."]);
    expect(workout).not.toHaveProperty("landmarks");
    expect(workout).not.toHaveProperty("frames");
    expect(workout).not.toHaveProperty("video");
  });

  it("does not create a confident score without reliable samples", () => {
    const session = new WorkoutSession("plank", "plank-test", 1000, "workout-2");
    session.record(result({ exercise: "squat" }));
    const workout = session.finish(2000);

    expect(workout.formScore).toBeNull();
    expect(workout.reliableSamples).toBe(0);
    expect(workout.angles).toEqual({});
  });
});
