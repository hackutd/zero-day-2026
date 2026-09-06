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
 * The `<source>` is written from script rather than rendered, so the markup
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

    let attached = false;
    const attach = () => {
      if (attached) return;
      attached = true;
      const source = document.createElement("source");
      source.src = src;
      source.type = "video/mp4";
      video.append(source);
      video.load();
    };

    // No observer support: behave like the autoplay this replaces.
    if (!("IntersectionObserver" in window)) {
      attach();
      void video.play().catch(() => {});
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          attach();
          // Rejected autoplay is not an error worth surfacing; the clip is
          // decoration and a still first frame is an acceptable outcome.
          void video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { threshold: 0.01 },
    );

    observer.observe(video);
    return () => observer.disconnect();
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
