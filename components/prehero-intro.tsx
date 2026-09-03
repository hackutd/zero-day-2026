"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";

/**
 * The opening line over the skyline panel.
 *
 * Scroll drives the whole thing: the text slides in from the left, holds
 * centred, then carries on out to the right, and a dark scrim rises and falls
 * with it so the city dims while the line is legible and comes back up after.
 *
 * It fills the artwork frame, so the pane, the headline and the star all sit on
 * the picture rather than on the viewport. That matters on a phone, where the
 * plate is a band inside a taller screen: covering the viewport instead would
 * put the pane over the empty space around the art.
 *
 * Progress comes from the panel's geometry, not a breakpoint, so it works
 * whether the panel is pinned to a tall track or simply scrolling past.
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

/**
 * Darkest the scrim gets at the line's peak, pinned. The reader has scrolled
 * into this deliberately and the city is still legible through the blur.
 */
const MAX_SCRIM = 0.88;

/**
 * Unpinned, the line is at full strength the moment the page loads, so this
 * density would arrive with it and black out the plate before anyone had seen
 * it. Lighter here: enough to carry white type over neon, not enough to hide
 * the city it is written over.
 */
const MAX_SCRIM_FLOW = 0.46;

export function PreheroIntro() {
  const textRef = useRef<HTMLParagraphElement>(null);
  const scrimRef = useRef<HTMLDivElement>(null);
  const starRef = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const track = document.getElementById("scene-prehero");
    const text = textRef.current;
    const scrim = scrimRef.current;
    if (!track || !text || !scrim) return;

    let frame = 0;
    // Whether the star has already been fired for this pass through the
    // headline. Cleared when the line leaves, so scrolling back up and down
    // again earns another one.
    let starFired = false;

    /**
     * Restart the star so it flies now. Resetting `currentTime` rather than
     * just playing also restarts the idle gap, which is the point: without it
     * the free-running cycle could drop a second star moments later, and the
     * one on the beat would stop feeling deliberate.
     *
     * `subtree` picks up the ::before/::after glints, which are separate
     * animations and would otherwise fall out of sync with the tail.
     */
    const shootStar = () => {
      const star = starRef.current;
      if (!star) return;
      for (const animation of star.getAnimations({ subtree: true })) {
        animation.currentTime = 0;
        animation.play();
      }
    };

    const paint = () => {
      frame = 0;

      // Two arrangements, told apart by geometry rather than a breakpoint, so
      // this follows whatever the CSS did.
      const rect = track.getBoundingClientRect();
      const pinTravel = track.offsetHeight - window.innerHeight;

      let p: number;
      let maxScrim: number;
      if (pinTravel > 0) {
        maxScrim = MAX_SCRIM;
        // Pinned: the panel is stuck for the track height minus one screen, so
        // that distance is the timeline. `-rect.top` is how far into it we
        // have scrolled, which is 0 on load and starts the sequence at rest.
        p = clamp(-rect.top / pinTravel);
      } else {
        maxScrim = MAX_SCRIM_FLOW;
        // Not pinned - the panel is shorter than the screen, so it never
        // sticks. It is also the first thing on the page, so it never enters
        // from the bottom: it starts flush with the top and only travels up
        // and out, which is over in about 220px of scrolling.
        //
        // There is therefore no moment where the panel is both fully on screen
        // and far enough in to have played a fade-in - the line would peak with
        // half the panel already gone, clipped against the top edge. So the
        // travel is mapped to start at the hold: the line is at full strength
        // the instant the page loads and fades out as the panel leaves. The
        // slide-in is a wider-screen flourish; here it would only ever be seen
        // half-finished.
        p = IN_END + clamp(-rect.top / rect.height) * (1 - IN_END);
      }

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

      // Fire on the beat: the moment the line finishes arriving and sits
      // centred, which is when it has the reader's attention.
      if (p >= IN_END && p < OUT_END) {
        if (!starFired) {
          starFired = true;
          shootStar();
        }
      } else {
        starFired = false;
      }

      text.style.opacity = String(opacity);
      text.style.transform = reduced ? "none" : `translateX(${shift}px)`;
      scrim.style.opacity = String(opacity * maxScrim);
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
      // Low in the band on a phone, centred from `sm`. The plate is only ~221px
      // tall there and the trust badge occupies the top-right ~105px of it, so a
      // centred line runs straight under the badge. Dropping it clears the badge
      // without shrinking the type.
      className="pointer-events-none absolute inset-0 z-30 flex items-end justify-center overflow-hidden pb-5 sm:items-center sm:pb-0"
    >
      <div
        ref={scrimRef}
        className="prehero-scrim absolute inset-0"
        style={{ opacity: 0 }}
      />
      {/* Above the scrim so the streak stays bright, below the line. */}
      <div className="star-field" aria-hidden>
        <span ref={starRef} className="shooting-star" />
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
        the city needs <span className="text-accent-soft">you</span>...
      </p>
    </div>
  );
}

/**
 * The media query is external mutable state, so it is read through
 * `useSyncExternalStore` rather than mirrored into state from an effect - that
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

function clamp(v: number): number {
  return Math.min(Math.max(v, 0), 1);
}

/** easeOutCubic - quick to arrive, gentle to settle. */
function ease(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}
