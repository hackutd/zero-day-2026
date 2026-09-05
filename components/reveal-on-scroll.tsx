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
 */
export function RevealOnScroll() {
  useEffect(() => {
    const targets = document.querySelectorAll<HTMLElement>(".reveal");
    if (!targets.length) return;

    const revealAll = () =>
      targets.forEach((el) => el.setAttribute("data-revealed", ""));

    // Anything already on screen at load reveals on the next frame rather than
    // waiting for a scroll that may never come on a short page.
    if (!("IntersectionObserver" in window)) {
      revealAll();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.setAttribute("data-revealed", "");
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.05 },
    );

    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return null;
}
