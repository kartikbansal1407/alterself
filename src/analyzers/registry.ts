import { DeadliftAnalyzer } from "@/analyzers/deadlift";
import { PlankAnalyzer } from "@/analyzers/plank";
import { PushUpAnalyzer } from "@/analyzers/push-up";
import { SquatAnalyzer } from "@/analyzers/squat";
import { TreePoseAnalyzer } from "@/analyzers/tree-pose";
import type { ExerciseAnalyzer, ExerciseDefinition, ExerciseId } from "@/analyzers/types";
import { WarriorIIAnalyzer } from "@/analyzers/warrior-ii";

export const EXERCISE_DEFINITIONS: readonly ExerciseDefinition[] = [
  { id: "squat", name: "Squat", tracking: "Repetitions", view: "Side view recommended", instruction: "Place your device around hip height and keep your full body visible.", requiredLandmarks: "One side: shoulder, hip, knee, ankle", limitations: "Cannot confirm knee tracking or load distribution from one side view." },
  { id: "push-up", name: "Push-up", tracking: "Repetitions", view: "Full-body side view", instruction: "Place the camera low enough to see your shoulders through your ankles.", requiredLandmarks: "One side: shoulder, elbow, wrist, hip, ankle", limitations: "Cannot confirm hand pressure or equal loading." },
  { id: "deadlift", name: "Deadlift", tracking: "Repetitions", view: "Full-body side view", instruction: "Use a stable side view with your hands, hips, knees, and feet visible.", requiredLandmarks: "One side: shoulder, wrist, hip, knee, ankle", limitations: "Cannot assess spinal loading, grip, or bar weight." },
  { id: "plank", name: "Plank", tracking: "Hold time", view: "Shoulder to ankle visible", instruction: "Use a side view and keep your support arm and full body in frame.", requiredLandmarks: "One side: shoulder, elbow, wrist, hip, ankle", limitations: "Cannot measure bracing, pressure, or pain." },
  { id: "warrior-ii", name: "Warrior II", tracking: "Hold time", view: "Front view recommended", instruction: "Keep both hands and both feet visible in a wide front view.", requiredLandmarks: "Both shoulders, elbows, wrists, hips, knees, ankles", limitations: "Cannot assess foot pressure or exact joint rotation." },
  { id: "tree-pose", name: "Tree Pose", tracking: "Hold time", view: "Full-body front view", instruction: "Use a stable front view with your standing foot and head visible.", requiredLandmarks: "Both shoulders, hips, knees, ankles", limitations: "Cannot diagnose balance or determine a safe range." },
] as const;

export function createAnalyzer(id: ExerciseId): ExerciseAnalyzer {
  switch (id) {
    case "squat": return new SquatAnalyzer();
    case "push-up": return new PushUpAnalyzer();
    case "deadlift": return new DeadliftAnalyzer();
    case "plank": return new PlankAnalyzer();
    case "warrior-ii": return new WarriorIIAnalyzer();
    case "tree-pose": return new TreePoseAnalyzer();
  }
}
