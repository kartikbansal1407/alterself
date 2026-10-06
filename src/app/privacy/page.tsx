import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export default function PrivacyPage() {
  return (
    <div className="marketing-page">
      <SiteHeader />
      <main className="prose-page">
        <p className="eyebrow">PRIVACY APPROACH</p>
        <h1>Your movement belongs to you.</h1>
        <p className="prose-lede">
          AlterEgo analyzes camera frames in memory on your device. Raw video,
          live frames, recordings, and pose landmark arrays are not stored or
          included in cloud synchronization.
        </p>
        <h2>What may synchronize</h2>
        <p>
          After accounts are connected, approved workout summaries may include
          exercise type, date, duration, repetitions, form signal, angle
          summaries, technique feedback, and goals.
        </p>
        <h2>Camera control</h2>
        <p>
          The camera is requested only after you intentionally start exercise
          setup. A visible control releases it when you finish coaching.
        </p>
        <h2>Current build status</h2>
        <p>
          Workout summaries can be saved in this browser, exported, and
          deleted. Browser storage may be cleared or evicted, and anyone using
          the same browser profile may see it. No account, cloud database, or
          synchronization service is connected.
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}
