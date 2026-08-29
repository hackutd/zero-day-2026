import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

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

export const metadata: Metadata = {
  title: "HackUTD 2026 — Zero Day",
  description:
    "HackUTD 2026: Zero Day is coming soon. Applications will open soon.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
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
