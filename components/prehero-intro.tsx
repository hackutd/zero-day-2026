"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";

/**
 * The opening line over the skyline panel.
 *
 * Scroll drives the whole thing: the text slides in from the left, holds
 * centred, then carries on out to the right, and a dark scrim rises and falls
 * with it so the city dims while the line is legible and comes back up after.
 *
 * It simply fills its parent, because that parent is the pinned panel in
 * `PinnedPrehero` — held at the top of the viewport for the whole track. That
 * pinning is what lets this be `absolute inset-0`: earlier, with the panel
 * scrolling freely, the layer had to be `fixed` and re-measured to the panel's
 * visible slice every frame to stop the line drifting off the city and the
 * scrim dimming the panel below. Pinned, none of that is needed.
 *
 * CSS scroll-driven animations (`animation-timeline: scroll()`) would express
 * this more cheaply, but they are still Chromium-only, so this uses a passive
 * scroll listener coalesced into an animation frame.
 */

/** Keyframes in "fraction of the pinned track scrolled" units. */
const IN_END = 0.34;
const HOLD_END = 0.56;
const OUT_END = 0.9;

/** How far the line travels in and out, before it is scaled to the viewport. */
const TRAVEL_PX = 140;

/** Darkest the scrim ever gets, at the line's peak. */
const MAX_SCRIM = 0.62;

export function PreheroIntro() {
  const textRef = useRef<HTMLParagraphElement>(null);
  const scrimRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const track = document.getElementById("scene-prehero");
    const text = textRef.current;
    const scrim = scrimRef.current;
    if (!track || !text || !scrim) return;

    let frame = 0;

    const paint = () => {
      frame = 0;

      // The panel is stuck for exactly the track height minus one screen, so
      // that distance — not the track's full height — is the animation's
      // timeline. `-rect.top` is how far into it we have scrolled, which is 0
      // on load and so starts the sequence at rest.
      const travel = track.offsetHeight - window.innerHeight;
      if (travel <= 0) return;
      const p = Math.min(
        Math.max(-track.getBoundingClientRect().top / travel, 0),
        1,
      );

      let opacity: number;
      let shift: number;
      if (p < IN_END) {
        const t = ease(p / IN_END);
        opacity = t;
        shift = -TRAVEL_PX * (1 - t);
      } else if (p < HOLD_END) {
        opacity = 1;
        shift = 0;
      } else if (p < OUT_END) {
        const t = ease((p - HOLD_END) / (OUT_END - HOLD_END));
        opacity = 1 - t;
        shift = TRAVEL_PX * t;
      } else {
        opacity = 0;
        shift = TRAVEL_PX;
      }

      text.style.opacity = String(opacity);
      text.style.transform = reduced ? "none" : `translateX(${shift}px)`;
      scrim.style.opacity = String(opacity * MAX_SCRIM);
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(paint);
    };

    paint();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [reduced]);

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center overflow-hidden"
    >
      <div
        ref={scrimRef}
        className="absolute inset-0 bg-black"
        style={{ opacity: 0 }}
      />
      {/* Above the scrim so the streak stays bright, below the line. */}
      <div className="star-field" aria-hidden>
        <span className="shooting-star" />
      </div>

      <p
        ref={textRef}
        className="font-hypik relative px-6 text-center leading-[1.1] text-white"
        style={{
          opacity: 0,
          fontSize: "clamp(1.75rem, 6vw, 5rem)",
          // The face has no punctuation, so the ellipsis is drawn by the
          // fallback; a touch of tracking keeps the two from colliding.
          letterSpacing: "0.02em",
          textShadow: "0 0 32px rgba(0,0,0,0.55)",
        }}
      >
        the city needs <span style={{ color: "#dbc4ff" }}>you</span>...
      </p>
    </div>
  );
}

/**
 * The media query is external mutable state, so it is read through
 * `useSyncExternalStore` rather than mirrored into state from an effect — that
 * keeps the first paint correct instead of rendering once with the wrong value
 * and immediately re-rendering.
 */
const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

function useReducedMotion(): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const query = window.matchMedia(REDUCED_MOTION);
      query.addEventListener("change", onChange);
      return () => query.removeEventListener("change", onChange);
    },
    () => window.matchMedia(REDUCED_MOTION).matches,
    // No preference is knowable while rendering on the server.
    () => false,
  );
}

/** easeOutCubic — quick to arrive, gentle to settle. */
function ease(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}
