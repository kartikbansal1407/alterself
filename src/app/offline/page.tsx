import Link from "next/link";
import { CloudOff } from "lucide-react";

export default function OfflinePage() {
  return <main className="system-page"><CloudOff /><p className="eyebrow">YOU ARE OFFLINE</p><h1>Your local workout can continue.</h1><p>When local workout storage is implemented, completed sessions will wait safely on this device and retry synchronization after you reconnect.</p><Link className="button button-primary" href="/dashboard">Return to dashboard</Link></main>;
}

