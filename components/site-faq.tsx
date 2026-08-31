/**
 * The FAQ.
 *
 * Native `<details>`/`<summary>` rather than a JS disclosure: it is keyboard
 * and screen-reader accessible with no work, survives a failed hydration, and
 * browser find-in-page can open a collapsed answer to reveal a match. Nothing
 * here needs state, so nothing here is a client component.
 *
 * Collapsed by default and split into two columns from `lg`, which is what
 * keeps fourteen questions to a single screen. `name` puts every one of them in
 * one exclusive group - across both columns - so opening an answer closes the
 * last and the section never grows as you read down it.
 *
 * Plain black for now, pending background art.
 */

const CONTACT_EMAIL = "hello@hackutd.co";
const MLH_CODE_OF_CONDUCT =
  "https://static.mlh.io/docs/mlh-code-of-conduct.pdf";
/** TODO(organizers): the travel reimbursement policy page. */
const TRAVEL_POLICY_URL = "#";

const FAQS: { q: string; a: React.ReactNode }[] = [
  {
    q: "What is a hackathon?",
    a: "A hackathon is a 24-hour competition where you and up to 3 teammates build a software project from scratch and compete against other groups for prizes. Sponsors will also provide workshops, events, and activities throughout the weekend to help you learn more about the field of technology!",
  },
  { q: "When is HackUTD?", a: "November 8th and 9th!" },
  {
    q: "Where is it held?",
    a: "HackUTD will be hosted at… You guessed it: UT Dallas! Parking and other logistical details for attendees will be provided closer to the hackathon date.",
  },
  {
    q: "Who can attend?",
    a: "Everyone is welcome to come, and no experience is necessary to attend! We will even be hosting workshops to introduce new hackers to industry programs and technologies.",
  },
  {
    q: "How much does it cost?",
    a: "HackUTD 2025 will be completely free to hackers!",
  },
  {
    q: "When do applications close?",
    a: "Applications will close on October 18th.",
  },
  {
    q: "Do you take walk-ins?",
    a: "Historically HackUTD has taken limited walk-ins. We anticipate to take walk-ins again this year but will be subject to venue capacity!",
  },
  {
    q: "What should I bring?",
    a: "You just need to bring a laptop, charger, and a hacking spirit to participate! We also recommend having a compiler, packages, or any packaging tools ready beforehand. We will be providing internet connectivity, and will also have free food throughout the event!",
  },
  {
    q: "What can I build?",
    a: "Anything you want! You can try to solve a sponsor challenge or submit a project for the HackUTD awards!",
  },
  {
    q: "What if I don’t have a team?",
    a: "We will have a team building session at the start of the hackathon for those who need help finding one! You can also choose to work on projects by yourself.",
  },
  {
    q: "What are the rules?",
    a: (
      <>
        Your project must be built entirely over the course of the weekend. No
        previous projects or code may be used. Have fun! Your behavior at this
        event is subject to the{" "}
        <FaqLink href={MLH_CODE_OF_CONDUCT}>MLH Code of Conduct</FaqLink> as
        well as any applicable UT Dallas guidelines.
      </>
    ),
  },
  {
    q: "Will there be swag?",
    a: "We will have custom HackUTD 2025 swag for all participants along with gear provided by our sponsors! And free food!",
  },
  {
    q: "Do you offer travel reimbursement?",
    a: (
      <>
        HackUTD does do travel reimbursement! Check our policies{" "}
        <FaqLink href={TRAVEL_POLICY_URL}>here</FaqLink>!
      </>
    ),
  },
  {
    q: "Can I mentor or volunteer?",
    a: "Mentor and volunteer applications will be opening soon! Follow us on social media to be notified when applications open.",
  },
];

export function SiteFaq() {
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

        {/*
          Two independent lists side by side from `lg`, rather than one list in
          a two-column grid: grid rows are shared across columns, so opening an
          answer would stretch its neighbour's cell and leave a hole. Separate
          lists each reflow on their own.
        */}
        <div className="mt-14 lg:grid lg:grid-cols-2 lg:gap-x-12">
          <FaqList items={FAQS.slice(0, Math.ceil(FAQS.length / 2))} />
          <FaqList items={FAQS.slice(Math.ceil(FAQS.length / 2))} />
        </div>
      </div>
    </section>
  );
}

function FaqList({ items }: { items: typeof FAQS }) {
  return (
    <ul className="space-y-2">
      {items.map(({ q, a }) => (
        <li key={q}>
          <details
            // All of them share one group name across both columns, so only
            // one answer is ever open on the whole section.
            name="faq"
            className="faq-item border-b border-white/10"
          >
            <summary className="font-sans flex cursor-pointer list-none items-center justify-between gap-6 py-4 text-left text-[14px] leading-[1.4] font-medium tracking-[0.02em] text-white transition-colors hover:text-white/75 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:text-[15px]">
              {q}
              <Chevron />
            </summary>
            <div className="font-sans text-text-muted pt-1 pb-5 text-[13px] leading-[1.7] tracking-[0.02em]">
              {a}
            </div>
          </details>
        </li>
      ))}
    </ul>
  );
}

/** Rotates to point down when its `<details>` is open; see globals.css. */
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
      className="faq-chevron text-accent-soft shrink-0"
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

function FaqLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  const external = href.startsWith("http");
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer" : undefined}
      className="focus-visible:outline-accent-magenta text-white underline underline-offset-2 transition-opacity hover:opacity-75 focus-visible:outline-2 focus-visible:outline-offset-4"
    >
      {children}
    </a>
  );
}
