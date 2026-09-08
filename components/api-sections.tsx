import { Suspense, type ReactNode } from "react";

import { ChallengeTracks } from "@/components/challenge-tracks";
import { DayOfSchedule } from "@/components/day-of-schedule";
import { RevealReady } from "@/components/reveal-ready";
import { SiteFaq } from "@/components/site-faq";
import { SiteSponsors } from "@/components/site-sponsors";
import {
  getConfigStatus,
  getFAQs,
  getSchedule,
  getSponsors,
  getTracks,
} from "@/lib/api";
import { errorMessage } from "@/lib/format";

/**
 * The four sections backed by HARP, each behind its own Suspense boundary.
 *
 * The page used to await all three at the top of `Home`, which meant the
 * opening artwork - the LCP, and entirely static - could not be sent until a
 * network round trip to the Go service had finished. Boundaries here let React
 * flush the whole descent (skyline down to the platform), the countdown and the
 * keynote immediately, and stream these four in behind it.
 *
 * One boundary each rather than one around all four: they are independent
 * endpoints, the schedule and tracks live in separate board tabs, and the
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
  return (
    <RevealScope phase="schedule-loaded">
      <DayOfSchedule schedule={items} unavailable={unavailable} />
    </RevealScope>
  );
}

async function SponsorsFromApi() {
  const { items, unavailable } = await load(getSponsors, "sponsors");
  return (
    <RevealScope phase="sponsors-loaded">
      <SiteSponsors sponsors={items} unavailable={unavailable} />
    </RevealScope>
  );
}

async function FaqsFromApi() {
  const { items, unavailable } = await load(getFAQs, "FAQs");
  return (
    <RevealScope phase="faqs-loaded">
      <SiteFaq faqs={items} unavailable={unavailable} />
    </RevealScope>
  );
}

async function TracksFromApi() {
  const { items, unavailable } = await load(getTracks, "tracks");
  return (
    <RevealScope phase="tracks-loaded">
      <ChallengeTracks tracks={items} unavailable={unavailable} />
    </RevealScope>
  );
}

/*
 * Each fallback is the real component in its `pending` state, so the section
 * chrome - heading, standfirst, the board's tab panel padding - is identical
 * either side of the swap and only the list area changes. Rendering a separate
 * skeleton tree here would be a second copy of that chrome to keep in step.
 */

export function ScheduleSection() {
  return (
    <Suspense
      fallback={
        <RevealScope phase="schedule-pending">
          <DayOfSchedule schedule={[]} pending />
        </RevealScope>
      }
    >
      <ScheduleFromApi />
    </Suspense>
  );
}

export function TracksSection() {
  return (
    <Suspense
      fallback={
        <RevealScope phase="tracks-pending">
          <ChallengeTracks tracks={[]} pending />
        </RevealScope>
      }
    >
      <TracksFromApi />
    </Suspense>
  );
}

export function SponsorsSection() {
  return (
    <Suspense
      fallback={
        <RevealScope phase="sponsors-pending">
          <SiteSponsors sponsors={[]} pending />
        </RevealScope>
      }
    >
      <SponsorsFromApi />
    </Suspense>
  );
}

export function FaqSection() {
  return (
    <Suspense
      fallback={
        <RevealScope phase="faqs-pending">
          <SiteFaq faqs={[]} pending />
        </RevealScope>
      }
    >
      <FaqsFromApi />
    </Suspense>
  );
}

function RevealScope({
  children,
  phase,
}: {
  children: ReactNode;
  phase: string;
}) {
  return (
    <div data-reveal-scope>
      {children}
      <RevealReady phase={phase} />
    </div>
  );
}
