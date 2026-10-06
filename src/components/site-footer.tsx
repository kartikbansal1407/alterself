import Link from "next/link";
import { BrandMark } from "@/components/brand-mark";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-brand">
        <BrandMark />
        <div>
          <strong>ALTEREGO</strong>
          <p>Move with better information.</p>
        </div>
      </div>
      <nav aria-label="Footer navigation">
        <Link href="/privacy">Privacy</Link>
        <Link href="/browser-support">Browser support</Link>
        <Link href="/login">Account</Link>
      </nav>
      <p className="footer-note">Beta coaching is fitness guidance, not medical advice.</p>
    </footer>
  );
}

