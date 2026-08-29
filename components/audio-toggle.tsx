"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Background music, with the only control the page has: a speaker in the
 * bottom-left corner.
 *
 * Browsers refuse to autoplay audible media until the visitor has interacted
 * with the page, and that refusal is a silent promise rejection rather than an
 * error. So this tries to play on mount, and if it's blocked, arms a one-shot
 * listener that starts the track on the first click, key, or tap anywhere —
 * which is what makes it feel like it "just started playing" while still
 * obeying the autoplay policy. Once the visitor pauses it, that's final; the
 * fallback listener is torn down and only the button will start it again.
 */
export function AudioToggle() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  // Mirrors `playing` for the effect below without making it a dependency —
  // re-running the effect on every toggle would re-arm the gesture listener and
  // restart audio the visitor had deliberately paused.
  const pausedByUser = useRef(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = 0.45;

    const start = () => {
      if (pausedByUser.current) return;
      void audio.play().catch(() => {
        /* Still blocked, or no supported source — leave the button showing off. */
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

      <button
        type="button"
        onClick={toggle}
        aria-pressed={playing}
        aria-label={playing ? "Mute music" : "Play music"}
        title={playing ? "Mute music" : "Play music"}
        className="fixed bottom-5 left-5 z-50 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white/80 backdrop-blur-md transition hover:border-white/40 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan sm:bottom-6 sm:left-6"
      >
        <SpeakerIcon muted={!playing} />
      </button>
    </>
  );
}

function SpeakerIcon({ muted }: { muted: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M4 9.5h3.2L12 5.5v13l-4.8-4H4z" />
      {muted ? (
        <>
          <path d="m16.5 9.5 4 5" />
          <path d="m20.5 9.5-4 5" />
        </>
      ) : (
        <>
          <path d="M15.8 9.2a4 4 0 0 1 0 5.6" />
          <path d="M18.4 6.6a7.6 7.6 0 0 1 0 10.8" />
        </>
      )}
    </svg>
  );
}
