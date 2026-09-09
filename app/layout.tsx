import type { Metadata } from "next";
import localFont from "next/font/local";

import { AudioToggle } from "@/components/audio-toggle";
import { EdgeRails } from "@/components/edge-rails";
import { MediaFade } from "@/components/media-fade";
import { RevealOnScroll } from "@/components/reveal-on-scroll";
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
 * Hypik, by Matt Cole Wilson (mattcolewilson.com) - the brand wordmark face in
 * the Figma nav. Self-hosted because it isn't on Google Fonts; the licence
 * (docs/fonts/hypik-LICENSE.txt) allows commercial use and free redistribution
 * with a link back, so the credit belongs in the footer's Info column.
 *
 * Heads up: this font is letters only. It has no digits and no punctuation at
 * all, so anything with a number or a mark in it will silently fall back
 * mid-word. Keep it to alphabetic display text.
 */
const hypik = localFont({
  // woff2, converted from the shipped OTF with fontTools: same 72 glyphs and
  // the same CFF outlines, 4.1KB against 12.8KB. An OTF has no font-specific
  // compression, and this face is preloaded - it sets the prehero headline and
  // the nav wordmark, so it is on the critical path and the 8.6KB is real.
  src: "./fonts/hypik.woff2",
  variable: "--font-hypik",
  display: "swap",
});

/*
 * Elevon, by Dalton Maag - a display face whose five styles are a gravity axis
 * (ZeroG through FourG) rather than the usual light-to-black naming. They map
 * onto CSS weights by the usWeightClass each file declares: 300, 400, 500, 700,
 * 800. Reach for them by weight, e.g. `font-elevon font-bold`.
 *
 * These are the TRIAL files, converted from the shipped TTFs to woff2 (same
 * outlines, ~40KB each instead of ~155KB). The trial licence in
 * docs/fonts/elevon-TRIAL-LICENCE.pdf is for evaluation, so before this face
 * goes out on the live site it needs a purchased licence and the retail files
 * dropped in over these. The filenames say `trial` so that stays obvious.
 */
const elevon = localFont({
  src: [
    {
      path: "./fonts/elevon-trial-zerog.woff2",
      weight: "300",
      style: "normal",
    },
    { path: "./fonts/elevon-trial-oneg.woff2", weight: "400", style: "normal" },
    { path: "./fonts/elevon-trial-twog.woff2", weight: "500", style: "normal" },
    {
      path: "./fonts/elevon-trial-threeg.woff2",
      weight: "700",
      style: "normal",
    },
    {
      path: "./fonts/elevon-trial-fourg.woff2",
      weight: "800",
      style: "normal",
    },
  ],
  variable: "--font-elevon",
  display: "swap",
  /*
   * Not preloaded. next/font preloads every declared face by default, which put
   * all five of these in the head - ~200KB bidding against the prehero plate,
   * the LCP, on the same connection. The prehero date uses the 500 face, while
   * the larger display uses sit farther down the page. `display: swap` lets
   * the date render while its face loads without preloading all five styles.
   *
   * Worth knowing while in here: only 500, 700 and 800 are actually asked for
   * by any component today. ZeroG (300) and OneG (400) are declared for the
   * completeness of the gravity axis and cost nothing now that none of this
   * group preloads.
   */
  preload: false,
});

export const metadata: Metadata = {
  title: "HackUTD Zero Day",
  description: "HackUTD 2026: Zero Day is coming soon.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${satoshi.variable} ${hypik.variable} ${elevon.variable} h-full antialiased`}
    >
      {/*
        The audio control sits in the layout, not the page: it's fixed to the
        viewport corner and should survive any route added later.
      */}
      <body className="font-sans min-h-full">
        <SmoothScroll />
        <RevealOnScroll />
        <MediaFade />
        <EdgeRails />
        <SiteNav />
        {children}
        <AudioToggle />
      </body>
    </html>
  );
}
