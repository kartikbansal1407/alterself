import { WorkoutHistory } from "@/components/workout-history";

export default function ProgressPage() {
  return (
    <div className="product-page">
      <header className="product-header">
        <div>
          <p className="eyebrow">PROGRESS</p>
          <h1>Your training history.</h1>
        </div>
      </header>
      <WorkoutHistory />
    </div>
  );
}
