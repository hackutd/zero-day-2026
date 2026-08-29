import type { Metadata } from "next";
import { Geist, Geist_Mono, JetBrains_Mono, Saira } from "next/font/google";

import { AudioToggle } from "@/components/audio-toggle";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/*
 * The two faces the Figma design is drawn in. Saira Black is the poster
 * wordmark; JetBrains Mono carries every label, link, and caption. They are
 * loaded here rather than in the footer so the rest of the design can use them
 * as it lands, and so Next hosts them itself instead of hitting Google at
 * runtime.
 */
const saira = Saira({
  variable: "--font-saira",
  subsets: ["latin"],
  weight: ["900"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "HackUTD 2026 — Zero Day",
  description:
    "HackUTD 2026: Zero Day is coming soon. Applications will open soon.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${saira.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      {/*
        The audio control sits in the layout, not the page: it's fixed to the
        viewport corner and should survive any route added later.
      */}
      <body className="font-sans min-h-full">
        {children}
        <AudioToggle />
      </body>
    </html>
  );
}
