import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { BrandMark } from "@/components/brand-mark";

export function SiteHeader() {
  return (
    <header className="site-header">
      <Link className="brand-link" href="/" aria-label="AlterEgo home">
        <BrandMark />
        <span>ALTEREGO</span>
      </Link>
      <nav className="public-nav" aria-label="Primary navigation">
        <Link href="/#how-it-works">How it works</Link>
        <Link href="/login">Log in</Link>
        <Link className="button button-small button-primary" href="/register">
          Start training <ArrowUpRight size={16} aria-hidden="true" />
        </Link>
      </nav>
    </header>
  );
}

