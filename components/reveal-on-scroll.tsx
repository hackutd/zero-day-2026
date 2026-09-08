"use client";

import { useEffect } from "react";

/**
 * One observer for every `.reveal` on the page.
 *
 * Mounted once in the layout rather than wrapping each heading in its own
 * client component: the sections stay server components and only add a class,
 * and the page ends up with a single IntersectionObserver instead of one per
 * element.
 *
 * It sets a data attribute rather than React state. Nothing re-renders, the
 * work stays off the main thread's render path, and it sidesteps the
 * setState-in-an-effect problem entirely.
 *
 * Each element is unobserved the moment it lands, so a heading reveals once and
 * does not replay every time it is scrolled past. `-12%` on the bottom margin
 * holds the trigger until the element is properly into the viewport rather than
 * firing on its first pixel.
 *
 * Two rules keep this safe now that the sponsors, FAQ and schedule stream in
 * behind Suspense boundaries (components/api-sections.tsx):
 *
 *  1. Nothing is ever written to an element React renders *before* React has
 *     hydrated it. This used to set `data-reveal-ready` on every `.reveal` it
 *     found, which for a streamed heading meant writing an attribute onto DOM
 *     that had been inserted but not yet hydrated - and React then reported a
 *     hydration mismatch on it. The "script is running" flag now lives once on
 *     the root element, which React leaves alone, and the CSS reads it as an
 *     ancestor. `data-revealed` and `data-in-view` stay per-element, but both
 *     are only ever written from an IntersectionObserver callback, which is
 *     long after hydration.
 *  2. Late arrivals are picked up. A single `querySelectorAll` at mount misses
 *     anything a boundary has not resolved yet, and with the flag on the root
 *     an unobserved `.reveal` would be hidden with nothing left to reveal it.
 *     A MutationObserver catches them as they land.
 */
const REVEAL = ".reveal";
const GATED = ".wall-stats, .billboard-sign, .social-marquee, .star-field";

export function RevealOnScroll() {
  useEffect(() => {
    const root = document.documentElement;

    // The gate every rule in globals.css hangs off. Set before anything is
    // observed, removed on teardown, and never touched on a hydrated element.
    root.setAttribute("data-motion-active", "");

    if (!("IntersectionObserver" in window)) {
      // No observer: reveal everything and leave the decoration running.
      root.removeAttribute("data-motion-active");
      return;
    }

    const revealObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.setAttribute("data-revealed", "");
          revealObserver.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.05 },
    );

    // Keep the occasional interference asleep outside the viewport - the wall
    // stats, the hero's sign, and the two that used to run for the life of the
    // page: the marquee's 24s translate and the prehero's shooting star.
    const motionObserver = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        entry.target.toggleAttribute("data-in-view", entry.isIntersecting);
      }
    });

    // Observing twice is harmless - the browser ignores a repeat observe of the
    // same element - so new nodes can be handed over without bookkeeping.
    const claim = (scope: ParentNode) => {
      scope
        .querySelectorAll(REVEAL)
        .forEach((el) => revealObserver.observe(el));
      scope.querySelectorAll(GATED).forEach((el) => motionObserver.observe(el));
    };

    claim(document);

    const arrivals = new MutationObserver((records) => {
      for (const record of records) {
        for (const node of record.addedNodes) {
          if (!(node instanceof Element)) continue;
          if (node.matches(REVEAL)) revealObserver.observe(node);
          if (node.matches(GATED)) motionObserver.observe(node);
          claim(node);
        }
      }
    });
    arrivals.observe(document.body, { childList: true, subtree: true });

    return () => {
      arrivals.disconnect();
      revealObserver.disconnect();
      motionObserver.disconnect();
      root.removeAttribute("data-motion-active");
      document
        .querySelectorAll("[data-revealed], [data-in-view]")
        .forEach((el) => {
          el.removeAttribute("data-revealed");
          el.removeAttribute("data-in-view");
        });
    };
  }, []);

  return null;
}
