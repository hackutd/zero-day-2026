"use client";

import { useEffect, useState } from "react";

import { APPLY_URL } from "@/lib/links";

/**
 * The priority-deadline reminder: an alert card in the bottom-right corner.
 *
 * Deliberately not a modal. The page opens on the skyline and its headline,
 * and a dialog over that is the first thing a visitor dismisses unread. The
 * card is a corner card that blocks nothing, and it arrives a few seconds after
 * landing - long enough for the opening art to register - or as soon as the
 * opening panel scrolls away (the moment the navbar arrives, by the same test
 * as SiteNav), whichever comes first.
 *
 * Dismissing it holds for the visit (session storage, so for this tab) and it
 * comes back on the next one - a returning visitor should still be reminded
 * as the deadline gets closer. It retires itself at the deadline, so nobody
 * has to remember to take it down. Storage can be missing or throw (blocked
 * site data); if it does, the card just returns on the next page load.
 *
 * 11:59 PM Central on October 3. That is daylight time in Dallas, UTC-5 - the
 * countdown's -06:00 is right for its November date, after the clocks change,
 * and would be an hour late here.
 */
const DEADLINE = new Date("2026-10-03T23:59:00-05:00");
const DISMISSED_KEY = "zd-deadline-reminder-dismissed";
/** How long after landing the card arrives if the reader has not scrolled. */
const SHOW_AFTER_MS = 4000;

/** The same chamfer as the nav's buttons, at sizes that suit each box. */
const NOTCH_SM =
  "polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)";
const NOTCH_LG =
  "polygon(16px 0, 100% 0, 100% calc(100% - 16px), calc(100% - 16px) 100%, 0 100%, 0 16px)";

function wasDismissed(): boolean {
  try {
    return window.sessionStorage.getItem(DISMISSED_KEY) === "1";
  } catch {
    return false;
  }
}

/** "3 days left", down to "Closes tonight" on the day itself. */
function timeLeft(now: number): string {
  const ms = DEADLINE.getTime() - now;
  if (ms < 24 * 60 * 60 * 1000) return "Closes tonight";
  const days = Math.ceil(ms / (24 * 60 * 60 * 1000));
  return days === 1 ? "1 day left" : `${days} days left`;
}

export function DeadlineReminder() {
  // Null until it is time to show, so nothing renders on the server or on first
  // paint and there is no hydration mismatch to manage.
  const [left, setLeft] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    let observer: IntersectionObserver | undefined;

    const show = () => {
      window.clearTimeout(timer);
      observer?.disconnect();
      const now = Date.now();
      if (now >= DEADLINE.getTime() || wasDismissed()) return;
      // Once shown it stays put; scrolling back up does not hide it again.
      setLeft(timeLeft(now));
    };

    const timer = window.setTimeout(show, SHOW_AFTER_MS);

    const prehero = document.getElementById("scene-prehero");
    if (prehero) {
      observer = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting && entry.boundingClientRect.top < 0) {
            show();
          }
        },
        { threshold: 0 },
      );
      observer.observe(prehero);
    }

    return () => {
      window.clearTimeout(timer);
      observer?.disconnect();
    };
  }, []);

  if (left === null || dismissed) return null;

  const dismiss = () => {
    setDismissed(true);
    try {
      window.sessionStorage.setItem(DISMISSED_KEY, "1");
    } catch {
      // Unavailable storage just means the card returns on the next load.
    }
  };

  return (
    <aside
      aria-label="Priority deadline reminder"
      // Above the audio toggle's corner on a phone, where the card is nearly
      // full width; beside it from `sm`, and clear of the edge rails at `lg`.
      className="deadline-pop fixed right-5 bottom-20 left-5 z-50 sm:right-6 sm:bottom-6 sm:left-auto sm:w-[420px] lg:right-14"
    >
      {/*
        Set as a system alert: a hazard-striped header bar, a notched "!"
        badge, the date in the display digits. Flat colour - the frame is a
        violet hairline (the clipped outer box showing 1px around the inner
        one, as the board and the cards do), no glow.
      */}
      <div className="bg-accent-magenta/70 p-px" style={{ clipPath: NOTCH_LG }}>
        <div
          className="bg-surface-deep relative"
          style={{ clipPath: NOTCH_LG }}
        >
          <div
            aria-hidden
            className="h-2"
            style={{
              backgroundImage:
                "repeating-linear-gradient(-45deg, var(--accent-magenta) 0 8px, transparent 8px 14px)",
            }}
          />

          <button
            type="button"
            onClick={dismiss}
            aria-label="Dismiss reminder"
            // z-10: the body's fade-in makes it a layer of its own, painted
            // after this button, and without it the body swallows the click.
            className="absolute top-4 right-3 z-10 flex h-8 w-8 items-center justify-center text-white/55 transition-colors hover:text-white focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-white"
          >
            <svg
              viewBox="0 0 24 24"
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="square"
              aria-hidden
            >
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>

          <div className="deadline-pop__body px-5 pt-5 pb-5 sm:px-6 sm:pb-6">
            <div className="flex items-center gap-3 pr-10">
              <span
                aria-hidden
                className="bg-accent-magenta flex size-10 shrink-0 items-center justify-center"
                style={{ clipPath: NOTCH_SM }}
              >
                {/* Drawn, not typed: Hypik has no "!". */}
                <svg
                  viewBox="0 0 24 24"
                  width="20"
                  height="20"
                  className="motion-safe:animate-pulse"
                  aria-hidden
                >
                  <rect x="10" y="3" width="4" height="12" fill="#fff" />
                  <rect x="10" y="18" width="4" height="4" fill="#fff" />
                </svg>
              </span>
              <p className="font-sans text-[13px] leading-none font-medium tracking-[0.2em] text-white uppercase sm:text-[14px]">
                Priority deadline
              </p>
            </div>

            <time
              dateTime="2026-10-03T23:59-05:00"
              className="mt-5 flex items-baseline gap-3 whitespace-nowrap text-white uppercase"
            >
              <span className="font-elevon text-[40px] leading-none font-bold tracking-[0.04em] sm:text-[46px]">
                Oct 3
              </span>
              <span className="font-elevon text-accent-soft text-[16px] leading-none font-bold tracking-[0.08em] sm:text-[18px]">
                11:59 PM CT
              </span>
            </time>
            <p className="font-sans text-accent-soft mt-3 text-[13px] tracking-[0.14em] uppercase sm:text-[14px]">
              {left}
            </p>

            <a
              href={APPLY_URL}
              style={{ clipPath: NOTCH_SM }}
              className="bg-accent-magenta font-sans mt-5 flex h-12 items-center justify-center text-[13px] font-medium tracking-[0.14em] text-[#f2f2f2] uppercase transition-opacity hover:opacity-90"
            >
              Apply now
            </a>
          </div>
        </div>
      </div>
    </aside>
  );
}
