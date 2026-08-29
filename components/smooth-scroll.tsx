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
 * How long the reader has to be still before the scroll settles onto a panel.
 * Long enough that it never interrupts a scroll in progress, short enough that
 * it feels like the same gesture finishing rather than a later correction.
 */
const SETTLE_DELAY_MS = 140;

/**
 * How near a panel has to be, as a fraction of the viewport, for the settle to
 * engage at all. Past this it is left alone: someone scrolling deliberately
 * past the panel should never be pulled back to it.
 */
const SETTLE_RANGE = 0.35;

/** Close enough to centred already; moving would just be a twitch. */
const SETTLE_DEADZONE_PX = 3;

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

    let settleTimer: ReturnType<typeof setTimeout> | undefined;
    // Set while the settle drives the loop, so its own scrolling is not read
    // back as the reader moving and re-armed into a feedback loop.
    let settling = false;

    /**
     * Ease onto a marked panel if the reader has come to rest already close to
     * one. This is deliberately not CSS scroll-snap: this module owns the
     * scroll position every frame, and snap points would fight it. Doing it
     * here also makes it velocity-aware, which snap is not — it only ever runs
     * from a standstill, so a flick straight past the panel is untouched.
     */
    const trySettle = () => {
      if (settling || running) return;
      const panel = document.querySelector<HTMLElement>("[data-settle]");
      if (!panel) return;

      const rect = panel.getBoundingClientRect();
      // Only settle onto a panel that roughly fills the screen. Taller than the
      // viewport and there is no single centred position worth choosing. Much
      // shorter — a narrow window, where the panels are a fraction of the
      // height — and "centred" can resolve above the top of the document, which
      // clamps to zero and drags the reader back to the top of the page.
      const fill = rect.height / window.innerHeight;
      if (fill > 1.2 || fill < 0.6) return;

      const centredTop = (window.innerHeight - rect.height) / 2;
      const delta = rect.top - centredTop;
      if (Math.abs(delta) < SETTLE_DEADZONE_PX) return;
      if (Math.abs(delta) > window.innerHeight * SETTLE_RANGE) return;

      settling = true;
      scrollTo(target + delta);
    };

    const armSettle = () => {
      if (settling) return;
      clearTimeout(settleTimer);
      settleTimer = setTimeout(trySettle, SETTLE_DELAY_MS);
    };

    const frame = () => {
      const distance = target - current;
      if (Math.abs(distance) < SNAP_THRESHOLD) {
        current = target;
        window.scrollTo(0, current);
        running = false;
        if (settling) {
          // That was the settle itself finishing; re-arming here would loop.
          settling = false;
        } else {
          // Real input eases for a while after the wheel stops, and the scroll
          // handler is deaf while it does. This is the moment motion actually
          // ends, so it is the only reliable place to consider settling.
          armSettle();
        }
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
      armSettle();
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
      armSettle();
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
      // Covers scrollbar drags and trackpad momentum, which never reach the
      // wheel handler above.
      armSettle();
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
      clearTimeout(settleTimer);
      root.style.scrollBehavior = previousBehavior;
    };
  }, []);

  return null;
}
