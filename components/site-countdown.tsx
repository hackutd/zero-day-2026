"use client";

import { useSyncExternalStore } from "react";

/**
 * Countdown to the hackathon.
 *
 * TODO(design): a decorative border is coming for this section. The chamfered
 * cells below are the interim treatment - the same notch as the buttons and
 * the keynote portrait above - so the section reads as finished chrome until
 * the real frame arrives and wraps it.
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
 * - so the markup never disagrees with itself.
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

/**
 * One cell per unit, each with its own clip playing behind the figure.
 *
 * The footage is the section: a phone, an eye reading code off a screen, hands
 * on a keyboard, a wall of plugged-in machines. Converted from the source GIFs
 * to H.264 for the same reason the building ads were - a GIF of this length is
 * several megabytes and cannot be hardware-decoded - and muted, looped and
 * `playsInline`, so they behave as texture rather than as media the reader has
 * to deal with.
 */
const UNITS = [
  // Days is the figure anyone actually reads, so it takes the accent purple
  // and the other three stay white behind it.
  { label: "Days", clip: "/countdown/phone.mp4", accent: true },
  { label: "Hours", clip: "/countdown/eye.mp4", accent: false },
  { label: "Minutes", clip: "/countdown/keys.mp4", accent: false },
  { label: "Seconds", clip: "/countdown/plugs.mp4", accent: false },
] as const;

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
    // A screenful: the section is at least the viewport tall and centres in
    // it, so the clock is the whole view when you reach it rather than a strip
    // between two others. `svh` rather than `vh` because mobile browser chrome
    // makes `100vh` taller than the screen actually is.
    <section
      aria-labelledby="countdown-heading"
      className="bg-background flex min-h-svh flex-col justify-center px-5 py-16 sm:px-6"
    >
      <div className="mx-auto w-full max-w-[1400px]">
        <h2
          id="countdown-heading"
          className="font-hypik text-center leading-none tracking-[-0.02em] text-white uppercase"
          style={{ fontSize: "clamp(2.25rem, 8vw, 6rem)" }}
        >
          {/* Hypik has no digits, so the year stays out of the display face. */}
          Countdown
        </h2>

        <p
          className="font-sans text-text-muted mt-5 text-center text-[12px] leading-[1.6] tracking-[0.1em] uppercase sm:text-[13px]"
          // The live region is polite and only the summary line is announced -
          // a screen reader being read four numbers every second is unusable.
          aria-live="polite"
        >
          {done
            ? "Zero Day is here"
            : "Until HackUTD 2026 · University of Texas at Dallas"}
        </p>

        <ol className="mt-8 grid grid-cols-2 gap-3 sm:mt-12 sm:grid-cols-4 sm:gap-5">
          {UNITS.map(({ label, clip, accent }, i) => (
            <li
              key={label}
              style={{ clipPath: NOTCH }}
              className="bg-white/12 p-px"
            >
              <div
                style={{ clipPath: NOTCH }}
                className="relative flex h-[26svh] flex-col items-center justify-center gap-3 overflow-hidden bg-[#0b0910] px-4 sm:h-[42svh]"
              >
                {/*
                  The clip is the cell's background, under everything. Muted
                  autoplay needs no gesture; `playsInline` stops iOS taking it
                  fullscreen, and `aria-hidden` keeps it out of the reading
                  order - the figure over it is the content.
                */}
                <video
                  aria-hidden
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  className="countdown-clip absolute inset-0 h-full w-full object-cover"
                >
                  <source src={clip} type="video/mp4" />
                </video>

                {/*
                  A scrim between the footage and the figure. The clips are
                  busy and lit from every direction, and white numerals on raw
                  footage are unreadable at a glance - which is the only way a
                  countdown is ever read.
                */}
                <div aria-hidden className="absolute inset-0 bg-[#05030a]/68" />

                {/*
                  Elevon, which landed after this was first written: it is a
                  display face that actually has numerals, where Hypik has
                  none and Satoshi is the body face. Tabular, so a ticking
                  seconds digit cannot change the cell width.
                */}
                <span
                  className={`font-elevon relative font-extrabold tabular-nums ${
                    accent ? "text-accent-magenta" : "text-white"
                  }`}
                  style={{
                    fontSize: "clamp(2.75rem, 9vw, 7rem)",
                    lineHeight: 1,
                    letterSpacing: "-0.02em",
                    // Heavier behind the purple than it needs to be behind
                    // white: the accent is a mid tone, so it needs the clip
                    // pushed further back to hold its edge over the footage.
                    textShadow: accent
                      ? "0 0 0.5em rgba(5, 3, 10, 0.95), 0 0 1.2em rgba(120, 40, 255, 0.45)"
                      : "0 0 0.6em rgba(5, 3, 10, 0.85)",
                  }}
                >
                  {parts === null ? "--" : String(parts[i]).padStart(2, "0")}
                </span>
                <span className="font-sans text-accent-soft relative text-[10px] leading-none tracking-[0.18em] uppercase sm:text-[12px]">
                  {label}
                </span>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
