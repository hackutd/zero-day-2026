"use client";

import { useEffect } from "react";

/**
 * Points a sponsor cell's hover glow at the cursor: sets `--mx` and `--my` on
 * the cell under the pointer (globals.css, `.board-cell__link::before`).
 * Renders nothing. Without it - no script, or keyboard focus - the glow sits
 * in the cell's centre.
 *
 * One passive listener for the whole page, rather than one per cell, and it
 * does nothing unless the pointer is over a cell.
 */
export function BoardGlow() {
  useEffect(() => {
    const onMove = (event: PointerEvent) => {
      if (!(event.target instanceof Element)) return;
      const cell = event.target.closest<HTMLElement>(".board-cell__link");
      if (!cell) return;
      const rect = cell.getBoundingClientRect();
      cell.style.setProperty("--mx", `${event.clientX - rect.left}px`);
      cell.style.setProperty("--my", `${event.clientY - rect.top}px`);
    };

    document.addEventListener("pointermove", onMove, { passive: true });
    return () => document.removeEventListener("pointermove", onMove);
  }, []);

  return null;
}
