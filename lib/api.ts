import "server-only";

import type { Envelope, FAQ, ScheduleItem, Sponsor } from "./types";

/**
 * Server-side client for the HARP public API.
 *
 * `/v1/public/*` sits behind APIKeyMiddleware and expects an `X-API-Key` header
 * matching the backend's PUBLIC_API_KEY. That is a shared secret, so every call
 * here must stay on the server — hence `server-only` above, and hence the env
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
 * display) but never the key — callers only learn whether it is present.
 */
export function getConfigStatus(): ConfigStatus {
  const missing: string[] = [];
  if (!BASE_URL) missing.push("HARP_API_BASE_URL");
  if (!API_KEY) missing.push("HARP_PUBLIC_API_KEY");

  return missing.length > 0
    ? { configured: false, missing }
    : { configured: true, baseUrl: BASE_URL! };
}

async function getPublic<T>(path: string): Promise<T> {
  if (!BASE_URL || !API_KEY) {
    throw new Error(
      "HARP_API_BASE_URL and HARP_PUBLIC_API_KEY must be set. " +
        "See .env.example; in Vercel set them per-environment.",
    );
  }

  let res: Response;
  try {
    res = await fetch(`${BASE_URL}/v1/public/${path}`, {
      headers: { "X-API-Key": API_KEY },
      next: { revalidate: REVALIDATE_SECONDS, tags: [`public:${path}`] },
    });
  } catch (cause) {
    // Connection refused, DNS failure, TLS error — the backend isn't reachable.
    throw new Error(`Could not reach ${BASE_URL}. Is the Go service running?`, {
      cause,
    });
  }

  if (!res.ok) {
    // Surface the backend's `{"error": "..."}` message when there is one.
    const detail = await res
      .json()
      .then((body: { error?: string }) => body.error)
      .catch(() => null);

    if (res.status === 401) {
      throw new Error(
        "401 Unauthorized — HARP_PUBLIC_API_KEY does not match the backend's PUBLIC_API_KEY.",
      );
    }
    throw new Error(
      `GET /v1/public/${path} failed: ${res.status}${detail ? ` — ${detail}` : ""}`,
    );
  }

  const body = (await res.json()) as Envelope<T>;
  return body.data;
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
