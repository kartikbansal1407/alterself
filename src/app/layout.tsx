import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "AlterEgo — Move with better information", template: "%s · AlterEgo" },
  description: "Private, real-time exercise guidance powered by on-device pose analysis.",
};

export const viewport: Viewport = {
  colorScheme: "dark",
  themeColor: "#090b0b",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" data-scroll-behavior="smooth"><body>{children}</body></html>;
}
