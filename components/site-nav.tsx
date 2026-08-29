"use client";

import { useEffect, useState } from "react";

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
 * FONT NOTE: the Figma specifies `Elevon TwoG` for the links and the button,
 * and that font is nowhere on this machine. They are set in Satoshi instead —
 * right size, tracking, and case, wrong face. Drop the Elevon file in and it is
 * a one-line swap. The wordmark's Hypik is the real thing.
 */
export function SiteNav() {
  const [past, setPast] = useState(false);

  useEffect(() => {
    const prehero = document.getElementById("scene-prehero");
    if (!prehero) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setPast(!entry.isIntersecting && entry.boundingClientRect.top < 0);
      },
      { threshold: 0 },
    );
    observer.observe(prehero);
    return () => observer.disconnect();
  }, []);

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
          className="font-hypik text-[24px] leading-none tracking-[-0.01em] text-white uppercase focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
        >
          Zero-day
        </a>

        {/* Hidden on small screens: four links plus the pill's own padding
            cannot share a phone's width with the wordmark and the button. */}
        <NavPill className="absolute left-1/2 hidden -translate-x-1/2 lg:block" />

        <div className="ms-auto">
          <ApplyButton />
        </div>
      </div>
    </header>
  );
}

const NAV_LINKS = ["Home", "Tracks", "Sponsors", "FAQ"];

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
      className="bg-accent-magenta relative inline-flex h-12 w-44 items-center justify-center transition-opacity hover:opacity-90"
    >
      <span className="font-sans text-[12px] leading-[1.3] font-medium tracking-[0.1em] text-[#f2f2f2] uppercase">
        Apply
      </span>
    </a>
  );
}
