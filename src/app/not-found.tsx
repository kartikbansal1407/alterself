import Link from "next/link";

export default function NotFound() {
  return <main className="system-page"><p className="eyebrow">404</p><h1>That route is out of range.</h1><p>Return to your training space and choose another path.</p><Link className="button button-primary" href="/">Go home</Link></main>;
}

