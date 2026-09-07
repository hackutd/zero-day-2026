"use client";

import { useEffect, useRef, useState } from "react";

/** Background music loads on the first gesture, or an explicit button press. */
export function AudioToggle() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const pausedByUser = useRef(false);
  const resumeWhenVisible = useRef(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  function start(audio: HTMLAudioElement) {
    // No source in the initial markup: even metadata waits for interaction.
    if (!audio.hasAttribute("src")) {
      audio.src = audio.canPlayType('audio/webm; codecs="opus"')
        ? "/audio/distant-echoes.webm"
        : "/audio/distant-echoes.mp3";
    }
    void audio.play().catch(() => setPlaying(false));
  }

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = 0.22;
    let active = true;
    const events = ["pointerdown", "keydown"] as const;
    const teardown = () => {
      for (const type of events) document.removeEventListener(type, onGesture);
    };
    const onGesture = (event: Event) => {
      // The music button owns its click; starting on pointerdown would make
      // that same click immediately pause the track again.
      if (buttonRef.current?.contains(event.target as Node)) return;
      if (document.hidden || pausedByUser.current) return;
      teardown();
      const connection = (
        navigator as Navigator & {
          connection?: { saveData?: boolean };
        }
      ).connection;
      if (!connection?.saveData) start(audio);
    };
    const onVisibility = () => {
      if (document.hidden) {
        resumeWhenVisible.current = !audio.paused;
        audio.pause();
      } else if (resumeWhenVisible.current && !pausedByUser.current && active) {
        resumeWhenVisible.current = false;
        start(audio);
      }
    };
    for (const type of events) document.addEventListener(type, onGesture);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      active = false;
      teardown();
      document.removeEventListener("visibilitychange", onVisibility);
      resumeWhenVisible.current = false;
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
    };
  }, []);

  function toggle() {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      pausedByUser.current = false;
      start(audio);
    } else {
      pausedByUser.current = true;
      resumeWhenVisible.current = false;
      audio.pause();
    }
  }

  return (
    <>
      <audio
        ref={audioRef}
        loop
        preload="none"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onError={() => setPlaying(false)}
      />

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
        ref={buttonRef}
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
