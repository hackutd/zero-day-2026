import "server-only";

import { unstable_cache } from "next/cache";

import type {
  Envelope,
  FAQ,
  ScheduleItem,
  Sponsor,
  Track,
  TrackPrize,
  TracksResponse,
} from "./types";

/**
 * Server-side client for the HARP public API.
 *
 * `/v1/public/*` sits behind APIKeyMiddleware and expects an `X-API-Key` header
 * matching the backend's PUBLIC_API_KEY. That is a shared secret, so every call
 * here must stay on the server - hence `server-only` above, and hence the env
 * vars are deliberately NOT prefixed with NEXT_PUBLIC_. Reaching for this module
 * from a Client Component is a build error, which is the intent.
 */

const BASE_URL = process.env.HARP_API_BASE_URL;
const API_KEY = process.env.HARP_PUBLIC_API_KEY;

/** How long a fetched payload stays fresh, in seconds. Surfaced in the UI. */
export const REVALIDATE_SECONDS = 300;

export type ConfigStatus =
  | { configured: true; baseUrl: string }
  | { configured: false; missing: string[] };

/**
 * Whether the backend connection is configured. Returns the base URL (safe to
 * display) but never the key - callers only learn whether it is present.
 */
export function getConfigStatus(): ConfigStatus {
  const missing: string[] = [];
  if (!BASE_URL) missing.push("HARP_API_BASE_URL");
  if (!API_KEY) missing.push("HARP_PUBLIC_API_KEY");

  return missing.length > 0
    ? { configured: false, missing }
    : { configured: true, baseUrl: BASE_URL! };
}

async function requestPublic(
  path: string,
  cacheResponse: boolean,
): Promise<unknown> {
  if (!BASE_URL || !API_KEY) {
    throw new Error(
      "HARP_API_BASE_URL and HARP_PUBLIC_API_KEY must be set. " +
        "See .env.example; in Vercel set them per-environment.",
    );
  }

  let res: Response;
  try {
    const headers = { "X-API-Key": API_KEY };
    res = await fetch(
      `${BASE_URL.replace(/\/$/, "")}/v1/public/${path}`,
      cacheResponse
        ? {
            headers,
            next: {
              revalidate: REVALIDATE_SECONDS,
              tags: [`public:${path}`],
            },
          }
        : { headers, cache: "no-store" },
    );
  } catch (cause) {
    // Connection refused, DNS failure, TLS error - the backend isn't reachable.
    throw new Error(`Could not reach ${BASE_URL}. Is the Go service running?`, {
      cause,
    });
  }

  if (res.status !== 200) {
    // Surface the backend's `{"error": "..."}` message when there is one.
    const detail = await res
      .json()
      .then((body: unknown) =>
        isRecord(body) && typeof body.error === "string" ? body.error : null,
      )
      .catch(() => null);

    if (res.status === 401) {
      throw new Error(
        "401 Unauthorized: HARP_PUBLIC_API_KEY does not match the backend's PUBLIC_API_KEY.",
      );
    }
    throw new Error(
      `GET /v1/public/${path} failed: ${res.status}${detail ? `, ${detail}` : ""}`,
    );
  }

  return res.json() as Promise<unknown>;
}

async function getPublic<T>(path: string): Promise<T> {
  const body = await requestPublic(path, true);
  if (!isRecord(body) || !("data" in body)) {
    throw new Error(
      `GET /v1/public/${path} returned an invalid response envelope.`,
    );
  }

  return (body as Envelope<T>).data;
}

export async function getSchedule(): Promise<ScheduleItem[]> {
  const { schedule } = await getPublic<{ schedule: ScheduleItem[] }>(
    "schedule",
  );
  return schedule ?? [];
}

export async function getSponsors(): Promise<Sponsor[]> {
  const { sponsors } = await getPublic<{ sponsors: Sponsor[] }>("sponsors");
  return sponsors ?? [];
}

export async function getFAQs(): Promise<FAQ[]> {
  const { faqs } = await getPublic<{ faqs: FAQ[] }>("faq");
  return faqs ?? [];
}

/**
 * Fetch and validate tracks as one cacheable operation.
 *
 * The inner request opts out of fetch caching so only a fully validated 200
 * response can replace this cache entry. If revalidation receives a 429, 500,
 * or malformed body, the function throws and Next keeps serving the last
 * successful value.
 */
async function fetchTracks(): Promise<Track[]> {
  const body = await requestPublic("tracks", false);
  if (!isTracksResponse(body)) {
    throw new Error(
      "GET /v1/public/tracks returned a response that does not match the tracks contract.",
    );
  }

  return [...body.data.tracks].sort(compareTracks);
}

export const getTracks = unstable_cache(fetchTracks, ["public:tracks:v1"], {
  revalidate: REVALIDATE_SECONDS,
  tags: ["public:tracks"],
});

const TRACK_LOGO_CONTENT_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
]);
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const RFC_3339_PATTERN =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/;

function isTracksResponse(value: unknown): value is TracksResponse {
  if (!isRecord(value) || !isRecord(value.data)) return false;
  const { tracks } = value.data;
  return Array.isArray(tracks) && tracks.every(isTrack);
}

function isTrack(value: unknown): value is Track {
  if (!isRecord(value)) return false;

  return (
    typeof value.id === "string" &&
    UUID_PATTERN.test(value.id) &&
    typeof value.title === "string" &&
    value.title.length > 0 &&
    value.title.length <= 200 &&
    typeof value.sponsor_name === "string" &&
    typeof value.description === "string" &&
    Array.isArray(value.prizes) &&
    value.prizes.length <= 10 &&
    value.prizes.every(isTrackPrize) &&
    typeof value.logo_data === "string" &&
    typeof value.logo_content_type === "string" &&
    hasValidTrackLogo(value.logo_data, value.logo_content_type) &&
    typeof value.display_order === "number" &&
    Number.isInteger(value.display_order) &&
    value.display_order >= 0 &&
    isRfc3339(value.created_at) &&
    isRfc3339(value.updated_at)
  );
}

function isTrackPrize(value: unknown): value is TrackPrize {
  return (
    isRecord(value) &&
    typeof value.place === "string" &&
    value.place.length <= 50 &&
    typeof value.prize === "string" &&
    value.prize.length <= 200
  );
}

function hasValidTrackLogo(data: string, contentType: string): boolean {
  return data === ""
    ? contentType === ""
    : TRACK_LOGO_CONTENT_TYPES.has(contentType);
}

function isRfc3339(value: unknown): value is string {
  return (
    typeof value === "string" &&
    RFC_3339_PATTERN.test(value) &&
    !Number.isNaN(Date.parse(value))
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function compareTracks(a: Track, b: Track): number {
  return (
    a.display_order - b.display_order ||
    compareText(a.title, b.title) ||
    compareText(a.id, b.id)
  );
}

function compareText(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}
