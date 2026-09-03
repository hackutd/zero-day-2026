import Image from "next/image";

import portrait from "@/public/keynote-placeholder.jpg";

/**
 * The keynote speaker, one card: the portrait and the copy inside a single
 * chamfered frame rather than a picture with text beside it.
 *
 * The split stays what it looks like - picture left, copy right, 40/60 - but
 * the two halves share one border and one ground, so the section reads as one
 * object on the page instead of two that happen to line up. The picture bleeds
 * to the card's own edge on its side; the copy gets the padding.
 *
 * TODO(design): every asset here is a placeholder, the portrait included. It
 * is a still from the same era the site's art is drawn from, standing in until
 * design supplies the real one; swapping it is one import. Nothing on the page
 * says it is a placeholder, so it is the name beside it - "To be announced" -
 * that has to keep carrying that.
 *
 * TODO(organizers): the copy is placeholder too, and deliberately does not name
 * anybody. Last year's entry is the shape to fill:
 *
 *   Sonny Li - Founder & Chief Vibes Officer
 *   "Sonny is the founder of Codédex, a new gamified learning platform
 *   empowering 1M+ learners to lvl up their tech skills. Previously, he spent
 *   five years leading the curriculum team at Codecademy and taught CS at
 *   Columbia, NYU, and CUNY."
 *
 * So: a name, then two or three sentences of what they have built and where
 * they have been. There is no separate role line - it was cut, and the role
 * belongs in the first clause of the bio the way last year's reads. The
 * placeholder below is written to that length, so the layout it produces is
 * the layout the real one will get.
 */

/** The same chamfer as the buttons and the countdown cells, at card size. */
const NOTCH =
  "polygon(24px 0, 100% 0, 100% calc(100% - 24px), calc(100% - 24px) 100%, 0 100%, 0 24px)";

export function KeynoteSpeaker() {
  return (
    <section
      id="keynote"
      aria-labelledby="keynote-heading"
      // A screenful, like the countdown above it: at least the viewport tall
      // and centred in it, so the speaker is the whole view rather than a band
      // of text between two others.
      className="bg-background flex min-h-svh flex-col justify-center px-5 py-16 sm:px-6"
    >
      {/*
        The hairline is a clipped parent showing through 1px around a clipped
        child, the same trick the countdown cells and the marquee cards use:
        `clip-path` crops a border away, so the border has to be a layer.
      */}
      <div
        style={{ clipPath: NOTCH }}
        className="mx-auto w-full max-w-[1200px] bg-white/12 p-px"
      >
        <div
          style={{ clipPath: NOTCH }}
          className="grid items-stretch bg-[#0b0910] sm:grid-cols-[minmax(0,40%)_1fr]"
        >
          {/*
            Two layers over the picture's half: the still, and a scrim that
            sits it back into the card rather than letting a lit frame punch
            out of a black section. It has its own aspect on a phone, where it
            stacks above the copy; from `sm` it is a grid cell that stretches
            to whatever height the copy sets, and `fill` follows.
          */}
          <div className="relative aspect-4/5 overflow-hidden sm:aspect-auto sm:min-h-[420px]">
            <Image
              src={portrait}
              alt=""
              fill
              sizes="(max-width: 639px) 100vw, 40vw"
              placeholder="blur"
              className="object-cover"
            />
            <div aria-hidden className="absolute inset-0 bg-[#05030a]/62" />
          </div>

          <div className="flex flex-col justify-center p-7 sm:p-12">
            <p className="font-sans text-accent-soft text-[12px] tracking-[0.18em] uppercase sm:text-[14px]">
              Keynote speaker
            </p>

            {/*
              Hypik for the name, which is letters-only - fine for "to be
              announced", and worth checking against the real name when it
              lands, since a digit or an ampersand in it would silently fall
              back mid-word.
            */}
            <h2
              id="keynote-heading"
              className="font-hypik mt-4 leading-none tracking-[-0.02em] text-white uppercase"
              style={{ fontSize: "clamp(2rem, 5vw, 4rem)" }}
            >
              To be announced
            </h2>

            <p className="font-sans text-text-muted mt-6 text-[15px] leading-[1.75] sm:text-[17px]">
              This is where the keynote&rsquo;s bio goes: who they are, what
              they have built, and why a room of hackers should want to hear it
              at eleven in the morning. Two or three sentences, the length of
              this one, is the shape the section is laid out for.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
