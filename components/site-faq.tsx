import type { FAQ } from "@/lib/types";

/**
 * The FAQ is server-rendered from HARP. Native details/summary disclosures keep
 * it keyboard accessible and usable without shipping another client bundle.
 */

const CONTACT_EMAIL = "hello@hackutd.co";

export function SiteFaq({
  faqs,
  unavailable = false,
}: {
  faqs: FAQ[];
  unavailable?: boolean;
}) {
  const midpoint = Math.ceil(faqs.length / 2);

  return (
    <section
      id="faq"
      aria-labelledby="faq-heading"
      className="bg-background px-5 py-20 sm:px-6 sm:py-28"
    >
      <div className="mx-auto max-w-[820px]">
        <h2
          id="faq-heading"
          className="font-hypik text-center leading-none tracking-[-0.02em] text-white uppercase"
          style={{ fontSize: "clamp(2.25rem, 7vw, 4.5rem)" }}
        >
          FAQ
        </h2>

        <p className="font-sans text-text-muted mt-5 text-center text-[13px] leading-[1.6] tracking-[0.04em]">
          Can&rsquo;t find what you&rsquo;re looking for? Connect with our team
          at{" "}
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="focus-visible:outline-accent-magenta text-white underline underline-offset-2 transition-opacity hover:opacity-75 focus-visible:outline-2 focus-visible:outline-offset-4"
          >
            {CONTACT_EMAIL}
          </a>
        </p>

        <div className="mt-8 flex justify-center">
          <AskButton />
        </div>

        {faqs.length === 0 ? (
          <p className="font-sans text-text-dim mt-14 text-center text-[13px] leading-relaxed">
            {unavailable
              ? "The live FAQ is temporarily unavailable. Please check back soon."
              : "No FAQs have been published yet. Check back soon."}
          </p>
        ) : (
          <div className="mt-14 lg:grid lg:grid-cols-2 lg:gap-x-12">
            <FaqList items={faqs.slice(0, midpoint)} />
            <FaqList items={faqs.slice(midpoint)} />
          </div>
        )}
      </div>
    </section>
  );
}

function FaqList({ items }: { items: FAQ[] }) {
  return (
    <ul className="space-y-2">
      {items.map((faq) => (
        <li key={faq.id}>
          <details name="faq" className="disclosure border-b border-white/10">
            <summary className="font-sans flex cursor-pointer list-none items-center justify-between gap-6 py-4 text-left text-[14px] leading-[1.4] font-medium tracking-[0.02em] text-white transition-colors hover:text-white/75 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:text-[15px]">
              {faq.question}
              <Chevron />
            </summary>
            <div className="font-sans text-text-muted pt-1 pb-5 text-[13px] leading-[1.7] tracking-[0.02em] whitespace-pre-line">
              {faq.answer}
            </div>
          </details>
        </li>
      ))}
    </ul>
  );
}

/** Rotates to point down when its details element is open; see globals.css. */
function Chevron() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="square"
      className="disclosure-chevron text-accent-soft shrink-0"
      aria-hidden
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

const ASK_NOTCH =
  "polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)";

function AskButton() {
  return (
    <a
      href={`mailto:${CONTACT_EMAIL}`}
      style={{ clipPath: ASK_NOTCH }}
      className="bg-accent-magenta relative inline-flex h-11 items-center justify-center px-7 transition-opacity hover:opacity-90 sm:h-12 sm:px-9"
    >
      <span className="font-sans text-[12px] leading-none font-medium tracking-[0.1em] text-[#f2f2f2] uppercase">
        Ask a question
      </span>
    </a>
  );
}
