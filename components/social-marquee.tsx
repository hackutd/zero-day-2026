/**
 * A marquee of social cards, from the reference on diamante.io.
 *
 * The card shape is this site's existing notch motif turned into a chamfer: a
 * sharp polygon with the top-right corner cut. Percentages rather than pixels,
 * so the cut stays proportional as the card resizes between breakpoints. As
 * elsewhere, `clip-path` crops a border away, so the hairline is a clipped
 * parent showing through 1px around a clipped child.
 *
 * The track holds two identical halves and slides exactly -50%, which is what
 * makes the loop seamless: at the halfway point the second half sits precisely
 * where the first began.
 *
 * Each half must be at least as wide as the viewport, or the loop tears. One
 * set of five is ~1280px, so on a 1440px screen the incoming half ran out
 * before it reached the right edge and left a gap after the last card until the
 * cycle restarted. Each half therefore repeats the set REPEATS times; -50%
 * still lands exactly on the boundary because the halves stay identical.
 *
 * Only the first set carries real links. Every repeat is hidden from assistive
 * tech and taken out of the tab order, so the same five destinations are not
 * announced or tabbed through REPEATS*2 times.
 *
 * The strip pauses on hover so a card can be read and clicked rather than
 * chased.
 */

const CHAMFER = "polygon(0 0, 78% 0, 100% 22%, 100% 100%, 0 100%)";

/**
 * Sets per half. Five cards run ~1280px, so three carries a half past 3800px
 * and covers ultrawide displays without the tear returning.
 */
const REPEATS = 3;

type Social = {
  name: string;
  href: string;
  icon: React.ReactNode;
  /** Violet and near-black alternate down the row, as in the reference. */
  tone: "violet" | "ink";
};

const SOCIALS: Social[] = [
  { name: "LinkedIn", href: "#", tone: "violet", icon: <LinkedInMark /> },
  { name: "Medium", href: "#", tone: "ink", icon: <MediumMark /> },
  { name: "Instagram", href: "#", tone: "violet", icon: <InstagramMark /> },
  { name: "Discord", href: "#", tone: "ink", icon: <DiscordMark /> },
  { name: "YouTube", href: "#", tone: "violet", icon: <YouTubeMark /> },
];

export function SocialMarquee() {
  return (
    <section
      aria-label="Follow HackUTD"
      className="bg-background py-14 sm:py-20"
    >
      <div className="social-marquee">
        <div className="social-marquee__track">
          <Half announce />
          <Half />
        </div>
      </div>
      <MetalGradientDef />
    </section>
  );
}

function Half({ announce = false }: { announce?: boolean }) {
  return (
    <>
      {Array.from({ length: REPEATS }, (_, set) => {
        // Exactly one set on the whole track is the real, reachable one.
        const real = announce && set === 0;
        return (
          <ul
            key={set}
            aria-hidden={real ? undefined : true}
            className="flex shrink-0 items-center gap-5 pr-5 sm:gap-7 sm:pr-7"
          >
            {SOCIALS.map((s) => (
              <li key={s.name}>
                <Card {...s} inert={!real} />
              </li>
            ))}
          </ul>
        );
      })}
    </>
  );
}

function Card({ name, href, icon, tone, inert }: Social & { inert: boolean }) {
  return (
    <a
      href={href}
      tabIndex={inert ? -1 : undefined}
      className="social-card relative block size-[184px] p-px sm:size-[228px]"
      style={{ clipPath: CHAMFER }}
    >
      <span
        className="relative flex h-full w-full flex-col justify-between p-5 sm:p-6"
        style={{ clipPath: CHAMFER }}
      >
        {/*
          The fill sits on its own layer so hover can fade it to glass without
          taking the mark and the label down with it.
        */}
        <span
          aria-hidden
          className="social-card__fill"
          style={{
            backgroundImage:
              tone === "violet"
                ? "linear-gradient(145deg, #7c34d8 0%, #4a1a8c 48%, #2a0e52 100%)"
                : "linear-gradient(145deg, #1c1826 0%, #121019 55%, #0b0910 100%)",
          }}
        />

        <span className="relative flex flex-1 items-center justify-center">
          {icon}
        </span>

        <span className="font-sans relative text-[13px] leading-none tracking-[0.14em] text-white uppercase sm:text-[15px]">
          {name}
        </span>

        {/* The short run of diagonal ticks in the reference's lower corner. */}
        <span
          aria-hidden
          className="absolute right-5 bottom-14 h-10 w-6 opacity-45 sm:right-6 sm:bottom-16"
          style={{
            backgroundImage:
              "repeating-linear-gradient(-60deg, rgba(255,255,255,0.75) 0 1px, transparent 1px 6px)",
          }}
        />
      </span>
    </a>
  );
}

/**
 * One shared gradient for every mark, so the icons read as brushed metal like
 * the reference rather than flat white. Defined once, referenced by id.
 */
function MetalGradientDef() {
  return (
    <svg aria-hidden width="0" height="0" className="absolute">
      <defs>
        <linearGradient id="zd-metal" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="55%" stopColor="#e6e2ef" />
          <stop offset="100%" stopColor="#9d97ad" />
        </linearGradient>
      </defs>
    </svg>
  );
}

const MARK =
  "h-[64px] w-[64px] drop-shadow-[0_2px_6px_rgba(0,0,0,0.45)] sm:h-[82px] sm:w-[82px]";
const FILL = { fill: "url(#zd-metal)" };

function LinkedInMark() {
  return (
    <svg viewBox="0 0 24 24" className={MARK} aria-hidden>
      <path
        style={FILL}
        d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05a3.74 3.74 0 0 1 3.37-1.85c3.6 0 4.27 2.37 4.27 5.46zM5.34 7.43a2.07 2.07 0 1 1 0-4.13 2.07 2.07 0 0 1 0 4.13zm1.78 13.02H3.55V9h3.57zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0z"
      />
    </svg>
  );
}

function MediumMark() {
  return (
    <svg viewBox="0 0 24 24" className={MARK} aria-hidden>
      <path
        style={FILL}
        d="M13.54 12a6.77 6.77 0 1 1-13.54 0 6.77 6.77 0 0 1 13.54 0zm7.42 0c0 3.54-1.51 6.42-3.38 6.42s-3.39-2.88-3.39-6.42 1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42zM24 12c0 3.17-.53 5.75-1.19 5.75s-1.19-2.58-1.19-5.75.53-5.75 1.19-5.75S24 8.83 24 12z"
      />
    </svg>
  );
}

function InstagramMark() {
  return (
    <svg viewBox="0 0 24 24" className={MARK} aria-hidden>
      <path
        style={FILL}
        d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9s.68.82.9 1.38c.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38s-.82.68-1.38.9c-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.7 3.7 0 0 1-1.38-.9 3.7 3.7 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38s.82-.68 1.38-.9c.42-.16 1.06-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16M12 0C8.74 0 8.33.01 7.05.07c-1.28.06-2.15.26-2.91.56a5.9 5.9 0 0 0-2.13 1.38A5.9 5.9 0 0 0 .63 4.14c-.3.76-.5 1.63-.56 2.91C.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.06 1.28.26 2.15.56 2.91a5.9 5.9 0 0 0 1.38 2.13 5.9 5.9 0 0 0 2.13 1.38c.76.3 1.63.5 2.91.56C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c1.28-.06 2.15-.26 2.91-.56a6.1 6.1 0 0 0 3.51-3.51c.3-.76.5-1.63.56-2.91.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.06-1.28-.26-2.15-.56-2.91a5.9 5.9 0 0 0-1.38-2.13A5.9 5.9 0 0 0 19.86.63c-.76-.3-1.63-.5-2.91-.56C15.67.01 15.26 0 12 0zm0 5.84a6.16 6.16 0 1 0 0 12.32 6.16 6.16 0 0 0 0-12.32zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm7.85-10.41a1.44 1.44 0 1 1-2.88 0 1.44 1.44 0 0 1 2.88 0z"
      />
    </svg>
  );
}

function DiscordMark() {
  return (
    <svg viewBox="0 0 24 24" className={MARK} aria-hidden>
      <path
        style={FILL}
        d="M20.32 4.37a19.8 19.8 0 0 0-4.89-1.51.07.07 0 0 0-.7.03c-.22.38-.45.87-.61 1.25a18.3 18.3 0 0 0-5.49 0c-.16-.39-.4-.87-.62-1.25a.08.08 0 0 0-.08-.03 19.7 19.7 0 0 0-4.88 1.51.07.07 0 0 0-.4.03C.53 9.05-.32 13.58.1 18.06a.08.08 0 0 0 .3.06 19.9 19.9 0 0 0 6 3.03.08.08 0 0 0 .08-.03c.46-.63.87-1.3 1.23-1.99a.08.08 0 0 0-.05-.11 13.1 13.1 0 0 1-1.87-.89.08.08 0 0 1 0-.13l.37-.29a.07.07 0 0 1 .08-.01c3.93 1.79 8.18 1.79 12.06 0a.07.07 0 0 1 .8.01l.37.29a.08.08 0 0 1 0 .13c-.6.36-1.22.66-1.87.89a.08.08 0 0 0-.5.11c.37.7.78 1.36 1.23 1.99a.08.08 0 0 0 .8.03 19.8 19.8 0 0 0 6-3.03.08.08 0 0 0 .04-.05c.5-5.18-.84-9.68-3.55-13.66a.06.06 0 0 0-.03-.03zM8.02 15.33c-1.18 0-2.16-1.09-2.16-2.42s.96-2.42 2.16-2.42c1.21 0 2.18 1.1 2.16 2.42 0 1.33-.96 2.42-2.16 2.42zm7.97 0c-1.18 0-2.16-1.09-2.16-2.42s.96-2.42 2.16-2.42c1.21 0 2.18 1.1 2.16 2.42 0 1.33-.95 2.42-2.16 2.42z"
      />
    </svg>
  );
}

function YouTubeMark() {
  return (
    <svg viewBox="0 0 24 24" className={MARK} aria-hidden>
      <path
        style={FILL}
        d="M23.5 6.19a3.02 3.02 0 0 0-2.12-2.14C19.5 3.55 12 3.55 12 3.55s-7.5 0-9.38.5A3.02 3.02 0 0 0 .5 6.19C0 8.07 0 12 0 12s0 3.93.5 5.81a3.02 3.02 0 0 0 2.12 2.14c1.88.5 9.38.5 9.38.5s7.5 0 9.38-.5a3.02 3.02 0 0 0 2.12-2.14C24 15.93 24 12 24 12s0-3.93-.5-5.81zM9.55 15.57V8.43L15.82 12z"
      />
    </svg>
  );
}
