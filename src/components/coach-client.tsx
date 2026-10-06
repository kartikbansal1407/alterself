"use client";

import { useState } from "react";
import { ArrowRight, CircleDot } from "lucide-react";
import { CameraCoach } from "@/components/camera-coach";
import { EXERCISE_DEFINITIONS } from "@/analyzers/registry";
import type { ExerciseDefinition } from "@/analyzers/types";

export function CoachClient() {
  const [selected, setSelected] = useState<ExerciseDefinition | null>(null);

  if (selected) {
    return (
      <div className="product-page product-page-wide">
        <div className="setup-instruction">
          <span>CAMERA POSITION</span>
          <p>{selected.instruction}</p>
        </div>
        <CameraCoach exercise={selected} onBack={() => setSelected(null)} />
      </div>
    );
  }

  return (
    <div className="product-page">
      <header className="product-header">
        <div>
          <p className="eyebrow">COACH</p>
          <h1>What are you training?</h1>
          <p>Select an exercise to check your camera position and landmark visibility.</p>
        </div>
      </header>
      <div className="exercise-grid">
        {EXERCISE_DEFINITIONS.map((exercise) => (
          <button className="exercise-card" key={exercise.name} type="button" onClick={() => setSelected(exercise)}>
            <span className="beta-label">BETA</span>
            <CircleDot />
            <h2>{exercise.name}</h2>
            <p>{exercise.tracking}</p>
            <small>{exercise.view}</small>
            <ArrowRight className="card-arrow" />
          </button>
        ))}
      </div>
      <p className="phase-note" role="note">
        All analyzers are Beta. They use transparent angle rules and stop corrective feedback when required landmarks are unclear.
      </p>
    </div>
  );
}
