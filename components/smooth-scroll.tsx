"use client";

import { useEffect } from "react";

/**
 * Eased scrolling, ported from the hackutd.co repo's `lib/smooth-scroll.js`.
 *
 * It intercepts wheel and key input, keeps a `target` position, and eases the
 * real scroll toward it each frame. Crucially it drives `window.scrollTo`
 * rather than transforming a wrapper element, which is what makes it safe here:
 * `position: fixed` keeps working (the nav, the audio button, the prehero
 * scrim), and real scroll events still fire every frame, so the intro
 * animation's listener needs no changes.
 *
 * Differences from the original, which was a side-effect script with no
 * teardown: this is a component, so every listener is removed on unmount and
 * the overridden `scroll-behavior` is restored. Anchor jumps also subtract a
 * header offset the original did not need.
 */

/** Fraction of the remaining distance covered per frame at 60fps. */
const EASE = 0.095;
const WHEEL_MULTIPLIER = 1;
const ARROW_STEP = 110;
const PAGE_FACTOR = 0.9;
/** Below this many px we land and stop the loop. */
const SNAP_THRESHOLD = 0.4;

/**
 * Matches `scroll-padding-top` in globals.css. The original walked `offsetTop`
 * and landed flush, which here would put the target under the fixed navbar.
 */
const ANCHOR_OFFSET = 80;

const TYPING_TAGS = ["INPUT", "TEXTAREA", "SELECT"];

export function SmoothScroll() {
  useEffect(() => {
    // Touch devices already have momentum scrolling, and reduced-motion users
    // have asked not to have this. Both conditions on the touch check, so a
    // touchscreen laptop with a trackpad still gets it — only genuinely
    // touch-only devices opt out. CSS `scroll-behavior: smooth` still handles
    // anchor jumps in that case.
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const touchOnly = window.matchMedia(
      "(hover: none) and (pointer: coarse)",
    ).matches;
    if (reduced || touchOnly) return;

    const root = document.documentElement;
    const previousBehavior = root.style.scrollBehavior;
    // We own the animation now; native smooth scrolling would fight the loop.
    root.style.scrollBehavior = "auto";

    let target = window.scrollY;
    let current = target;
    let running = false;
    let frameId = 0;

    const maxScroll = () => Math.max(0, root.scrollHeight - window.innerHeight);
    const clamp = (value: number) => Math.max(0, Math.min(value, maxScroll()));

    const frame = () => {
      const distance = target - current;
      if (Math.abs(distance) < SNAP_THRESHOLD) {
        current = target;
        window.scrollTo(0, current);
        running = false;
        return;
      }
      current += distance * EASE;
      window.scrollTo(0, current);
      frameId = requestAnimationFrame(frame);
    };

    const run = () => {
      if (running) return;
      running = true;
      frameId = requestAnimationFrame(frame);
    };

    const scrollBy = (delta: number) => {
      target = clamp(target + delta);
      run();
    };
    const scrollTo = (position: number) => {
      target = clamp(position);
      run();
    };

    // deltaMode: 0 = pixels, 1 = lines, 2 = pages. Firefox reports lines.
    const wheelDelta = (e: WheelEvent) => {
      if (e.deltaMode === 1) return e.deltaY * 16;
      if (e.deltaMode === 2) return e.deltaY * window.innerHeight;
      return e.deltaY;
    };

    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey) return; // pinch-zoom gesture, leave it alone
      e.preventDefault();
      scrollBy(wheelDelta(e) * WHEEL_MULTIPLIER);
    };

    const onKeyDown = (e: KeyboardEvent) => {
      const el = document.activeElement as HTMLElement | null;
      if (el && (TYPING_TAGS.includes(el.tagName) || el.isContentEditable))
        return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      const page = window.innerHeight * PAGE_FACTOR;
      switch (e.key) {
        case "ArrowDown":
          scrollBy(ARROW_STEP);
          break;
        case "ArrowUp":
          scrollBy(-ARROW_STEP);
          break;
        case "PageDown":
          scrollBy(page);
          break;
        case "PageUp":
          scrollBy(-page);
          break;
        case "Home":
          scrollTo(0);
          break;
        case "End":
          scrollTo(maxScroll());
          break;
        case " ":
          scrollBy(e.shiftKey ? -page : page);
          break;
        default:
          return;
      }
      e.preventDefault();
    };

    // `offsetTop` rather than getBoundingClientRect: it ignores CSS transforms,
    // and the scene panels carry them.
    const absoluteTop = (el: HTMLElement) => {
      let top = 0;
      let node: HTMLElement | null = el;
      while (node) {
        top += node.offsetTop;
        node = node.offsetParent as HTMLElement | null;
      }
      return top;
    };

    const onClick = (e: MouseEvent) => {
      const link = (e.target as HTMLElement | null)?.closest?.('a[href^="#"]');
      if (!link) return;
      const hash = link.getAttribute("href");
      if (!hash || hash === "#") return; // placeholder link, not a jump

      const destination = document.querySelector<HTMLElement>(hash);
      if (!destination) return;

      e.preventDefault();
      scrollTo(absoluteTop(destination) - ANCHOR_OFFSET);
      history.pushState(null, "", hash);
    };

    // Stay in sync with scrolling we didn't cause: scrollbar drags,
    // find-in-page, focus jumps, restored positions.
    const onScroll = () => {
      if (running) return;
      current = target = window.scrollY;
    };
    const onResize = () => {
      target = clamp(target);
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("keydown", onKeyDown);
    document.addEventListener("click", onClick);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });

    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("click", onClick);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      if (frameId) cancelAnimationFrame(frameId);
      root.style.scrollBehavior = previousBehavior;
    };
  }, []);

  return null;
}
