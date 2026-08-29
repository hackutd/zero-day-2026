"use client";

import { useEffect, useId, useRef, useState } from "react";

/**
 * The hero navbar, from the Figma Hero frame (node 1994:101).
 *
 * It is deliberately absent over the opening skyline panel and slides in once
 * that panel has scrolled away, so the first thing on screen is the art rather
 * than chrome. An IntersectionObserver watches the prehero panel; the extra
 * `boundingClientRect.top < 0` test distinguishes "scrolled past it" from "not
 * yet reached it", since both read as not intersecting.
 *
 * The bar runs the full width of the site rather than the Figma's centred
 * 1440 column, so the wordmark and the Apply button sit in the actual
 * corners. The links ride in a rounded white pill centred between them.
 *
 * Neither the pill nor the button carries the outline the Figma exports draw,
 * which is why neither uses those SVGs any more: the button's notch is a
 * clip-path (no stroke, and it holds its 12px corners at any width, where a
 * stretched asset would skew them) and the pill is just a rounded white box.
 *
 * Below `lg` the centre pill cannot share a phone's width with the wordmark and
 * the button, so the links move into a disclosure panel behind a menu button.
 * The wordmark and button also step down a size there to make room.
 *
 * FONT NOTE: the Figma specifies `Elevon TwoG` for the links and the button,
 * and that font is nowhere on this machine. They are set in Satoshi instead —
 * right size, tracking, and case, wrong face. Drop the Elevon file in and it is
 * a one-line swap. The wordmark's Hypik is the real thing.
 */
export function SiteNav() {
  const [past, setPast] = useState(false);
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const prehero = document.getElementById("scene-prehero");
    if (!prehero) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isPast =
          !entry.isIntersecting && entry.boundingClientRect.top < 0;
        setPast(isPast);
        // The bar hides itself over the opening scene. Closing here rather than
        // in an effect keeps it to this one subscription callback: a panel left
        // open would be invisible but still in the tab order.
        if (!isPast) setOpen(false);
      },
      { threshold: 0 },
    );
    observer.observe(prehero);
    return () => observer.disconnect();
  }, []);

  // Escape closes and hands focus back to the button that opened it, so a
  // keyboard user is not dropped at the top of the document.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      menuButtonRef.current?.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header
      // `invisible` rather than opacity alone, so the links leave the tab order
      // entirely while the bar is hidden.
      className={`fixed inset-x-0 top-4 z-50 transition-[opacity,transform,visibility] duration-500 ease-out ${
        past
          ? "visible translate-y-0 opacity-100"
          : "invisible -translate-y-4 opacity-0"
      }`}
    >
      <div className="relative flex h-12 w-full items-center px-5 sm:px-6">
        <a
          href="#"
          className="font-hypik text-[20px] leading-none tracking-[-0.01em] text-white uppercase focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white sm:text-[24px]"
        >
          Zeroday
        </a>

        <NavPill className="absolute left-1/2 hidden -translate-x-1/2 lg:block" />

        <div className="ms-auto flex items-center gap-2 sm:gap-3">
          <MenuButton
            ref={menuButtonRef}
            open={open}
            panelId={panelId}
            onToggle={() => setOpen((v) => !v)}
          />
          <ApplyButton />
        </div>
      </div>

      <MobilePanel id={panelId} open={open} onNavigate={() => setOpen(false)} />
    </header>
  );
}

const NAV_LINKS = ["Home", "Tracks", "Sponsors", "FAQ"];

/**
 * The small-screen disclosure. Only rendered below `lg`, where the pill is
 * hidden — above that the links are already on the bar and a second copy would
 * be a duplicate tab stop.
 */
function MenuButton({
  ref,
  open,
  panelId,
  onToggle,
}: {
  ref: React.Ref<HTMLButtonElement>;
  open: boolean;
  panelId: string;
  onToggle: () => void;
}) {
  return (
    <button
      ref={ref}
      type="button"
      onClick={onToggle}
      aria-expanded={open}
      aria-controls={panelId}
      aria-label={open ? "Close menu" : "Open menu"}
      className="flex h-10 w-10 items-center justify-center bg-white/10 transition-colors hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white lg:hidden"
      style={{ clipPath: NOTCH_SM }}
    >
      {/* Two bars that cross into an X, so the state change is the same object
          moving rather than one icon swapped for another. */}
      <span className="relative block h-4 w-5">
        <span
          className={`absolute left-0 block h-px w-full bg-white transition-transform duration-300 ${
            open ? "top-1/2 rotate-45" : "top-1"
          }`}
        />
        <span
          className={`absolute left-0 block h-px w-full bg-white transition-transform duration-300 ${
            open ? "top-1/2 -rotate-45" : "top-[11px]"
          }`}
        />
      </span>
    </button>
  );
}

function MobilePanel({
  id,
  open,
  onNavigate,
}: {
  id: string;
  open: boolean;
  onNavigate: () => void;
}) {
  return (
    <div
      id={id}
      // `hidden` when closed keeps the links out of the tab order entirely,
      // rather than leaving invisible targets on the page.
      hidden={!open}
      className="mt-3 px-5 sm:px-6 lg:hidden"
    >
      <nav
        aria-label="Sections"
        className="bg-surface-deep/95 p-2 backdrop-blur-md"
        style={{ clipPath: NOTCH_LG }}
      >
        <ul className="flex flex-col">
          {NAV_LINKS.map((label) => (
            <li key={label}>
              <a
                href="#"
                onClick={onNavigate}
                className="font-sans block px-4 py-3 text-[13px] tracking-[0.1em] text-white/85 uppercase transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-white"
              >
                {label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}

/** The same chamfer as the buttons, at sizes that suit each box. */
const NOTCH_SM =
  "polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)";
const NOTCH_LG =
  "polygon(16px 0, 100% 0, 100% calc(100% - 16px), calc(100% - 16px) 100%, 0 100%, 0 16px)";

/**
 * The centre pill: a plain white box with a soft 6px radius — enough to read as
 * rounded without going full capsule, which fought the angular chrome around
 * it. It sits at 40px against the bar's 48px so it reads as lighter than the
 * Apply button rather than matching its weight.
 *
 * The Figma export was a notched outline, which is neither the shape nor the
 * border wanted here, so the shape is CSS and there is no asset to stretch.
 */
function NavPill({ className }: { className?: string }) {
  return (
    <nav
      aria-label="Sections"
      className={`h-10 rounded-md bg-white ${className ?? ""}`}
    >
      <ul className="flex h-full items-center gap-[18px] px-[26px]">
        {NAV_LINKS.map((label) => (
          <li key={label}>
            <a
              href="#"
              className="font-sans text-[12px] leading-[1.4] font-medium tracking-[0.08em] text-[#05070a] uppercase transition-opacity hover:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#05070a]"
            >
              {label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/**
 * Keeps the notched silhouette of the Figma button but drops its outline. The
 * corners stay a true 12px at any width because the polygon is in px, not
 * percentages — the notch is 12 of 176 across and 12 of 48 down, so a
 * percentage polygon would skew it out of square.
 */
const NOTCH =
  "polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)";

function ApplyButton() {
  return (
    <a
      href="#"
      style={{ clipPath: NOTCH }}
      className="bg-accent-magenta relative inline-flex h-10 w-32 items-center justify-center transition-opacity hover:opacity-90 sm:h-12 sm:w-44"
    >
      <span className="font-sans text-[12px] leading-[1.3] font-medium tracking-[0.1em] text-[#f2f2f2] uppercase">
        Apply
      </span>
    </a>
  );
}
