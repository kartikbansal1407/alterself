import Dexie, { type Table } from "dexie";
import type { Workout } from "@/workouts/session";

class WorkoutDatabase extends Dexie {
  workouts!: Table<Workout, string>;

  constructor() {
    super("alterego-local");
    this.version(1).stores({
      workouts: "id, startedAt, exercise, syncStatus, updatedAt",
    });
  }
}

export const workoutDatabase = new WorkoutDatabase();

export function listWorkouts() {
  return workoutDatabase.workouts.orderBy("startedAt").reverse().toArray();
}

// UUID primary keys make retrying an uncertain write idempotent.
export function saveWorkout(workout: Workout) {
  return workoutDatabase.workouts.put(workout);
}

export function deleteWorkout(id: string) {
  return workoutDatabase.workouts.delete(id);
}

export function deleteAllWorkouts() {
  return workoutDatabase.workouts.clear();
}

export function exportWorkouts(workouts: Workout[]) {
  const payload = {
    schemaVersion: 1,
    exportedAt: new Date().toISOString(),
    workouts,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "alterego-workouts.json";
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
