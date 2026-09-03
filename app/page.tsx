import Image from "next/image";

import zeroDay from "@/public/zero_day.png";

export default function Home() {
  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center px-6 py-16 sm:py-20">
      <a
        href="https://hackutd.co"
        aria-label="HackUTD home"
        className="absolute top-6 left-6 opacity-60 transition-opacity hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan sm:top-8 sm:left-8"
      >
        <Image
          src="/white-hackutd-logo.svg"
          alt="HackUTD"
          width={132}
          height={38}
          className="h-auto w-20 sm:w-24"
        />
      </a>

      <h1 className="sr-only">HackUTD 2026 — Zero Day. Coming soon.</h1>

      {/*
        The copy below the wordmark pulls the centered stack upward, so the
        wordmark gets a top margin to land near the true middle of the viewport.
        Capped in vh so short screens don't start scrolling.
      */}
      <Image
        src={zeroDay}
        alt="HackUTD's Zero Day"
        preload
        className="wordmark mt-[min(14vh,7rem)] h-auto w-[min(88vw,46rem)]"
      />

      <div
        aria-hidden
        className="rise mt-12 h-px w-24 bg-gradient-to-r from-transparent via-magenta to-transparent"
        style={{ animationDelay: "160ms" }}
      />

      <div
        className="rise mt-8 flex flex-col items-center gap-3 text-center"
        style={{ animationDelay: "240ms" }}
      >
        <p className="font-mono text-xs tracking-[0.4em] text-cyan uppercase sm:text-sm">
          HackUTD 2026
        </p>
        <p className="font-mono text-xs tracking-[0.4em] text-muted uppercase sm:text-sm">
          Website
        </p>
        <p className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Coming soon
        </p>
      </div>
    </main>
  );
}
