"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import train from "@/public/backgrounds/04-subway-train.png";

/**
 * A train running through the platform on the far track, behind the stopped
 * carriage that frames the panel.
 *
 * The plate is 4800x1080 against the scene's 1920x1080, i.e. two and a half
 * panels wide at exactly the panel's height, and it is painted at the vertical
 * position it was drawn at - its roof line and window band already sit where
 * the platform's window openings are, so the box is the panel's own height with
 * no offset and the only thing that moves is x.
 *
 * The carriage's nose is at the left end of the plate, so the pass runs
 * right-to-left: the box starts parked off the right edge, and as it translates
 * left the nose is the first thing through the openings.
 *
 * It only animates while the panel is on screen, and the observer is what makes
 * the first pass land when the reader arrives rather than somewhere mid-cycle:
 * the animation is declared `paused`, so it holds at its first frame - parked
 * off-frame - until the panel is actually in view. Leaving the panel pauses it
 * again rather than resetting it, so a reader who scrolls back and forth does
 * not retrigger a pass on every wobble.
 *
 * The observed element is the still outer box, NOT the carriage inside it. An
 * IntersectionObserver measures the target as its ancestors clip it, and the
 * carriage is parked a full panel to the right of a panel that hides its
 * overflow - so watching the carriage means watching something clipped to
 * nothing, which never intersects, which never starts the animation that would
 * bring it into the panel. The outer box covers the panel exactly and has no
 * transform on it, so it reports what the reader can actually see.
 */
export function PassingTrain() {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      // A third of the panel, so the pass starts once the reader is looking at
      // the platform rather than the moment its top edge clears the fold.
      { threshold: 0.35 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} aria-hidden className="subway-train-track">
      <div className={`subway-train${inView ? " subway-train-running" : ""}`}>
        <Image
          src={train}
          alt=""
          fill
          // The box holds the plate's own 4800x1080 aspect, so `cover` is an
          // exact fit rather than a crop. `250vw` because the box is two and a
          // half panels wide and the panel is the full viewport.
          sizes="250vw"
          className="object-cover"
        />
      </div>
    </div>
  );
}
