"use client";
import { RotateCcw } from "lucide-react";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main className="system-page"><p className="eyebrow">SOMETHING WENT WRONG</p><h1>We could not load this view.</h1><p>Your camera has not been started by this error screen.</p><button className="button button-primary" onClick={reset}><RotateCcw size={17} /> Try again</button></main>;
}

