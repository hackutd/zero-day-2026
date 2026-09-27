import {
  JUDGE_INTEREST_URL,
  MENTOR_INTEREST_URL,
  VOLUNTEER_INTEREST_URL,
} from "@/lib/links";

/**
 * The three ways into the weekend that are not hacking: mentor, judge,
 * volunteer. Each is a Typeform interest form, run by the organizing team.
 *
 * It sits between the sponsors and the FAQ. Mentors and judges mostly come
 * from the companies on the wall above, and the FAQ below is where anyone
 * asking "can I help without competing?" would otherwise end up.
 *
 * The heading picks the opening line back up - "the city needs you" - which is
 * what the skyline said before the reader knew what for. Here it gets its
 * answer, so the three cards are set as recruitment posts: a numbered posting,
 * an "open" light, the role in the display face and the form as the action.
 *
 * The cards borrow the social marquee's chamfer and glass-on-hover, in px
 * rather than the marquee's percentages because these are not square - a
 * percentage cut would come out at a different angle on every breakpoint.
 * Violet and near-black alternate, as they do there.
 */
type Post = {
  role: string;
  brief: string;
  href: string;
  tone: "violet" | "ink";
};

const POSTS: Post[] = [
  {
    role: "Mentor",
    brief:
      "Walk the floor and help teams get unstuck: debugging, design calls, and a second opinion when it counts.",
    href: MENTOR_INTEREST_URL,
    tone: "violet",
  },
  {
    role: "Judge",
    brief:
      "See the finished builds before anyone else and help decide which projects take home the prizes.",
    href: JUDGE_INTEREST_URL,
    tone: "ink",
  },
  {
    role: "Volunteer",
    brief:
      "Keep the city running: check-in, meals, workshops, and everything in between over the weekend.",
    href: VOLUNTEER_INTEREST_URL,
    tone: "violet",
  },
];

const CHAMFER =
  "polygon(0 0, calc(100% - 40px) 0, 100% 40px, 100% 100%, 0 100%)";

export function GetInvolved() {
  return (
    <section
      id="get-involved"
      aria-labelledby="get-involved-heading"
      className="bg-background px-5 py-20 sm:px-6 sm:py-28"
    >
      <div className="mx-auto max-w-[1100px]">
        <p className="reveal font-sans text-accent-soft text-center text-[11px] tracking-[0.18em] uppercase sm:text-[12px]">
          Now recruiting
        </p>

        {/*
          Hypik is letters only, so the line drops the ellipsis the skyline
          draws with its fallback face. It reads as a heading without it.
        */}
        <h2
          id="get-involved-heading"
          className="reveal reveal-1 font-hypik mt-4 text-center leading-none tracking-[-0.02em] text-white uppercase"
          style={{ fontSize: "clamp(2.25rem, 7vw, 4.5rem)" }}
        >
          The city needs you
        </h2>

        <p className="reveal reveal-2 font-sans text-text-muted mx-auto mt-5 max-w-xl text-center text-[13px] leading-[1.6] tracking-[0.04em]">
          Not building this year? Zero Day still runs on the people behind it.
          Pick a post and the team will be in touch.
        </p>

        <ul className="mt-14 grid gap-4 md:grid-cols-3 md:gap-5">
          {POSTS.map((post, i) => (
            <li key={post.role} className={`reveal reveal-${i + 1}`}>
              <PostCard index={i + 1} {...post} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function PostCard({
  index,
  role,
  brief,
  href,
  tone,
}: Post & { index: number }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="crew-card relative block h-full p-px"
      style={{ clipPath: CHAMFER }}
    >
      <span
        className="relative flex h-full min-h-[300px] flex-col p-6 sm:min-h-[340px] sm:p-7"
        style={{ clipPath: CHAMFER }}
      >
        {/* Its own layer, so hover can fade it without dimming the copy. */}
        <span
          aria-hidden
          className="crew-card__fill"
          style={{
            backgroundImage:
              tone === "violet"
                ? "linear-gradient(145deg, #7c34d8 0%, #4a1a8c 48%, #2a0e52 100%)"
                : "linear-gradient(145deg, #1c1826 0%, #121019 55%, #0b0910 100%)",
          }}
        />

        <span className="relative flex items-center justify-between">
          {/* Elevon, not Hypik: the number needs digits. */}
          <span className="font-elevon text-accent-soft text-[11px] font-bold tracking-[0.18em] uppercase">
            Post {String(index).padStart(2, "0")}
          </span>
          <span className="font-sans flex items-center gap-2 text-[10px] tracking-[0.16em] text-white/70 uppercase">
            <span aria-hidden className="crew-card__light text-cyan" />
            Open
          </span>
        </span>

        <span
          className="font-hypik relative mt-9 block leading-none tracking-[-0.02em] text-white uppercase"
          style={{ fontSize: "clamp(2rem, 3.2vw, 2.75rem)" }}
        >
          {role}
        </span>

        <span className="font-sans relative mt-4 block max-w-[30ch] text-[13px] leading-[1.7] tracking-[0.02em] text-white/72 sm:text-[14px]">
          {brief}
        </span>

        <span className="font-sans relative mt-auto flex items-center gap-2 pt-8 text-[12px] leading-none font-medium tracking-[0.1em] text-white uppercase">
          Interest form
          <Arrow />
        </span>

        {/* The same run of diagonal ticks the social cards carry. */}
        <span
          aria-hidden
          className="absolute right-6 bottom-7 h-10 w-6 opacity-45 sm:right-7"
          style={{
            backgroundImage:
              "repeating-linear-gradient(-60deg, rgba(255,255,255,0.75) 0 1px, transparent 1px 6px)",
          }}
        />
      </span>
    </a>
  );
}

function Arrow() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="14"
      height="14"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="square"
      className="crew-card__arrow text-accent-soft"
      aria-hidden
    >
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}
