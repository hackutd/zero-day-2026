import {
  JUDGE_INTEREST_URL,
  MENTOR_INTEREST_URL,
  VOLUNTEER_INTEREST_URL,
} from "@/lib/links";

/**
 * The three ways into the weekend that are not hacking: mentor, judge,
 * volunteer. Each is a Typeform interest form, run by the organizing team.
 *
 * Rendered in the footer directly under the Register button, so the one
 * place that says "registration is open" also answers "and if I'm not
 * competing?" without sending the reader anywhere else.
 *
 * The three cards are set as recruitment posts: a numbered posting, an "open"
 * light, the role in the display face and the form as the action. They borrow
 * the social marquee's chamfer and glass-on-hover, in px rather than the
 * marquee's percentages because these are not square - a percentage cut would
 * come out at a different angle on every breakpoint. Violet and near-black
 * alternate, as they do there.
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

export function CrewPosts() {
  return (
    <div id="get-involved" className="mt-16 sm:mt-20">
      <p className="font-sans text-text-muted text-center text-[12px] leading-[1.55] tracking-[0.1em] uppercase">
        Not hacking? The city still needs you
      </p>

      <ul className="mt-8 grid gap-4 md:grid-cols-3 md:gap-5">
        {POSTS.map((post, i) => (
          <li key={post.role} className={`reveal reveal-${i + 1}`}>
            <PostCard index={i + 1} {...post} />
          </li>
        ))}
      </ul>
    </div>
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
        className="relative flex h-full min-h-[260px] flex-col p-6 sm:min-h-[300px] sm:p-7"
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
          style={{ fontSize: "clamp(1.75rem, 2.8vw, 2.5rem)" }}
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
