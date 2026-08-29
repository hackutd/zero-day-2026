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

/** TODO(organizers): real destinations. The Figma has labels, not URLs. */
const REGISTER_URL = "#";

const linkColumns: { heading: string; links: string[] }[] = [
  { heading: "Pages", links: ["Home", "Tracks", "Sponsors", "FAQ"] },
  {
    heading: "Resources",
    links: ["Devpost", "Discord", "Starter kits", "Hardware lab"],
  },
  { heading: "Socials", links: ["Instagram", "X", "LinkedIn", "GitHub"] },
  { heading: "Info", links: ["Code of conduct", "Privacy", "Contact"] },
];

export function SiteFooter() {
  return (
    <footer className="bg-surface-deep overflow-hidden pt-16 pb-14 sm:pt-24">
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
        reason this is safe — Hypik has no digits or punctuation.
      */}
      <p
        aria-hidden
        className="font-hypik text-center leading-[0.85] tracking-[-0.02em] whitespace-nowrap text-white uppercase"
        style={{ fontSize: "clamp(2rem, 15.5vw, 16rem)" }}
      >
        Zeroday
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
              <h3 className="font-sans text-accent-magenta text-[12px] leading-[1.3] font-medium tracking-[0.1em] uppercase">
                {column.heading}
              </h3>
              <ul className="mt-6 space-y-[11px]">
                {column.links.map((label) => (
                  <li key={label}>
                    <a
                      href="#"
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

        <hr className="border-border-hairline mt-16 border-0 border-t" />

        <p className="font-sans text-text-dim mt-8 text-center text-[9px] leading-[1.3] tracking-[0.12em] uppercase">
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
