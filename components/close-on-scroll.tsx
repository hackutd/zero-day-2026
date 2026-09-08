"use client";

import { useEffect } from "react";

/**
 * Closes an open disclosure once the reader scrolls away from it.
 *
 * A brief is opened, read, and then left open while the reader carries on down
 * the grid, which pushes everything below it around and leaves the panel taller
 * than it should be. Closing on scroll keeps the grid the size it looks.
 *
 * The trigger is distance, not the first scroll event: the position is recorded
 * when the card opens, and the card closes once the page has moved
 * \`thresholdPx\` from there. Anything smaller would close a brief while the
 * reader was still nudging it into view, which is worse than leaving it open.
 *
 * \`toggle\` does not bubble, so the listener is registered in the capture phase.
 * Both listeners are passive: neither one ever calls \`preventDefault\`, and
 * saying so keeps them off the scroll's critical path.
 */
export function CloseOnScroll({
  name,
  thresholdPx = 160,
}: {
  /** The `name` shared by the group of `<details>` to watch. */
  name: string;
  thresholdPx?: number;
}) {
  useEffect(() => {
    const selector = `details[name="${name}"]`;
    let openedAt: number | null = null;

    const onToggle = (event: Event) => {
      const el = event.target;
      if (!(el instanceof HTMLDetailsElement) || !el.matches(selector)) return;
      openedAt = el.open ? window.scrollY : null;
    };

    const onScroll = () => {
      if (openedAt === null) return;
      if (Math.abs(window.scrollY - openedAt) < thresholdPx) return;

      // Only ever one is open: they share a `name`, so the browser closes the
      // last when another opens.
      document
        .querySelector<HTMLDetailsElement>(`${selector}[open]`)
        ?.removeAttribute("open");
      openedAt = null;
    };

    document.addEventListener("toggle", onToggle, true);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      document.removeEventListener("toggle", onToggle, true);
      window.removeEventListener("scroll", onScroll);
    };
  }, [name, thresholdPx]);

  return null;
}
