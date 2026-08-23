/**
 * Response shapes for the HARP public API (`/v1/public/*`).
 *
 * These mirror the Go structs in `internal/store/` — keep them in sync:
 *   ScheduleItem -> internal/store/schedule.go
 *   Sponsor      -> internal/store/sponsors.go
 *   FAQ          -> internal/store/faqs.go
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
  logo_data: string;
  logo_content_type: string;
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

/** Every HARP response is wrapped: success `{"data": ...}`, error `{"error": "..."}`. */
export type Envelope<T> = { data: T };
