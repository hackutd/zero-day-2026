"use client";

import { useEffect, useRef } from "react";

/**
 * A decorative looping clip that costs nothing until it is on screen.
 *
 * `autoplay` fetches and plays the moment the element is in the DOM, wherever
 * it happens to be on the page. Six of these sit several screens down, so an
 * autoplaying set spends its bytes before the reader has any chance of seeing
 * them. `preload="none"` with a deferred `play()` moves that cost to the point
 * the clip is actually visible.
 *
 * It also pauses on the way out. A muted loop off-screen is not free: it keeps
 * decoding frames and holding a compositor layer, which on a phone is battery
 * spent on something nobody is looking at.
 *
 * The source URL is written from script rather than rendered, so the markup
 * carries no URL for the browser to speculatively fetch before the observer has
 * had its say.
 */
export function AmbientVideo({
  src,
  className,
  label,
}: {
  src: string;
  className?: string;
  /** Omit for pure decoration; set it where the clip carries meaning. */
  label?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const connection = (
      navigator as Navigator & {
        connection?: EventTarget & { saveData?: boolean };
      }
    ).connection;
    let inView = false;
    let attached = false;
    const syncPlayback = () => {
      if (
        !inView ||
        document.hidden ||
        reducedMotion.matches ||
        connection?.saveData
      ) {
        video.pause();
        return;
      }
      if (!attached) {
        attached = true;
        video.src = src;
      }
      void video.play().catch(() => {});
    };

    const observer =
      "IntersectionObserver" in window
        ? new IntersectionObserver(
            ([entry]) => {
              inView = entry.isIntersecting;
              syncPlayback();
            },
            { threshold: 0.01 },
          )
        : null;
    observer?.observe(video);
    // Without visibility observation, leave decoration idle.
    document.addEventListener("visibilitychange", syncPlayback);
    reducedMotion.addEventListener("change", syncPlayback);
    connection?.addEventListener("change", syncPlayback);
    return () => {
      observer?.disconnect();
      document.removeEventListener("visibilitychange", syncPlayback);
      reducedMotion.removeEventListener("change", syncPlayback);
      connection?.removeEventListener("change", syncPlayback);
      video.pause();
      video.removeAttribute("src");
      video.load();
    };
  }, [src]);

  return (
    <video
      ref={ref}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      muted
      loop
      playsInline
      preload="none"
      className={className}
    />
  );
}
