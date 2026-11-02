"use client";

import Image from "next/image";
import { useState } from "react";

import { FilterChip } from "@/components/day-of-schedule";
import { Skeleton } from "@/components/skeleton";
import { logoSrc } from "@/lib/format";
import type { LogoFit } from "@/lib/logo-fit";
import { ORGANIZER_NAME } from "@/lib/site";
import type { Track, TrackPrize } from "@/lib/types";

const GROUPS = [
  { id: "company", label: "Company tracks" },
  { id: "organizer", label: `${ORGANIZER_NAME} tracks` },
] as const;

type GroupId = (typeof GROUPS)[number]["id"];

/**
 * Challenge tracks populated by HARP in stable display order, split into the
 * companies' and the organizers' own with a toggle. Both groups stay mounted
 * and the other is `hidden`, like the board's tabs, so every track is in the
 * document for search and find-in-page.
 */
export function ChallengeTracks({
  tracks,
  fits = {},
  unavailable = false,
  pending = false,
}: {
  tracks: Track[];
  /** Logo measurements by track id; see lib/logo-fit.ts. */
  fits?: Record<string, LogoFit | null>;
  unavailable?: boolean;
  /** The HARP request is still in flight; see components/api-sections.tsx. */
  pending?: boolean;
}) {
  const [group, setGroup] = useState<GroupId>("company");

  return (
    // No heading of its own: this is a tab panel, and the tab that opens it is
    // the heading. See components/event-board.tsx.
    <div className="mx-auto max-w-[1100px]" aria-busy={pending || undefined}>
      <div
        role="group"
        aria-label="Company or organizer tracks"
        className="flex flex-wrap justify-center gap-2"
      >
        {GROUPS.map(({ id, label }) => (
          <FilterChip
            key={id}
            label={label}
            active={group === id}
            onClick={() => setGroup(id)}
          />
        ))}
      </div>

      {pending ? (
        <TracksPending />
      ) : tracks.length === 0 ? (
        <p className="font-sans text-text-dim mt-12 text-center text-[13px] leading-relaxed">
          {unavailable
            ? "Our live challenge tracks are temporarily unavailable. Please check back soon."
            : "This year's challenge tracks will be announced soon."}
        </p>
      ) : (
        GROUPS.map(({ id, label }) => {
          const shown = tracks.filter(
            (track) => Boolean(track.organizer) === (id === "organizer"),
          );
          return (
            <div key={id} hidden={group !== id}>
              {shown.length === 0 ? (
                <p className="font-sans text-text-dim mt-12 text-center text-[13px] leading-relaxed">
                  {label} will be announced soon.
                </p>
              ) : (
                <div className="mt-10 grid items-start gap-3 lg:grid-cols-2">
                  {shown.map((track) => (
                    <TrackCard
                      key={track.id}
                      track={track}
                      fit={fits[track.id] ?? null}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}

function TracksPending() {
  return (
    <div className="mt-10 grid gap-3 lg:grid-cols-2">
      {Array.from({ length: 6 }, (_, index) => (
        <div
          key={index}
          className="border-border-hairline flex min-h-28 items-center gap-4 border bg-white/[0.02] p-4 sm:p-5"
        >
          <Skeleton className="h-12 w-24 shrink-0 rounded-[3px]" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-2.5 w-28" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * One track, shown in full: no toggle, so every brief and prize is visible.
 * The API logo is rendered only when present; logo-less tracks are text-only.
 */
function TrackCard({ track, fit }: { track: Track; fit: LogoFit | null }) {
  const sponsor = track.sponsor_name.trim();
  const src = logoSrc(track.logo_url);

  return (
    <article className="border-border-hairline border bg-white/[0.04]">
      <div className="flex items-center gap-4 p-4 sm:p-5">
        {src && (
          <div
            data-glow={fit?.glow ? "" : undefined}
            className="track-logo flex h-12 w-24 shrink-0 items-center justify-center bg-white/[0.04] p-1.5"
          >
            <Image
              src={src}
              alt={`${sponsor || track.title} logo`}
              width={96}
              height={48}
              sizes="96px"
              className="h-full w-full object-contain"
            />
          </div>
        )}

        <div className="min-w-0 flex-1">
          {/* The organizers' own tracks sit under their own toggle already. */}
          {!track.organizer && sponsor && (
            <p className="font-sans text-text-dim text-[10px] tracking-[0.14em] uppercase">
              Presented by {sponsor}
            </p>
          )}
          <h3 className="font-elevon mt-1.5 text-[16px] leading-[1.15] font-extrabold tracking-[0.02em] text-white uppercase first:mt-0 sm:text-[18px]">
            {track.title}
          </h3>
        </div>
      </div>

      {/* Sections are padded rather than the body, so each hairline runs the
          card's full width: under the header, and between brief and prizes. */}
      <div className="border-border-hairline divide-border-hairline divide-y border-t">
        <div className="px-4 py-4 sm:px-5">
          {/* Set like the prize places below it (PrizeList). */}
          <h4 className="font-elevon text-accent-soft mb-3 text-[12px] leading-none font-extrabold tracking-[0.06em] uppercase">
            Challenge statement
          </h4>
          {track.description ? (
            <p className="font-sans text-[15px] leading-[1.6] whitespace-pre-line text-white">
              {track.description}
            </p>
          ) : (
            <p className="font-sans text-text-dim text-[13px] leading-[1.65]">
              Challenge description coming soon.
            </p>
          )}
        </div>
        <div className="px-4 pt-4 pb-5 sm:px-5">
          <PrizeList prizes={track.prizes} />
          {/* isTrack has already checked this is an http(s) URL. */}
          {track.resources_url && (
            <a
              href={track.resources_url}
              target="_blank"
              rel="noreferrer"
              className="footer-link font-sans text-accent-soft mt-4 inline-block text-[12px] leading-[1.4]"
            >
              Resources &#8599;
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

function PrizeList({ prizes }: { prizes: TrackPrize[] }) {
  if (prizes.length === 0) {
    return (
      <p className="font-sans text-text-dim text-[13px] leading-[1.45]">
        Prize details coming soon.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {prizes.map(({ place, prize }, index) => (
        <li
          key={`${place}-${prize}-${index}`}
          className="flex items-baseline gap-3"
        >
          <span className="font-elevon text-accent-soft min-w-8 shrink-0 text-[12px] leading-none font-extrabold tracking-[0.06em] uppercase">
            {place}
          </span>
          <span className="font-sans text-[13px] leading-[1.45] text-white">
            {prize}
          </span>
        </li>
      ))}
    </ul>
  );
}
