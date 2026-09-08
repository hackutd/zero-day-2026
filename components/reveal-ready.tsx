"use client";

import { useEffect, useRef } from "react";

export const REVEAL_READY_EVENT = "hackutd:reveal-ready";

/** Tells the global reveal controller that this streamed scope has hydrated. */
export function RevealReady({ phase }: { phase: string }) {
  const marker = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const scope = marker.current?.parentElement;
    if (!scope) return;

    document.dispatchEvent(
      new CustomEvent(REVEAL_READY_EVENT, { detail: { scope } }),
    );
  }, [phase]);

  return <span ref={marker} hidden aria-hidden />;
}
