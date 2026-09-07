"use client";

import { useEffect } from "react";

/**
 * Fades media in once it can actually be drawn.
 *
 * The clips and the plates that carry no blur placeholder used to arrive by
 * appearing: nothing, then a frame, on whatever schedule the network gave them.
 * A screen on a building would snap into a wall a reader had already scrolled
 * past. This holds each one transparent until it has something to show and then
 * brings it up over half a second, so the arrival is the same whether it took
 * 80ms or four seconds.
 *
 * The opacity is not in the stylesheet unconditionally. It is gated behind
 * `data-media-ready`, which only this effect sets - the same shape
 * `.reveal[data-reveal-ready]` uses - so if the script never runs, every one of
 * these paints normally instead of staying invisible forever. Hiding content
 * behind a script that may not arrive is how a fade becomes a blank page.
 *
 * Anything already decoded when this mounts is marked in the same tick, which
 * covers the cached second visit: no fade, no flash, just there.
 */
export function MediaFade() {
  useEffect(() => {
    const targets = document.querySelectorAll<HTMLElement>(".media-fade");
    if (!targets.length) return;

    const done = (el: Element) => el.setAttribute("data-loaded", "");
    const cleanups: (() => void)[] = [];

    for (const el of targets) {
      el.setAttribute("data-media-ready", "");

      if (el instanceof HTMLImageElement) {
        // `complete` covers a cached image, which never fires `load` again.
        if (el.complete && el.naturalWidth > 0) {
          done(el);
          continue;
        }
        const onLoad = () => done(el);
        // A broken source should not leave a hole in the page.
        el.addEventListener("load", onLoad, { once: true });
        el.addEventListener("error", onLoad, { once: true });
        cleanups.push(() => {
          el.removeEventListener("load", onLoad);
          el.removeEventListener("error", onLoad);
        });
        continue;
      }

      if (el instanceof HTMLVideoElement) {
        // `loadeddata` rather than `canplay`: the first frame is decoded by
        // then, which is the moment there is something worth fading up to.
        if (el.readyState >= 2) {
          done(el);
          continue;
        }
        const onData = () => done(el);
        el.addEventListener("loadeddata", onData, { once: true });
        el.addEventListener("error", onData, { once: true });
        cleanups.push(() => {
          el.removeEventListener("loadeddata", onData);
          el.removeEventListener("error", onData);
        });
      }
    }

    return () => {
      for (const off of cleanups) off();
      for (const el of targets) el.removeAttribute("data-media-ready");
    };
  }, []);

  return null;
}
