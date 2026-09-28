"use client";

import { useEffect } from "react";

import { REVEAL_READY_EVENT } from "@/components/reveal-ready";

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
 * Two rules keep this safe now that API-backed sections stream in
 * behind Suspense boundaries (components/api-sections.tsx):
 *
 *  1. Initial content is claimed from this component's effect, after the root
 *     has hydrated. Streamed scopes are skipped by that pass.
 *  2. Each streamed scope contains a RevealReady marker. Its effect emits an
 *     event only after that boundary hydrates, at which point this controller
 *     can safely observe and mutate the scope's elements.
 */
const REVEAL = ".reveal";
const GATED = ".wall-stats, .billboard-sign, .social-marquee, .star-field";
const STREAMED_SCOPE = "[data-reveal-scope]";

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

    // Observing twice is harmless. The scope check keeps the initial document
    // pass out of streamed subtrees until their RevealReady marker fires.
    const claim = (scope: Document | Element) => {
      const owns = (el: Element) => {
        const streamedParent = el.closest(STREAMED_SCOPE);
        return scope instanceof Document
          ? streamedParent === null
          : streamedParent === scope;
      };

      scope.querySelectorAll(REVEAL).forEach((el) => {
        if (owns(el)) revealObserver.observe(el);
      });
      scope.querySelectorAll(GATED).forEach((el) => {
        if (owns(el)) motionObserver.observe(el);
      });
    };

    claim(document);

    const onRevealReady = (event: Event) => {
      if (!(event instanceof CustomEvent)) return;
      const scope = (event.detail as { scope?: unknown } | null)?.scope;
      if (scope instanceof Element && scope.matches(STREAMED_SCOPE))
        claim(scope);
    };
    document.addEventListener(REVEAL_READY_EVENT, onRevealReady);

    return () => {
      document.removeEventListener(REVEAL_READY_EVENT, onRevealReady);
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
