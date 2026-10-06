import type { AnalyzerResult, ExerciseId } from "@/analyzers/types";

export type WorkoutSyncStatus = "local-only" | "pending" | "synced" | "failed";

export interface Workout {
  id: string;
  exercise: ExerciseId;
  startedAt: string;
  updatedAt: string;
  durationMs: number;
  repetitions: number;
  holdMs: number;
  formScore: number | null;
  reliableSamples: number;
  analyzerVersion: string;
  angles: Record<string, { min: number; max: number; mean: number }>;
  feedback: string[];
  syncStatus: WorkoutSyncStatus;
  syncRevision: number;
}

type AngleAggregate = {
  min: number;
  max: number;
  total: number;
  count: number;
};

// Stores aggregate movement data only. Frames, recordings, and landmark arrays
// never enter the workout object.
export class WorkoutSession {
  private samples = 0;
  private scoreTotal = 0;
  private scoreSamples = 0;
  private repetitions = 0;
  private holdMs = 0;
  private angles: Record<string, AngleAggregate> = {};
  private feedback = new Set<string>();

  constructor(
    private readonly exercise: ExerciseId,
    private readonly version: string,
    private readonly started = Date.now(),
    private readonly id = crypto.randomUUID(),
  ) {}

  record(result: AnalyzerResult) {
    if (!result.reliable || result.exercise !== this.exercise) return;
    this.samples += 1;
    this.repetitions = Math.max(this.repetitions, result.repetitions);
    this.holdMs = Math.max(this.holdMs, result.holdMs);

    if (result.formScore !== null && Number.isFinite(result.formScore)) {
      this.scoreTotal += result.formScore;
      this.scoreSamples += 1;
    }

    for (const [key, value] of Object.entries(result.angles)) {
      if (!Number.isFinite(value)) continue;
      const current = this.angles[key];
      this.angles[key] = current
        ? {
            min: Math.min(current.min, value),
            max: Math.max(current.max, value),
            total: current.total + value,
            count: current.count + 1,
          }
        : { min: value, max: value, total: value, count: 1 };
    }

    for (const cue of result.feedback) {
      if (cue.kind === "form" && this.feedback.size < 20) {
        this.feedback.add(cue.message);
      }
    }
  }

  finish(now = Date.now()): Workout {
    const finishedAt = new Date(now).toISOString();
    return {
      id: this.id,
      exercise: this.exercise,
      startedAt: new Date(this.started).toISOString(),
      updatedAt: finishedAt,
      durationMs: Math.max(0, now - this.started),
      repetitions: this.repetitions,
      holdMs: this.holdMs,
      reliableSamples: this.samples,
      analyzerVersion: this.version,
      formScore: this.scoreSamples
        ? Math.round(this.scoreTotal / this.scoreSamples)
        : null,
      angles: Object.fromEntries(
        Object.entries(this.angles).map(([key, value]) => [
          key,
          {
            min: value.min,
            max: value.max,
            mean: Math.round((value.total / value.count) * 10) / 10,
          },
        ]),
      ),
      feedback: [...this.feedback],
      syncStatus: "local-only",
      syncRevision: 1,
    };
  }
}
