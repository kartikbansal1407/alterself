import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export default function BrowserSupportPage() {
  return <div className="marketing-page"><SiteHeader /><main className="prose-page"><p className="eyebrow">BROWSER SUPPORT</p><h1>Built for modern devices.</h1><p className="prose-lede">Final support levels will be based on measured camera, WebAssembly, graphics, and performance behavior.</p><h2>Planned baseline</h2><p>Current Chrome, Edge, Safari, and Firefox releases are the intended target. Older or low-powered devices may receive reduced analysis rates or an unsupported-device explanation.</p><h2>Secure camera access</h2><p>Production camera access requires HTTPS and browser permission. AlterEgo will explain permission recovery without blocking access to account or workout-history controls.</p></main><SiteFooter /></div>;
}

