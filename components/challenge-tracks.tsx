import { CloseOnScroll } from "@/components/close-on-scroll";
import { Skeleton } from "@/components/skeleton";
import type { Track, TrackPrize } from "@/lib/types";

/** Challenge tracks populated by HARP in stable display order. */
export function ChallengeTracks({
  tracks,
  unavailable = false,
  pending = false,
}: {
  tracks: Track[];
  unavailable?: boolean;
  /** The HARP request is still in flight; see components/api-sections.tsx. */
  pending?: boolean;
}) {
  return (
    // No heading of its own: this is a tab panel, and the tab that opens it is
    // the heading. See components/event-board.tsx.
    <div className="mx-auto max-w-[1100px]" aria-busy={pending || undefined}>
      <p className="font-sans text-text-muted text-center text-[13px] leading-[1.6] tracking-[0.04em]">
        Enter up to two. Open a track to read its challenge and prize details.
      </p>

      {pending ? (
        <TracksPending />
      ) : tracks.length === 0 ? (
        <p className="font-sans text-text-dim mt-12 text-center text-[13px] leading-relaxed">
          {unavailable
            ? "Our live challenge tracks are temporarily unavailable. Please check back soon."
            : "This year's challenge tracks will be announced soon."}
        </p>
      ) : (
        <>
          <div className="mt-10 grid gap-3 lg:grid-cols-2">
            {tracks.map((track) => (
              <TrackCard key={track.id} track={track} />
            ))}
          </div>
          <CloseOnScroll name="challenge-track" />
        </>
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
 * One track, collapsed to the details a hacker scans first. The API logo is
 * rendered only when present; logo-less tracks remain text-only cards.
 */
function TrackCard({ track }: { track: Track }) {
  const sponsor = track.sponsor_name.trim();
  const logoSrc = trackLogoSrc(track);
  const [topPrize] = track.prizes;

  return (
    <details
      name="challenge-track"
      className="disclosure border-border-hairline group border bg-white/[0.02] open:bg-white/[0.04]"
    >
      <summary className="flex cursor-pointer list-none items-start gap-4 p-4 sm:p-5">
        {logoSrc && (
          <div className="flex h-12 w-24 shrink-0 items-center justify-center bg-white/[0.04] p-1.5">
            {/* Inline data URIs are not optimized by next/image. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={logoSrc}
              alt={`${sponsor || track.title} logo`}
              width={96}
              height={48}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-contain"
            />
          </div>
        )}

        <div className="min-w-0 flex-1">
          <p className="font-sans text-text-dim text-[10px] tracking-[0.14em] uppercase">
            {sponsor ? `Presented by ${sponsor}` : "HackUTD challenge"}
          </p>
          <h3 className="font-elevon mt-1.5 text-[16px] leading-[1.15] font-extrabold tracking-[0.02em] text-white uppercase sm:text-[18px]">
            {track.title}
          </h3>
          <p className="font-sans text-accent-soft mt-2 text-[12px] leading-[1.4] group-open:hidden">
            {topPrize
              ? `${topPrize.place}: ${topPrize.prize}`
              : "Prize details coming soon"}
          </p>
        </div>

        <span
          aria-hidden
          className="disclosure-chevron text-text-dim mt-1 shrink-0 text-[11px] leading-none"
        >
          &#9660;
        </span>
      </summary>

      <div className="border-border-hairline mx-4 border-t pt-4 pb-5 sm:mx-5">
        {track.description ? (
          <p className="font-sans text-text-muted text-[13px] leading-[1.65] whitespace-pre-line">
            {track.description}
          </p>
        ) : (
          <p className="font-sans text-text-dim text-[13px] leading-[1.65]">
            Challenge description coming soon.
          </p>
        )}
        <div className="mt-4">
          <PrizeList prizes={track.prizes} />
        </div>
      </div>
    </details>
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

function trackLogoSrc(track: Track): string | null {
  if (track.logo_data === "" || track.logo_content_type === "") return null;
  return `data:${track.logo_content_type};base64,${track.logo_data}`;
}
