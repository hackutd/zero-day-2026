import { SponsorLogo } from "@/components/sponsor-logo";
import type { Sponsor } from "@/lib/types";

type SponsorTier = { name: string; sponsors: Sponsor[] };

/** Sponsor wall populated by HARP in the API's configured display order. */
export function SiteSponsors({
  sponsors,
  unavailable = false,
}: {
  sponsors: Sponsor[];
  unavailable?: boolean;
}) {
  const tiers = groupByTier(sponsors);

  return (
    <section
      id="sponsors"
      aria-labelledby="sponsors-heading"
      className="bg-background px-5 py-20 sm:px-6 sm:py-28"
    >
      <div className="mx-auto max-w-[1000px]">
        <h2
          id="sponsors-heading"
          className="font-hypik text-center leading-none tracking-[-0.02em] text-white uppercase"
          style={{ fontSize: "clamp(2.25rem, 7vw, 4.5rem)" }}
        >
          Sponsors
        </h2>
        <p className="font-sans text-text-muted mx-auto mt-5 max-w-xl text-center text-[13px] leading-[1.6] tracking-[0.04em]">
          HackUTD is made possible by the organizations investing in our hackers
          and their ideas.
        </p>

        {sponsors.length === 0 ? (
          <p className="font-sans text-text-dim mt-14 text-center text-[13px] leading-relaxed">
            {unavailable
              ? "Our live sponsor list is temporarily unavailable. Please check back soon."
              : "This year's sponsors will be announced soon."}
          </p>
        ) : (
          <div className="mt-14 space-y-12">
            {tiers.map((tier) => (
              <SponsorTierGroup key={tier.name} tier={tier} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function SponsorTierGroup({ tier }: { tier: SponsorTier }) {
  return (
    <div>
      <h3 className="font-elevon text-text-muted text-center text-[12px] font-bold tracking-[0.18em] uppercase">
        {tier.name}
      </h3>
      <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
        {tier.sponsors.map((sponsor) => (
          <li key={sponsor.id}>
            <SponsorCard sponsor={sponsor} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function SponsorCard({ sponsor }: { sponsor: Sponsor }) {
  const website = safeWebsiteUrl(sponsor.website_url);
  const content = (
    <>
      <SponsorLogo sponsor={sponsor} />
      <p className="font-sans mt-4 text-center text-[13px] font-medium tracking-[0.03em] text-white">
        {sponsor.name}
      </p>
      {sponsor.description && (
        <p className="font-sans text-text-dim mt-1 text-center text-[11px] leading-relaxed">
          {sponsor.description}
        </p>
      )}
    </>
  );
  const className =
    "focus-visible:outline-accent-magenta block h-full border border-white/10 bg-white/5 p-5 transition-colors hover:border-white/25 hover:bg-white/8 focus-visible:outline-2 focus-visible:outline-offset-4";

  return website ? (
    <a
      href={website}
      target="_blank"
      rel="noreferrer noopener"
      aria-label={`Visit ${sponsor.name}'s website`}
      className={className}
    >
      {content}
    </a>
  ) : (
    <div className={className}>{content}</div>
  );
}

function groupByTier(sponsors: Sponsor[]): SponsorTier[] {
  const tiers = new Map<string, Sponsor[]>();

  for (const sponsor of sponsors) {
    const tier = sponsor.tier.trim() || "Partners";
    const entries = tiers.get(tier) ?? [];
    entries.push(sponsor);
    tiers.set(tier, entries);
  }

  return [...tiers].map(([name, entries]) => ({ name, sponsors: entries }));
}

/** Only let organizer-supplied HTTP(S) URLs become clickable links. */
function safeWebsiteUrl(value: string): string | null {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:"
      ? url.toString()
      : null;
  } catch {
    return null;
  }
}
