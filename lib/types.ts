/**
 * Response shapes for the HARP public API (`/v1/public/*`).
 *
 * These mirror the Go structs in the HARP repo - keep them in sync:
 *   ScheduleItem -> internal/store/schedule.go
 *   Sponsor      -> cmd/api/public.go (PublicSponsor)
 *   FAQ          -> internal/store/faqs.go
 *   Track        -> cmd/api/public.go (PublicTrack)
 *
 * Sponsor and track logos arrive as `logo_url`: an absolute, keyless,
 * versioned URL to `/v1/public/sponsors/{id}/logo`, or "" when the row has no
 * logo. Logo bytes are never inlined. HARP builds each track from a sponsor's
 * challenge, so a track's id and logo are its sponsor's.
 *
 * Timestamps arrive as RFC 3339 strings, not Date objects.
 */

export type ScheduleItem = {
  id: string;
  event_name: string;
  description: string;
  start_time: string;
  end_time: string;
  location: string;
  tags: string[];
  created_at: string;
  updated_at: string;
};

export type Sponsor = {
  id: string;
  name: string;
  tier: string;
  logo_url: string;
  website_url: string;
  description: string;
  display_order: number;
  created_at: string;
  updated_at: string;
};

export type FAQ = {
  id: string;
  question: string;
  answer: string;
  display_order: number;
  created_at: string;
  updated_at: string;
};

export interface TrackPrize {
  place: string;
  prize: string;
}

export interface Track {
  id: string;
  title: string;
  sponsor_name: string;
  description: string;
  prizes: TrackPrize[];
  /** "" or an http(s) link to the sponsor's docs. Optional until HARP sends it everywhere. */
  resources_url?: string;
  /** One of the organizers' own prizes rather than a company's. Optional until HARP sends it. */
  organizer?: boolean;
  logo_url: string;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface TracksResponse {
  data: { tracks: Track[] };
}

/** Every HARP response is wrapped: success `{"data": ...}`, error `{"error": "..."}`. */
export type Envelope<T> = { data: T };
