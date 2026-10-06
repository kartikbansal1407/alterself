import Link from "next/link";
import { Activity, Dumbbell, Gauge, Settings } from "lucide-react";
import { BrandMark } from "@/components/brand-mark";

const links = [
  { href: "/dashboard", label: "Home", icon: Gauge },
  { href: "/coach", label: "Coach", icon: Dumbbell },
  { href: "/progress", label: "Progress", icon: Activity },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-frame">
      <aside className="app-sidebar">
        <Link className="brand-link" href="/dashboard" aria-label="AlterEgo dashboard">
          <BrandMark /><span>ALTEREGO</span>
        </Link>
        <nav aria-label="Application navigation">
          {links.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href}><Icon size={19} aria-hidden="true" /><span>{label}</span></Link>
          ))}
        </nav>
        <div className="beta-note"><span>BETA</span><p>Coaching accuracy varies by exercise and camera setup.</p></div>
      </aside>
      <main className="app-main">{children}</main>
      <nav className="mobile-tabbar" aria-label="Application navigation">
        {links.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href}><Icon size={20} aria-hidden="true" /><span>{label}</span></Link>
        ))}
      </nav>
    </div>
  );
}

