"use client";

import { useEffect, useState } from "react";

/**
 * A plain black cover that fades away as the page comes in, so the opening
 * does not assemble in front of the reader - images popping in, the headline
 * landing before its art. It lifts once the opening images have loaded,
 * never sooner than MIN_MS (so it cannot flicker) and never later than MAX_MS.
 *
 * It is in the server HTML, so it is there from the first paint. If the
 * script never runs, `.page-loader` fades itself out at MAX_MS in CSS anyway.
 */
const MIN_MS = 200;
const MAX_MS = 1500;

export function PageLoader() {
  const [done, setDone] = useState(false);

  useEffect(() => {
    // The opening images are the page's only non-lazy ones.
    const images = Array.from(
      document.querySelectorAll<HTMLImageElement>(
        "main img:not([loading='lazy'])",
      ),
    );
    // `decode()` waits for the load too; a broken image still settles it.
    const loaded = Promise.all(
      images.map((img) => img.decode().catch(() => {})),
    );
    const atLeast = new Promise((resolve) => setTimeout(resolve, MIN_MS));
    const atMost = new Promise((resolve) => setTimeout(resolve, MAX_MS));

    let cancelled = false;
    void Promise.race([Promise.all([loaded, atLeast]), atMost]).then(() => {
      if (!cancelled) setDone(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div
      aria-hidden
      className="page-loader"
      data-done={done ? "" : undefined}
    />
  );
}
