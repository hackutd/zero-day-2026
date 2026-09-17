import { APPLY_URL } from "@/lib/links";
import {
  CONTACT_EMAIL,
  EVENT_END,
  EVENT_START,
  ORGANIZER_NAME,
  ORGANIZER_URL,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
  SOCIAL_LINKS,
  VENUE,
} from "@/lib/site";

const organizationId = `${ORGANIZER_URL}/#organization`;

const graph = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": organizationId,
      name: ORGANIZER_NAME,
      url: ORGANIZER_URL,
      email: CONTACT_EMAIL,
      logo: `${SITE_URL}/white-hackutd-logo.svg`,
      sameAs: SOCIAL_LINKS,
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: SITE_NAME,
      description: SITE_DESCRIPTION,
      inLanguage: "en-US",
      publisher: { "@id": organizationId },
    },
    {
      "@type": "Hackathon",
      "@id": `${SITE_URL}/#event`,
      name: "HackUTD 2026: Zero Day",
      description: SITE_DESCRIPTION,
      url: SITE_URL,
      image: `${SITE_URL}/opengraph-image`,
      startDate: EVENT_START,
      endDate: EVENT_END,
      eventStatus: "https://schema.org/EventScheduled",
      eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
      isAccessibleForFree: true,
      location: {
        "@type": "Place",
        name: VENUE.name,
        address: {
          "@type": "PostalAddress",
          streetAddress: VENUE.streetAddress,
          addressLocality: VENUE.addressLocality,
          addressRegion: VENUE.addressRegion,
          postalCode: VENUE.postalCode,
          addressCountry: VENUE.addressCountry,
        },
      },
      organizer: { "@id": organizationId },
      offers: {
        "@type": "Offer",
        url: APPLY_URL,
        price: "0",
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
      },
    },
  ],
};

/**
 * JSON-LD for search engines. `<` is escaped so no string in the graph can
 * close the script element, per the Next.js JSON-LD guide.
 */
export function StructuredData() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(graph).replace(/</g, "\\u003c"),
      }}
    />
  );
}
