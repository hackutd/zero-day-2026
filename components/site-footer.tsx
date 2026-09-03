/**
 * Site footer, from the HackUTD 2026 Figma file (node 1794:182).
 *
 * The Figma frame is a fixed 1440x1010 board with every element absolutely
 * positioned, which is a description of one screen width rather than a layout.
 * This rebuilds the same design as ordinary flow — a centred 1200px column with
 * the wordmark bleeding past it — so it holds together at any width. The design
 * measurements survive as the ratios below.
 *
 * Type scale is expressed in `em`-based tracking rather than the px values the
 * file exports (`1.2px` at 12px is `0.1em`), so letter-spacing stays correct
 * once the sizes start scaling with the viewport.
 */

import { APPLY_URL } from "@/lib/links";

/**
 * Registration is HARP, the same portal the nav's Apply button opens - the two
 * are one destination under two labels, so both read it from `lib/links`.
 */
const REGISTER_URL = APPLY_URL;

/** A `#` here is still a placeholder nobody has supplied a URL for yet. */
type FooterLink = { label: string; href: string };

const linkColumns: { heading: string; links: FooterLink[] }[] = [
  {
    heading: "Pages",
    // The same anchors the nav uses. TODO(organizers): Sponsors has no section
    // to land on yet, so it stays a placeholder.
    links: [
      { label: "Home", href: "#scene-prehero" },
      { label: "Tracks", href: "#tracks" },
      { label: "Sponsors", href: "#" },
      { label: "FAQ", href: "#faq" },
    ],
  },
  {
    heading: "Resources",
    links: [
      { label: "Devpost", href: "#" },
      { label: "Discord", href: "#" },
      { label: "Starter kits", href: "#" },
      { label: "Hardware lab", href: "#" },
    ],
  },
  {
    heading: "Socials",
    links: [
      { label: "Instagram", href: "https://www.instagram.com/hackutd" },
      { label: "X", href: "https://x.com/HackUTD" },
      { label: "LinkedIn", href: "https://www.linkedin.com/company/hackutd" },
      { label: "Medium", href: "https://medium.com/@hackUTD" },
      { label: "YouTube", href: "https://www.youtube.com/@realhackutd" },
    ],
  },
  {
    heading: "Info",
    links: [
      {
        label: "MLH Code of Conduct",
        href: "https://static.mlh.io/docs/mlh-code-of-conduct.pdf",
      },
      { label: "Privacy", href: "#" },
      { label: "Contact", href: "mailto:hello@hackutd.co" },
    ],
  },
];

/** Sibling events, carried over from the HackPortal footer. */
const OTHER_HACKATHONS: FooterLink[] = [
  { label: "WEHack", href: "https://www.wehackutd.com" },
  { label: "HackTX", href: "https://hacktx.com" },
  { label: "TAMUHack", href: "https://tamuhack.org" },
  { label: "HackUTA", href: "https://www.hackuta.org" },
  { label: "HackUNT", href: "https://www.unthackathon.com" },
  { label: "RowdyHacks", href: "https://rowdyhacks.org" },
];

const ORGANIZER_URL = "https://hackutd.co/";
const GITHUB_URL = "https://github.com/hackutd";

/**
 * Anything off-site opens in a new tab; internal placeholders and the mail link
 * do not. `noreferrer` rather than a bare `noopener` because these are outbound
 * links to third parties.
 */
function isExternal(href: string) {
  return href.startsWith("http");
}

export function SiteFooter() {
  return (
    <footer className="bg-background overflow-hidden pt-16 pb-14 sm:pt-24">
      {/*
        The wordmark is wider than the 1200px content column — 1286 of the
        frame's 1440 — so it sits outside the column and is sized in `vw` to
        keep spanning ~89% of the viewport instead of overflowing on small
        screens. Tracking is -4% of the size, so it stays in `em`.
      */}
      {/*
        Hypik, not the Figma's Saira Black. It is a wider face at the same size,
        so the vw figure comes down to keep the word spanning the viewport
        rather than overflowing it. "ZERODAY" is all letters, which is the only
        reason this is safe - Hypik has no digits or punctuation.

        DAY takes the accent purple, the same token as the Apply button and
        the "open" below it, so the one word carries the site accent at the
        size where it reads best. It is one `<p>` with a span rather than two
        elements, so the two halves cannot be split across a line break or
        drift apart in tracking.
      */}
      <p
        aria-hidden
        className="font-hypik text-center leading-[0.85] tracking-[-0.02em] whitespace-nowrap text-white uppercase"
        style={{ fontSize: "clamp(2rem, 15.5vw, 16rem)" }}
      >
        Zero<span className="text-accent-magenta">day</span>
      </p>

      <div className="mx-auto max-w-[1200px] px-6">
        <h2
          className="font-sans mt-10 text-center leading-none font-black tracking-[-0.02em] text-white uppercase sm:mt-14"
          style={{ fontSize: "clamp(1.75rem, 3.9vw, 3.5rem)" }}
        >
          Registration is <span className="text-accent-magenta">open</span>
        </h2>

        <p className="font-sans text-text-muted mt-5 text-center text-[13px] leading-[1.55] tracking-[0.06em] uppercase">
          HackUTD 2026 — University of Texas at Dallas
        </p>

        <div className="mt-8 flex justify-center">
          <RegisterButton />
        </div>

        <nav
          aria-label="Footer"
          className="mt-20 grid grid-cols-2 gap-x-6 gap-y-10 sm:mt-24 sm:grid-cols-4"
        >
          {linkColumns.map((column) => (
            <div key={column.heading}>
              <h3 className="font-sans text-accent-soft text-[12px] leading-[1.3] font-medium tracking-[0.1em] uppercase">
                {column.heading}
              </h3>
              <ul className="mt-6 space-y-[11px]">
                {column.links.map(({ label, href }) => (
                  <li key={label}>
                    <a
                      href={href}
                      target={isExternal(href) ? "_blank" : undefined}
                      rel={isExternal(href) ? "noreferrer" : undefined}
                      className="font-sans text-text-muted focus-visible:outline-accent-magenta inline-block text-[12px] leading-[1.4] font-medium tracking-[0.08em] uppercase transition-colors hover:text-white focus-visible:text-white focus-visible:outline-2 focus-visible:outline-offset-4"
                    >
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <LearnMore />

        <p className="font-sans text-text-dim mt-16 text-center text-[9px] leading-[1.3] tracking-[0.12em] uppercase">
          © 2026 HackUTD · Zeroday · University of Texas at Dallas
        </p>
      </div>
    </footer>
  );
}

/**
 * The CTA. Its notched-corner shape is the SVG exported from the Figma
 * component (`public/button-accent.svg`) rather than a hand-drawn `clip-path`,
 * so the geometry is the designer's and not my approximation of it. The file
 * carries `preserveAspectRatio="none"`, i.e. it is built to be stretched to
 * whatever box it is given.
 */
function RegisterButton() {
  return (
    <a
      href={REGISTER_URL}
      className="focus-visible:outline-accent-magenta relative inline-flex h-12 w-44 items-center justify-center transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-4"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/button-accent.svg"
        alt=""
        aria-hidden
        className="absolute inset-0 h-full w-full"
      />
      <span className="font-sans relative text-[12px] leading-[1.3] font-medium tracking-[0.1em] text-white uppercase">
        Register
      </span>
    </a>
  );
}

/**
 * The credits band: who designed the site, the HackUTD GitHub org, and the
 * sibling events in the circuit.
 *
 * Set apart by spacing rather than a rule, matching the copyright below it.
 */
function LearnMore() {
  return (
    <div className="mt-20 grid gap-10 sm:grid-cols-2 sm:gap-6">
      <div>
        <h3 className="font-sans text-accent-soft text-[12px] leading-[1.3] font-medium tracking-[0.1em] uppercase">
          Learn more
        </h3>
        <div className="text-text-muted mt-6 space-y-[11px] text-[12px] leading-[1.5] font-medium tracking-[0.06em]">
          <p>
            Check out HackUTD&rsquo;s{" "}
            <CreditLink href={ORGANIZER_URL}>organizer website</CreditLink>
          </p>
          <p>Designed by HackUTD</p>
          <p>
            <CreditLink href={GITHUB_URL}>GitHub</CreditLink>
          </p>
        </div>
      </div>

      <div>
        <h3 className="font-sans text-accent-soft text-[12px] leading-[1.3] font-medium tracking-[0.1em] uppercase">
          Other Hackathons
        </h3>
        <ul className="mt-6 grid grid-cols-2 gap-x-6 gap-y-[11px]">
          {OTHER_HACKATHONS.map(({ label, href }) => (
            <li key={label}>
              <a
                href={href}
                target="_blank"
                rel="noreferrer"
                className="font-sans text-text-muted focus-visible:outline-accent-magenta inline-block text-[12px] leading-[1.4] font-medium tracking-[0.08em] uppercase transition-colors hover:text-white focus-visible:text-white focus-visible:outline-2 focus-visible:outline-offset-4"
              >
                {label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function CreditLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="focus-visible:outline-accent-magenta text-white underline underline-offset-2 transition-opacity hover:opacity-75 focus-visible:outline-2 focus-visible:outline-offset-4"
    >
      {children}
    </a>
  );
}
