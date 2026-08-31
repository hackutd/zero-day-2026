"use client";

import { useSyncExternalStore } from "react";

/**
 * Countdown to the hackathon.
 *
 * TODO(organizers): confirm this. It is taken from the FAQ's "November 8th and
 * 9th", which is copy carried over from the 2025 site, so the day is a
 * placeholder until someone confirms the 2026 date. Written with an explicit
 * -06:00 rather than a bare date so it means one instant everywhere: a bare
 * "2026-11-08" would be parsed as UTC and land six hours early in Dallas.
 */
const TARGET = new Date("2026-11-08T09:00:00-06:00");

/**
 * The clock is external, mutable state, so it is read through
 * `useSyncExternalStore` rather than mirrored into state from an effect. That
 * also solves the hydration problem for free: the server snapshot is `null`,
 * React uses it for the hydrating render too, and only then swaps to live time
 * — so the markup never disagrees with itself.
 *
 * The snapshot is cached rather than calling `Date.now()` on read, because
 * `getSnapshot` must return a stable value between actual changes or React
 * re-renders forever.
 */
let cachedNow = Date.now();

function subscribeToClock(onStoreChange: () => void) {
  const id = setInterval(() => {
    cachedNow = Date.now();
    onStoreChange();
  }, 1000);
  return () => clearInterval(id);
}

function useNow(): number | null {
  return useSyncExternalStore(
    subscribeToClock,
    () => cachedNow,
    () => null,
  );
}

const UNITS = ["Days", "Hours", "Minutes", "Seconds"] as const;

function split(msRemaining: number) {
  const s = Math.max(0, Math.floor(msRemaining / 1000));
  return [
    Math.floor(s / 86400),
    Math.floor((s % 86400) / 3600),
    Math.floor((s % 3600) / 60),
    s % 60,
  ];
}

const NOTCH =
  "polygon(14px 0, 100% 0, 100% calc(100% - 14px), calc(100% - 14px) 100%, 0 100%, 0 14px)";

export function SiteCountdown() {
  const now = useNow();
  // Null on the server and during hydration; dashes hold the layout so nothing
  // jumps when the real figures arrive a frame later.
  const parts = now === null ? null : split(TARGET.getTime() - now);
  const done = parts !== null && parts.every((n) => n === 0);

  return (
    <section
      aria-labelledby="countdown-heading"
      className="bg-background px-5 pt-20 pb-4 sm:px-6 sm:pt-28"
    >
      <div className="mx-auto max-w-[820px]">
        <h2
          id="countdown-heading"
          className="font-hypik text-center leading-none tracking-[-0.02em] text-white uppercase"
          style={{ fontSize: "clamp(1.75rem, 5vw, 3rem)" }}
        >
          {/* Hypik has no digits, so the year stays out of the display face. */}
          Countdown
        </h2>

        <p
          className="font-sans text-text-muted mt-4 text-center text-[12px] leading-[1.6] tracking-[0.1em] uppercase"
          // The live region is polite and only the summary line is announced —
          // a screen reader being read four numbers every second is unusable.
          aria-live="polite"
        >
          {done
            ? "Zero Day is here"
            : "Until HackUTD 2026 — University of Texas at Dallas"}
        </p>

        <ol className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          {UNITS.map((unit, i) => (
            <li
              key={unit}
              style={{ clipPath: NOTCH }}
              className="bg-white/12 p-px"
            >
              <div
                style={{ clipPath: NOTCH }}
                className="flex flex-col items-center justify-center gap-2 bg-[#0b0910] px-4 py-6 sm:py-8"
              >
                <span
                  className="font-sans text-white tabular-nums"
                  style={{
                    fontSize: "clamp(2rem, 6vw, 3.25rem)",
                    lineHeight: 1,
                    fontWeight: 700,
                    letterSpacing: "-0.02em",
                  }}
                >
                  {parts === null ? "--" : String(parts[i]).padStart(2, "0")}
                </span>
                <span className="font-sans text-accent-soft text-[10px] leading-none tracking-[0.18em] uppercase">
                  {unit}
                </span>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
