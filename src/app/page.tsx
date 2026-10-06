import Link from "next/link";
import { ArrowRight, Camera, Check, Eye, ShieldCheck, Sparkles } from "lucide-react";
import { PoseVisual } from "@/components/pose-visual";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

const exercises = ["Squat", "Push-up", "Deadlift", "Plank", "Yoga"];

export default function Home() {
  return (
    <div className="marketing-page">
      <SiteHeader />
      <main>
        <section className="hero">
          <div className="hero-copy">
            <p className="eyebrow"><Sparkles size={14} aria-hidden="true" /> PRIVATE AI MOVEMENT COACH</p>
            <h1>See your form.<br /><em>Own your movement.</em></h1>
            <p className="hero-lede">Real-time exercise guidance that runs through your camera and keeps your video on your device.</p>
            <div className="hero-actions">
              <Link className="button button-primary" href="/register">Start your first session <ArrowRight size={18} aria-hidden="true" /></Link>
              <Link className="button button-ghost" href="/#how-it-works">See how it works</Link>
            </div>
            <div className="trust-row"><span><ShieldCheck size={16} /> On-device analysis</span><span><Eye size={16} /> No video uploads</span></div>
          </div>
          <PoseVisual />
        </section>

        <section className="exercise-strip" aria-label="Beta exercise coverage">
          <p>TRAIN WITH</p>
          <div>{exercises.map((exercise) => <span key={exercise}>{exercise}<small>BETA</small></span>)}</div>
        </section>

        <section className="how-section" id="how-it-works">
          <div className="section-heading"><p className="eyebrow">HOW IT WORKS</p><h2>Clear feedback.<br />No black box.</h2></div>
          <div className="step-grid">
            <article><span>01</span><Camera aria-hidden="true" /><h3>Set your camera</h3><p>Simple framing guides show where to place your device and which landmarks need to be visible.</p></article>
            <article><span>02</span><Sparkles aria-hidden="true" /><h3>Move naturally</h3><p>Pose landmarks and joint angles are calculated on your device while you exercise.</p></article>
            <article><span>03</span><Check aria-hidden="true" /><h3>Adjust with confidence</h3><p>Written cues and optional voice feedback explain what was observed—or say when the view is unclear.</p></article>
          </div>
        </section>

        <section className="privacy-callout">
          <div><p className="eyebrow">BUILT AROUND YOUR PRIVACY</p><h2>Your camera stays yours.</h2></div>
          <p>AlterEgo processes live movement locally. Only workout summaries you approve can be synchronized to your account.</p>
          <Link href="/privacy">Read the privacy approach <ArrowRight size={17} /></Link>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

