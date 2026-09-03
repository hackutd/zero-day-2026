"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Background music, with the only control the page has: a speaker in the
 * bottom-left corner.
 *
 * Browsers refuse to autoplay audible media until the visitor has interacted
 * with the page, and that refusal is a silent promise rejection rather than an
 * error. So this tries to play on mount, and if it's blocked, arms a one-shot
 * listener that starts the track on the first click, key, or tap anywhere -
 * which is what makes it feel like it "just started playing" while still
 * obeying the autoplay policy. Once the visitor pauses it, that's final; the
 * fallback listener is torn down and only the button will start it again.
 */
export function AudioToggle() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  // Mirrors `playing` for the effect below without making it a dependency -
  // re-running the effect on every toggle would re-arm the gesture listener and
  // restart audio the visitor had deliberately paused.
  const pausedByUser = useRef(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Background music sitting under the visuals, not the main event.
    audio.volume = 0.22;

    const start = () => {
      if (pausedByUser.current) return;
      void audio.play().catch(() => {
        /* Still blocked, or no supported source - leave the button showing off. */
      });
    };

    // The gesture fallback, armed only if the unprompted attempt is refused.
    const events = ["pointerdown", "keydown", "touchstart"] as const;
    const onGesture = () => {
      start();
      teardown();
    };
    const teardown = () => {
      for (const type of events) {
        document.removeEventListener(type, onGesture);
      }
    };

    void audio.play().catch(() => {
      for (const type of events) {
        document.addEventListener(type, onGesture, { once: true });
      }
    });

    return teardown;
  }, []);

  function toggle() {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.paused) {
      pausedByUser.current = false;
      void audio.play().catch(() => setPlaying(false));
    } else {
      pausedByUser.current = true;
      audio.pause();
    }
  }

  return (
    <>
      {/*
        `preload="metadata"` rather than `auto`: the track is ~2MB, and a
        visitor whose browser blocks autoplay and who never clicks the button
        should not pay for it. `play()` starts the fetch when it's actually
        wanted.
      */}
      <audio
        ref={audioRef}
        loop
        preload="metadata"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      >
        <source src="/audio/distant-echoes.webm" type="audio/webm" />
        <source src="/audio/distant-echoes.mp3" type="audio/mpeg" />
      </audio>

      {/*
        The notched corners are the same motif as the Register and Explore
        buttons - top-left and bottom-right cut at 25% of the height, matching
        the ratio in button-accent.svg. It is a clip-path rather than another
        SVG because this control has no Figma export to reuse, and a path scales
        with the box where a stretched asset would skew the notch.

        clip-path crops a border away, so the accent hairline is a clipped
        parent showing through 1px around a clipped child.
      */}
      <button
        type="button"
        onClick={toggle}
        aria-pressed={playing}
        aria-label={playing ? "Mute music" : "Play music"}
        title={playing ? "Mute music" : "Play music"}
        className={`fixed bottom-5 left-5 z-50 h-11 w-11 p-px transition-colors sm:bottom-6 sm:left-6 ${
          playing ? "bg-accent-magenta" : "bg-white/25 hover:bg-white/40"
        }`}
        style={{ clipPath: NOTCH }}
      >
        <span
          className="flex h-full w-full items-center justify-center bg-[#0b0616]/85 backdrop-blur-md"
          style={{ clipPath: NOTCH }}
        >
          <SpeakerIcon muted={!playing} />
        </span>
      </button>
    </>
  );
}

/**
 * Corner notch shared by the button and its inner fill. 25% of the box, the
 * same proportion the CTA buttons cut at 12px on a 48px height.
 */
const NOTCH = "polygon(25% 0, 100% 0, 100% 75%, 75% 100%, 0 100%, 0 25%)";

/**
 * Deliberately angular: mitred joins and square caps, straight chevrons instead
 * of the usual arcs, so it reads with the notched buttons and the slanted
 * display type rather than like a stock rounded icon.
 */
function SpeakerIcon({ muted }: { muted: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="square"
      strokeLinejoin="miter"
      className={muted ? "text-white/70" : "text-white"}
      aria-hidden
    >
      {/* Cone: a straight-sided box and flare, no curves. */}
      <path d="M3 9h4l5-4v14l-5-4H3z" />
      {muted ? (
        <>
          <path d="m16 9.5 5 5" />
          <path d="m21 9.5-5 5" />
        </>
      ) : (
        <>
          <path d="m15.5 9 2.5 3-2.5 3" />
          <path d="m19.5 6.5 3.5 5.5-3.5 5.5" />
        </>
      )}
    </svg>
  );
}
