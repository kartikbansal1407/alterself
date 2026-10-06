"use client";

import { useEffect, useState } from "react";
import { liveQuery } from "dexie";
import { EXERCISE_DEFINITIONS } from "@/analyzers/registry";
import type { Workout } from "@/workouts/session";
import {
  deleteAllWorkouts,
  deleteWorkout,
  exportWorkouts,
  listWorkouts,
} from "@/workouts/store";

export function WorkoutHistory() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [online, setOnline] = useState<boolean | null>(null);
  const [confirmation, setConfirmation] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [reload, setReload] = useState(0);

  useEffect(() => {
    const subscription = liveQuery(listWorkouts).subscribe({
      next: (rows) => {
        setWorkouts(rows);
        setLoading(false);
        setError("");
      },
      error: () => {
        setLoading(false);
        setError(
          "Local storage is unavailable. Check browser storage permissions, then retry.",
        );
      },
    });
    const updateConnection = () => setOnline(navigator.onLine);
    updateConnection();
    window.addEventListener("online", updateConnection);
    window.addEventListener("offline", updateConnection);
    return () => {
      subscription.unsubscribe();
      window.removeEventListener("online", updateConnection);
      window.removeEventListener("offline", updateConnection);
    };
  }, [reload]);

  async function remove() {
    if (!confirmation) return;
    setBusy(true);
    try {
      if (confirmation === "all") await deleteAllWorkouts();
      else await deleteWorkout(confirmation);
      setConfirmation(null);
    } catch {
      setError(
        "Deletion failed. Your workouts have not been confirmed deleted. Try again.",
      );
    } finally {
      setBusy(false);
    }
  }

  const totalMinutes = Math.round(
    workouts.reduce((total, workout) => total + workout.durationMs, 0) / 60000,
  );
  const totalRepetitions = workouts.reduce(
    (total, workout) => total + workout.repetitions,
    0,
  );

  return (
    <section aria-label="Saved workouts" className="workout-history">
      <p className="phase-note" role="status">
        {online === false
          ? "Offline"
          : online === true
            ? "Online"
            : "Checking connection"}
        {" · "}Saved on this device only. Cloud sync is not connected.
      </p>
      <p>
        Browser data can be cleared or evicted. Export a backup when the
        history matters to you. Anyone using this browser profile can view
        these local workouts.
      </p>

      {loading && <p role="status">Loading workouts…</p>}
      {error && (
        <div className="phase-note" role="alert">
          <p>{error}</p>
          <button
            className="button button-ghost"
            type="button"
            onClick={() => setReload((value) => value + 1)}
          >
            Retry storage
          </button>
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="workout-totals">
            <span><strong>{workouts.length}</strong> sessions</span>
            <span><strong>{totalRepetitions}</strong> repetitions</span>
            <span><strong>{totalMinutes}</strong> minutes</span>
          </div>

          {workouts.length === 0 ? (
            <div className="empty-panel">
              <h2>No saved workouts yet.</h2>
              <p>
                Finish a camera session and choose Save workout to build your
                history.
              </p>
            </div>
          ) : (
            <>
              <div className="workout-actions">
                <button
                  className="button button-ghost"
                  type="button"
                  onClick={() => exportWorkouts(workouts)}
                >
                  Export workouts
                </button>
                <button
                  className="button button-ghost"
                  type="button"
                  onClick={() => setConfirmation("all")}
                >
                  Delete all workouts
                </button>
              </div>

              {workouts.map((workout) => (
                <article className="workout-entry" key={workout.id}>
                  <h3>
                    {EXERCISE_DEFINITIONS.find(
                      (item) => item.id === workout.exercise,
                    )?.name ?? workout.exercise}
                    {" · Beta"}
                  </h3>
                  <p>
                    {new Date(workout.startedAt).toLocaleString()}
                    {" · "}
                    {Math.round(workout.durationMs / 1000)} seconds
                  </p>
                  <p>
                    {workout.repetitions} repetitions ·{" "}
                    {(workout.holdMs / 1000).toFixed(1)} seconds held · Form
                    signal:{" "}
                    {workout.formScore === null
                      ? "Unable to assess reliably"
                      : workout.formScore + "/100"}
                  </p>
                  <details>
                    <summary>Technique summary</summary>
                    <p>
                      {workout.reliableSamples} reliable samples ·{" "}
                      {workout.analyzerVersion}
                    </p>
                    <p>
                      Beta scores are rule-based estimates and are not
                      comparable across exercises or analyzer versions.
                    </p>
                    {Object.entries(workout.angles).map(([name, angle]) => (
                      <p key={name}>
                        {name}: {angle.min.toFixed(1)}–{angle.max.toFixed(1)},
                        average {angle.mean.toFixed(1)}
                      </p>
                    ))}
                    {workout.feedback.map((message) => (
                      <p key={message}>{message}</p>
                    ))}
                  </details>
                  <button
                    className="button button-ghost"
                    type="button"
                    onClick={() => setConfirmation(workout.id)}
                  >
                    Delete workout
                  </button>
                </article>
              ))}
            </>
          )}
        </>
      )}

      {confirmation && (
        <div className="phase-note" role="alert">
          <p>
            Delete{" "}
            {confirmation === "all"
              ? "all saved workouts"
              : "this workout"}{" "}
            from this browser? This cannot be undone. Export first if you need
            a copy.
          </p>
          <button
            className="button button-ghost"
            type="button"
            disabled={busy}
            onClick={() => setConfirmation(null)}
          >
            Cancel
          </button>{" "}
          <button
            className="button button-primary"
            type="button"
            disabled={busy}
            onClick={remove}
          >
            {busy ? "Deleting…" : "Confirm deletion"}
          </button>
        </div>
      )}
    </section>
  );
}
