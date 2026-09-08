import { Suspense } from "react";

import { DayOfSchedule } from "@/components/day-of-schedule";
import { SiteFaq } from "@/components/site-faq";
import { SiteSponsors } from "@/components/site-sponsors";
import { getConfigStatus, getFAQs, getSchedule, getSponsors } from "@/lib/api";
import { errorMessage } from "@/lib/format";

/**
 * The three sections backed by HARP, each behind its own Suspense boundary.
 *
 * The page used to await all three at the top of `Home`, which meant the
 * opening artwork - the LCP, and entirely static - could not be sent until a
 * network round trip to the Go service had finished. Boundaries here let React
 * flush the whole descent (skyline down to the platform), the countdown and the
 * keynote immediately, and stream these three in behind it.
 *
 * One boundary each rather than one around all three: they are independent
 * endpoints, and the schedule lives inside the board's tab panel while the
 * other two are top-level sections. Sharing a boundary would hold the fastest
 * response hostage to the slowest.
 */

type Loaded<T> = { items: T[]; unavailable: boolean };

/**
 * Fetch one endpoint, degrading to an empty section rather than an error.
 *
 * This is the per-endpoint half of what `Promise.allSettled` used to do in
 * `app/page.tsx`. Each section now absorbs its own failure, so a sponsor
 * outage empties the sponsor wall and nothing else.
 */
async function load<T>(
  fetcher: () => Promise<T[]>,
  label: string,
): Promise<Loaded<T>> {
  // Env vars missing is a deployment state, not a failure: the sections say so
  // rather than throwing. `getConfigStatus` never returns the key itself.
  if (!getConfigStatus().configured) return { items: [], unavailable: true };

  try {
    return { items: await fetcher(), unavailable: false };
  } catch (reason) {
    // One line, not a stack: these are expected, recoverable degradations -
    // an endpoint being down empties a section and the page carries on - and a
    // stack trace per revalidation would bury the ones that matter.
    console.error(
      `Could not load public HARP ${label}: ${errorMessage(reason)}`,
    );
    return { items: [], unavailable: true };
  }
}

async function ScheduleFromApi() {
  const { items, unavailable } = await load(getSchedule, "schedule");
  return <DayOfSchedule schedule={items} unavailable={unavailable} />;
}

async function SponsorsFromApi() {
  const { items, unavailable } = await load(getSponsors, "sponsors");
  return <SiteSponsors sponsors={items} unavailable={unavailable} />;
}

async function FaqsFromApi() {
  const { items, unavailable } = await load(getFAQs, "FAQs");
  return <SiteFaq faqs={items} unavailable={unavailable} />;
}

/*
 * Each fallback is the real component in its `pending` state, so the section
 * chrome - heading, standfirst, the board's tab panel padding - is identical
 * either side of the swap and only the list area changes. Rendering a separate
 * skeleton tree here would be a second copy of that chrome to keep in step.
 */

export function ScheduleSection() {
  return (
    <Suspense fallback={<DayOfSchedule schedule={[]} pending />}>
      <ScheduleFromApi />
    </Suspense>
  );
}

export function SponsorsSection() {
  return (
    <Suspense fallback={<SiteSponsors sponsors={[]} pending />}>
      <SponsorsFromApi />
    </Suspense>
  );
}

export function FaqSection() {
  return (
    <Suspense fallback={<SiteFaq faqs={[]} pending />}>
      <FaqsFromApi />
    </Suspense>
  );
}
