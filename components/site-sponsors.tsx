import Image from "next/image";
import type { CSSProperties } from "react";

import sky from "@/assets/images/backgrounds/descent/sky-2x.webp";
import { BillboardPole } from "@/components/billboard-pole";
import { BoardGlow } from "@/components/board-glow";
import { Skeleton } from "@/components/skeleton";
import { SponsorLogo } from "@/components/sponsor-logo";
import type { LogoFit } from "@/lib/logo-fit";
import type { Sponsor } from "@/lib/types";

type SponsorTier = { name: string; sponsors: Sponsor[] };

/** One sponsor, placed: its tier's look on the board. */
type Slot = {
  sponsor: Sponsor;
  tier: string;
  look: TierLook;
  /** The tier's first sponsor, whose section carries the tier's name. */
  first: boolean;
};

/**
 * The sponsor board: one billboard in the station's concourse, bolted to a
 * tiled wall over a running LED board. On a desktop it has a billboard's
 * proportions, 5:2, and grows with the screen, logos and all. Tiers run top
 * to bottom in bands, each shorter than the one above, so a higher tier always
 * sits higher and gets bigger logos; a hairline separates one tier from the
 * next. On a phone the same bands flow down the screen instead.
 *
 * Logos are shown exactly as the sponsor supplied them - no recolouring, no
 * effects. What the board controls is everything around them: each is sized
 * by its real shape, so a wide wordmark and a square mark carry the same
 * visual weight in a cell of the same size, and one that would not read on
 * the screen is mounted on a plate. `fits` holds those measurements
 * (lib/logo-fit.ts).
 *
 * As the board scrolls in, its tube strikes. As each cell does, a cipher of
 * the sponsor's own id is scanned away to uncover the logo (globals.css,
 * "Sponsor board"). All of it is CSS keyed off the shared reveal observer, so
 * this stays a Server Component. Under reduced motion, or with no script, the
 * board is simply lit.
 */
export function SiteSponsors({
  sponsors,
  fits = {},
  unavailable = false,
  pending = false,
}: {
  sponsors: Sponsor[];
  fits?: Record<string, LogoFit | null>;
  unavailable?: boolean;
  /** The HARP request is still in flight; see components/api-sections.tsx. */
  pending?: boolean;
}) {
  const tiers = groupByTier(sponsors).map(placeTier);
  const bands = packBands(tiers);
  const empty = sponsors.length === 0 && !pending;

  return (
    <section
      id="sponsors"
      aria-labelledby="sponsors-heading"
      className={`bg-background relative overflow-hidden px-5 pt-20 sm:px-6 sm:pt-28 ${
        // With the board up, its pole runs down into the section's margin.
        empty ? "pb-20 sm:pb-28" : "pb-0"
      }`}
      aria-busy={pending || undefined}
    >
      <div aria-hidden className="tile-wall" />

      <div className="relative mx-auto max-w-[1100px]">
        <h2
          id="sponsors-heading"
          className="reveal font-hypik text-center leading-none tracking-[-0.02em] text-white uppercase"
          style={{ fontSize: "clamp(2.25rem, 7vw, 4.5rem)" }}
        >
          Sponsors
        </h2>
        <p className="reveal reveal-1 font-sans text-text-muted mx-auto mt-5 max-w-xl text-center text-[13px] leading-[1.6] tracking-[0.04em]">
          HackUTD is made possible by the organizations investing in our hackers
          and their ideas.
        </p>
      </div>

      {empty ? (
        <p className="font-sans text-text-dim relative mt-14 text-center text-[13px] leading-relaxed">
          {unavailable
            ? "Our live sponsor list is temporarily unavailable. Please check back soon."
            : "This year's sponsors will be announced soon."}
        </p>
      ) : (
        <div className="sponsor-board relative mx-auto mt-12 max-w-[1600px] sm:mt-16">
          <div className="sponsor-board__frame">
            <BoardHardware />
            <div className="sponsor-board__screen flex flex-col p-2 sm:p-3 lg:aspect-[5/2]">
              <Image
                src={sky}
                alt=""
                fill
                sizes="(max-width: 1600px) 100vw, 1600px"
                placeholder="blur"
                quality={65}
                className="-z-10 object-cover object-top opacity-40"
              />
              {pending ? (
                <BoardPending />
              ) : (
                bands.map((band) => (
                  <div
                    key={band[0][0].sponsor.id}
                    className="board-band flex flex-wrap lg:flex-nowrap"
                    style={
                      {
                        "--band-weight": Math.max(
                          ...band.flat().map((slot) => slot.look.bandWeight),
                        ),
                      } as CSSProperties
                    }
                  >
                    {band.map((group) => (
                      <div
                        key={group[0].sponsor.id}
                        className="board-group relative"
                        style={
                          {
                            "--group-units": group.reduce(
                              (sum, slot) => sum + slot.look.units,
                              0,
                            ),
                          } as CSSProperties
                        }
                      >
                        {/* The tier's name, once, where its section starts.
                            Each cell's label already says it to a screen
                            reader. */}
                        {group[0].first && (
                          <p
                            aria-hidden
                            className="board-group__tier font-sans"
                          >
                            {group[0].tier}
                          </p>
                        )}
                        <ul className="flex h-full flex-wrap lg:flex-nowrap">
                          {group.map((slot, index) => (
                            <BoardCell
                              key={slot.sponsor.id}
                              slot={slot}
                              index={index}
                              fit={fits[slot.sponsor.id] ?? null}
                            />
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                ))
              )}
            </div>
            <LedTicker names={tiers.flat().map((slot) => slot.sponsor.name)} />
          </div>
          <BillboardPole />
          <BoardGlow />
        </div>
      )}
    </section>
  );
}

/**
 * The board's dot-matrix header, running every sponsor's name. Decoration -
 * the cells carry the same names - so it is hidden from screen readers. The
 * track holds the text twice and travels -50%, so the loop has no seam.
 */
function LedTicker({ names }: { names: string[] }) {
  const line = ["Zero Day is powered by", ...names].join("  ◆  ") + "  ◆  ";

  return (
    <div aria-hidden className="led-ticker h-10 sm:h-11">
      {names.length > 0 && (
        <div
          className="led-ticker__track"
          style={{ animationDuration: `${Math.max(24, names.length * 3)}s` }}
        >
          {[0, 1].map((copy) => (
            <span
              key={copy}
              className="led-ticker__text font-elevon pr-[0.5em] text-[17px] leading-10 font-extrabold tracking-[0.06em] whitespace-pre sm:text-[20px] sm:leading-11"
            >
              {line}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Hardware set into the housing's border: a screw in each corner, a ruler
 * along the top edge, and power lights along the bottom.
 */
function BoardHardware() {
  return (
    <div aria-hidden>
      {(
        [
          { top: 0, left: 0 },
          { top: 0, right: 0 },
          { bottom: 0, left: 0 },
          { bottom: 0, right: 0 },
        ] as const
      ).map((corner, index) => (
        <span key={index} className="board-screw" style={corner} />
      ))}
      <span className="board-ruler" />
      <span className="board-lights">
        <span />
        <span />
        <span />
      </span>
    </div>
  );
}

/* The first bands of the real board. */
function BoardPending() {
  return (
    <>
      <Skeleton className="h-36 lg:h-auto lg:flex-[1.5]" />
      <Skeleton className="mt-2 h-28 lg:h-auto lg:flex-[1.4]" />
      <Skeleton className="mt-2 h-24 lg:h-auto lg:flex-[1.3]" />
    </>
  );
}

/*
 * How each tier sits on the board, by rank. A cell takes `units` of its band's
 * width - a band holds BAND_UNITS - and grows to fill what the band leaves
 * over. A band's height on the billboard is the largest `bandWeight` in it; on
 * a phone, where bands wrap, a cell has its own `height` instead. `weight` is
 * how much of the cell's height the logo's area is scaled to. Every one of
 * them shrinks down the ranks, so a higher tier is always the bigger logo.
 * Unknown tiers take the last, smallest look.
 */
const TIER_LOOK = [
  // Title
  {
    units: 7,
    bandWeight: 1.5,
    weight: 0.95,
    height: "h-36 lg:h-auto",
    sizes: "(max-width: 1023px) 80vw, 480px",
  },
  // Platinum
  {
    units: 5,
    bandWeight: 1.4,
    weight: 0.84,
    height: "h-28 lg:h-auto",
    sizes: "(max-width: 1023px) 45vw, 340px",
  },
  // Gold
  {
    units: 4,
    bandWeight: 1.3,
    weight: 0.84,
    height: "h-24 lg:h-auto",
    sizes: "(max-width: 1023px) 45vw, 280px",
  },
  // Silver
  {
    units: 3.6,
    bandWeight: 1.05,
    weight: 0.84,
    height: "h-20 lg:h-auto",
    sizes: "(max-width: 1023px) 33vw, 220px",
  },
  // Bronze
  {
    units: 3.6,
    bandWeight: 1.05,
    weight: 0.82,
    height: "h-20 lg:h-auto",
    sizes: "(max-width: 1023px) 33vw, 220px",
  },
  // Other Sponsors
  {
    units: 2,
    bandWeight: 0.8,
    weight: 0.82,
    height: "h-16 lg:h-auto",
    sizes: "(max-width: 1023px) 25vw, 160px",
  },
  // Also Thanking, and anything unranked.
  {
    units: 1.8,
    bandWeight: 0.8,
    weight: 0.78,
    height: "h-16 lg:h-auto",
    sizes: "(max-width: 1023px) 25vw, 160px",
  },
];

type TierLook = (typeof TIER_LOOK)[number];

const BAND_UNITS = 21;

/** Each tier's colour, for its cells' hover. */
const TIER_COLOR: Record<string, string> = {
  Title: "#ff2ee6",
  Platinum: "#dbc4ff",
  Gold: "#ffc24b",
  Silver: "#b8c4d6",
  Bronze: "#e0895a",
  "Other Sponsors": "#22e0ff",
  "Also Thanking": "#8b7bff",
};

/** A tier's sponsors, each with the tier's look on the board. */
function placeTier(tier: SponsorTier): Slot[] {
  const look = TIER_LOOK[Math.min(tierRank(tier.name), TIER_LOOK.length - 1)];
  return tier.sponsors.map((sponsor, index) => ({
    sponsor,
    tier: tier.name,
    look,
    first: index === 0,
  }));
}

/**
 * Lays tiers into bands, top to bottom in rank order. The title tier always
 * has the top band to itself. Any other tier starts a new band unless it fits
 * whole beside the tier before it - so a lone Bronze sponsor shares Silver's
 * band rather than getting one to itself - and a tier too wide for one band
 * carries on into the next, still on its own. Never reorders: a higher tier
 * is always above, or to the left in the same band.
 */
function packBands(tiers: Slot[][]): Slot[][][] {
  const bands: Slot[][][] = [];
  let used = BAND_UNITS;
  for (const tier of tiers) {
    const units = tier.reduce((sum, slot) => sum + slot.look.units, 0);
    const solo = tier[0].look === TIER_LOOK[0];
    if (!solo && used + units <= BAND_UNITS) {
      bands[bands.length - 1].push(tier);
      used += units;
      continue;
    }
    used = BAND_UNITS;
    for (const slot of tier) {
      if (used + slot.look.units > BAND_UNITS) {
        bands.push([[]]);
        used = 0;
      }
      bands[bands.length - 1][0].push(slot);
      used += slot.look.units;
    }
    if (solo) used = BAND_UNITS;
  }
  return bands;
}

function BoardCell({
  slot,
  index,
  fit,
}: {
  slot: Slot;
  index: number;
  fit: LogoFit | null;
}) {
  const { sponsor, tier, look } = slot;
  const website = safeWebsiteUrl(sponsor.website_url);
  // Unmeasured logos (and monograms) get a typical wordmark's shape.
  const ratio =
    fit && fit.height > 0
      ? (fit.box.width * fit.width) / (fit.box.height * fit.height)
      : 2.5;
  // Thin marks grow and dense ones shrink, toward a typical wordmark's 40% ink.
  // Softened and clamped so no logo strays far from its box-area size.
  const density = fit
    ? Math.min(
        1.3,
        Math.max(0.78, (0.4 / Math.max(fit.coverage, 0.01)) ** 0.35),
      )
    : 1;
  const content = (
    <>
      {/* Wiped in with the cipher. The logo itself is never animated. */}
      <div className="board-cell__reveal">
        <div
          className="board-cell__logo"
          data-plate={fit?.plate ? "" : undefined}
          style={
            {
              "--plate": fit?.plate ?? undefined,
              "--ratio": ratio,
              "--span": Math.sqrt(ratio) * density,
              "--weight": look.weight,
            } as CSSProperties
          }
        >
          <SponsorLogo sponsor={sponsor} fit={fit} sizes={look.sizes} />
        </div>
      </div>
      <span aria-hidden className="board-cell__cipher">
        {cipherOf(sponsor.id)}
      </span>
      <span aria-hidden className="board-cell__scan" />
      {website && (
        <svg
          aria-hidden
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          className="board-cell__open"
        >
          <path d="M9 2.5h4.5V7M13.5 2.5 7 9M11.5 9.5v4h-9v-9h4" />
        </svg>
      )}
    </>
  );
  // The rows no longer say which tier they are, so each cell does.
  const label = `${sponsor.name}, ${tier === "Title" ? "title" : tier} sponsor`;

  return (
    <li
      className={`board-cell ${look.height}`}
      style={
        {
          "--units": look.units || 1,
          "--tier": TIER_COLOR[tier] ?? "#8b93a1",
          // Stagger within a row, so a row decodes left to right.
          "--i": index % 6,
        } as CSSProperties
      }
    >
      {website ? (
        <a
          href={website}
          target="_blank"
          rel="noreferrer noopener"
          aria-label={`${label}. Visit their website (opens in a new tab)`}
          className="board-cell__link"
        >
          {content}
        </a>
      ) : (
        <div className="board-cell__link" aria-label={label} role="img">
          {content}
        </div>
      )}
    </li>
  );
}

/** The ciphertext a cell decrypts: the head of the sponsor's own id. */
function cipherOf(id: string): string {
  return (id.replace(/-/g, "").match(/.{4}/g) ?? []).slice(0, 4).join(" ");
}

function groupByTier(sponsors: Sponsor[]): SponsorTier[] {
  const tiers = new Map<string, Sponsor[]>();

  for (const sponsor of sponsors) {
    const tier = sponsor.tier.trim() || "Partners";
    const entries = tiers.get(tier) ?? [];
    entries.push(sponsor);
    tiers.set(tier, entries);
  }

  // Tiers rank by sponsorship level; display_order only orders within a tier.
  return [...tiers]
    .map(([name, entries]) => ({ name, sponsors: entries }))
    .sort((a, b) => tierRank(a.name) - tierRank(b.name));
}

// Mirrors TIER_OPTIONS in HARP's SponsorFormDialog.
const TIER_ORDER = [
  "Title",
  "Platinum",
  "Gold",
  "Silver",
  "Bronze",
  "Other Sponsors",
  "Also Thanking",
];

/** Unknown tiers (and "Partners") sit after the known ones, in API order. */
function tierRank(name: string): number {
  const rank = TIER_ORDER.indexOf(name);
  return rank === -1 ? TIER_ORDER.length : rank;
}

/** Only let organizer-supplied HTTP(S) URLs become clickable links. */
function safeWebsiteUrl(value: string): string | null {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:"
      ? url.toString()
      : null;
  } catch {
    return null;
  }
}
