/**
 * Site-wide constants shared by the metadata, the Open Graph image, the
 * sitemap, robots and the structured data, so a change to the event's name,
 * date or copy lands in every one of them at once.
 */

export const SITE_NAME = "HackUTD Zero Day";

export const SITE_TITLE =
  "HackUTD 2026: Zero Day — North America's Largest 24-Hour University Hackathon";

export const SITE_DESCRIPTION =
  "HackUTD 2026: Zero Day is a free 24-hour hackathon at The University of Texas at Dallas on November 7-8, 2026. 1200+ hackers, 30+ universities, sponsor challenge tracks, workshops and prizes. Applications are open.";

export const ORGANIZER_NAME = "HackUTD";
export const ORGANIZER_URL = "https://hackutd.co";
export const CONTACT_EMAIL = "hello@hackutd.co";
export const TWITTER_HANDLE = "@HackUTD";

export const SOCIAL_LINKS = [
  "https://www.instagram.com/hackutd",
  "https://x.com/HackUTD",
  "https://www.linkedin.com/company/hackutd",
  "https://medium.com/@hackUTD",
  "https://www.youtube.com/@realhackutd",
  "https://github.com/hackutd",
];

/** ISO 8601, America/Chicago. Keep in step with components/site-countdown.tsx. */
export const EVENT_START = "2026-11-07T09:00:00-06:00";
export const EVENT_END = "2026-11-08T17:00:00-06:00";

export const VENUE = {
  name: "The University of Texas at Dallas",
  streetAddress: "800 W Campbell Rd",
  addressLocality: "Richardson",
  addressRegion: "TX",
  postalCode: "75080",
  addressCountry: "US",
};

/**
 * The canonical origin, no trailing slash. `SITE_URL` wins so the production
 * domain can be pinned explicitly; otherwise Vercel's production hostname
 * keeps previews from advertising `localhost`, which is only the fallback for
 * `next dev`.
 */
function resolveSiteUrl(): string {
  const explicit = process.env.SITE_URL?.replace(/\/+$/, "");
  if (explicit) return explicit;

  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercel) return `https://${vercel}`;

  return "http://localhost:3001";
}

export const SITE_URL = resolveSiteUrl();
