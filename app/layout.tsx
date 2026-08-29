import type { Metadata } from "next";
import localFont from "next/font/local";

import { AudioToggle } from "@/components/audio-toggle";
import { SiteNav } from "@/components/site-nav";
import { SmoothScroll } from "@/components/smooth-scroll";

import "./globals.css";

/*
 * Satoshi, the HackUTD brand face, carried over from the hackutd.co repo. One
 * variable file spans the whole 300-900 range, so it is a single request rather
 * than one per weight. It replaces the Geist pair the Next scaffold shipped
 * with, which nothing in this project actually used.
 */
const satoshi = localFont({
  src: "./fonts/Satoshi-Variable.woff2",
  variable: "--font-satoshi",
  weight: "300 900",
  display: "swap",
});

/*
 * Hypik, by Matt Cole Wilson (mattcolewilson.com) — the brand wordmark face in
 * the Figma nav. Self-hosted because it isn't on Google Fonts; the licence
 * (app/fonts/hypik-LICENSE.txt) allows commercial use and free redistribution
 * with a link back, so the credit belongs in the footer's Info column.
 *
 * Heads up: this font is letters only. It has no digits and no punctuation at
 * all, so anything with a number or a mark in it will silently fall back
 * mid-word. Keep it to alphabetic display text.
 */
const hypik = localFont({
  src: "./fonts/hypik.otf",
  variable: "--font-hypik",
  display: "swap",
});

export const metadata: Metadata = {
  title: "HackUTD Zero Day",
  description:
    "HackUTD 2026: Zero Day is coming soon. Applications will open soon.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${satoshi.variable} ${hypik.variable} h-full antialiased`}
    >
      {/*
        The audio control sits in the layout, not the page: it's fixed to the
        viewport corner and should survive any route added later.
      */}
      <body className="font-sans min-h-full">
        <SmoothScroll />
        <SiteNav />
        {children}
        <AudioToggle />
      </body>
    </html>
  );
}
