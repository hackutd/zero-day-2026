import { ConnectionPanel } from "@/components/connection-panel";
import { EndpointSection } from "@/components/endpoint-section";
import { SetupGuide } from "@/components/setup-guide";
import { SponsorLogo } from "@/components/sponsor-logo";
import { getConfigStatus, getFAQs, getSchedule, getSponsors } from "@/lib/api";
import { errorMessage, formatEventRange } from "@/lib/format";

export default async function Home() {
  const status = getConfigStatus();

  return (
    <main className="mx-auto w-full max-w-3xl grow px-6 py-12">
      <header>
        <p className="font-mono text-xs tracking-widest uppercase text-muted">
          HackUTD
        </p>
        <h1 className="mt-2 text-2xl font-semibold">Marketing site scaffold</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          This page is a starting point, not the finished site. It verifies the
          connection to the HARP Go service and renders whatever the public API
          returns. Replace it with the year&apos;s themed design — the data
          layer in <code className="font-mono text-foreground">lib/api.ts</code>{" "}
          is what you keep.
        </p>
      </header>

      <div className="mt-10 space-y-6">
        <ConnectionPanel status={status} />
        {status.configured ? (
          <PublicData />
        ) : (
          <SetupGuide missing={status.missing} />
        )}
      </div>
    </main>
  );
}

/**
 * Each endpoint is settled independently so one failure degrades a single card
 * rather than the whole page.
 */
async function PublicData() {
  const [schedule, sponsors, faqs] = await Promise.allSettled([
    getSchedule(),
    getSponsors(),
    getFAQs(),
  ]);

  return (
    <>
      <EndpointSection
        title="Schedule"
        path="GET /v1/public/schedule"
        error={
          schedule.status === "rejected"
            ? errorMessage(schedule.reason)
            : undefined
        }
        count={
          schedule.status === "fulfilled" ? schedule.value.length : undefined
        }
      >
        <ul className="divide-y divide-line">
          {schedule.status === "fulfilled" &&
            schedule.value.map((event) => (
              <li key={event.id} className="py-3 first:pt-0 last:pb-0">
                <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                  <span className="font-medium">{event.event_name}</span>
                  <span className="font-mono text-xs text-muted">
                    {formatEventRange(event.start_time, event.end_time)}
                  </span>
                </div>
                {event.location && (
                  <p className="mt-1 text-sm text-muted">{event.location}</p>
                )}
              </li>
            ))}
        </ul>
      </EndpointSection>

      <EndpointSection
        title="Sponsors"
        path="GET /v1/public/sponsors"
        error={
          sponsors.status === "rejected"
            ? errorMessage(sponsors.reason)
            : undefined
        }
        count={
          sponsors.status === "fulfilled" ? sponsors.value.length : undefined
        }
      >
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {sponsors.status === "fulfilled" &&
            sponsors.value.map((sponsor) => (
              <li
                key={sponsor.id}
                className="rounded-md border border-line p-3"
              >
                {sponsor.website_url ? (
                  <a
                    href={sponsor.website_url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="block"
                  >
                    <SponsorLogo sponsor={sponsor} />
                  </a>
                ) : (
                  <SponsorLogo sponsor={sponsor} />
                )}
                <p className="mt-3 truncate text-sm font-medium">
                  {sponsor.name}
                </p>
                <p className="font-mono text-xs text-muted">{sponsor.tier}</p>
              </li>
            ))}
        </ul>
      </EndpointSection>

      <EndpointSection
        title="FAQ"
        path="GET /v1/public/faq"
        error={
          faqs.status === "rejected" ? errorMessage(faqs.reason) : undefined
        }
        count={faqs.status === "fulfilled" ? faqs.value.length : undefined}
      >
        <dl className="divide-y divide-line">
          {faqs.status === "fulfilled" &&
            faqs.value.map((faq) => (
              <div key={faq.id} className="py-3 first:pt-0 last:pb-0">
                <dt className="font-medium">{faq.question}</dt>
                <dd className="mt-1 text-sm leading-relaxed text-muted">
                  {faq.answer}
                </dd>
              </div>
            ))}
        </dl>
      </EndpointSection>
    </>
  );
}
