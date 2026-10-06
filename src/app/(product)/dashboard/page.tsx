import Link from "next/link";
import { ArrowRight, Camera, CloudOff, Dumbbell } from "lucide-react";
import { WorkoutHistory } from "@/components/workout-history";

export default function DashboardPage() {
  return (
    <div className="product-page">
      <header className="product-header"><div><p className="eyebrow">YOUR TRAINING SPACE</p><h1>Ready when you are.</h1></div><span className="sync-chip"><CloudOff size={15} /> Local preview</span></header>
      <section className="start-card"><div><span className="round-icon"><Camera /></span><p className="eyebrow">NEW SESSION</p><h2>Choose a movement.<br />Set your camera. Begin.</h2><p>Camera access starts only after you choose an exercise and confirm setup.</p><Link className="button button-primary" href="/coach">Choose exercise <ArrowRight size={18} /></Link></div><div className="start-orbit" aria-hidden="true"><Dumbbell /></div></section>
      <WorkoutHistory />
    </div>
  );
}
