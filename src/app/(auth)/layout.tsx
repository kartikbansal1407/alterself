import Link from "next/link";
import { BrandMark } from "@/components/brand-mark";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="auth-page">
      <Link className="brand-link auth-brand" href="/" aria-label="AlterEgo home"><BrandMark /><span>ALTEREGO</span></Link>
      <div className="auth-ambient" aria-hidden="true" />
      {children}
      <p className="auth-privacy">Your camera is never accessed on account pages.</p>
    </main>
  );
}

