import Image, { type StaticImageData } from "next/image";

import { SiteFooter } from "@/components/site-footer";
import zeroDay from "@/public/zero_day.png";
import prehero from "@/public/backgrounds/01-prehero.png";
import hero from "@/public/backgrounds/02-hero.png";
import street from "@/public/backgrounds/03-street.png";

/**
 * The opening scenes of the site, stacked in reading order.
 *
 * The art is one continuous descent â€” skyline, then down between the towers,
 * then street level â€” so the panels butt against each other with no gap or
 * divider.
 *
 * `focus` is the horizontal point a narrow screen crops around; see `Scene` for
 * why it matters and why it does nothing on a wide one. Two rules set these:
 *
 *  - The hero's billboard carries the logo, so the crop centers on the sign
 *    rather than on the frame: 25.31% is where the sign's own middle sits.
 *  - The hero and the street below it share an edge â€” the same hexagon wall
 *    runs off the bottom of one and into the top of the other â€” so they must
 *    crop around the *same* point or the seam visibly slips. The street panel
 *    is 25% because the hero is, not on its own merits.
 *
 * The skyline is a standalone frame, so it keeps the moon centered.
 */
const scenes: {
  src: StaticImageData;
  alt: string;
  focus: number;
  overlay?: React.ReactNode;
}[] = [
  {
    src: prehero,
    alt: "Neon city skyline at night under a full moon, an MMXXVI tower lit at the left.",
    focus: 50,
  },
  {
    src: hero,
    alt: "A blank glowing billboard on a wall between skyscrapers, strung with cables.",
    focus: 25.31,
    overlay: <BillboardWordmark />,
  },
  {
    src: street,
    alt: "Silhouetted figures on a rain-slicked street lined with red neon.",
    focus: 25.31,
  },
];

export default function Home() {
  return (
    <main>
      {scenes.map((scene, i) => (
        <Scene key={scene.src.src} {...scene} first={i === 0} />
      ))}
      <SiteFooter />
    </main>
  );
}

/**
 * The "HackUTD's Zero Day" wordmark, sitting on the hero's blank billboard.
 *
 * Every number here was measured off `02-hero.png` rather than eyeballed. The
 * sign is not a rotated rectangle — its left and right edges are vertical while
 * the top and bottom slope down to the right (~6.0 deg and ~7.5 deg). That is a
 * vertical shear, so `skewY` is what makes the art sit *on* the sign; a
 * `rotate` would tilt the upright strokes away from the sign's own vertical
 * edges and read as a sticker laid on top.
 *
 * The sign spans x 9-963 and its midline runs through (486, 422) of the
 * 1920x1081 frame. The wordmark takes 82% of the sign's width, which leaves an
 * even ~86px of sign on either side of the ink at the frame's native scale.
 *
 * The offsets look crooked because they are correcting for the artwork's own
 * padding. `zero_day.png` is 781x307 but its ink only occupies 774x228, with 51
 * transparent pixels above it and 28 below — so centring the *image box* on the
 * sign would hang the visible wordmark low. These percentages centre the ink
 * instead, which is why they aren't symmetric.
 */
const SIGN_SHEAR_DEG = 6.72;

function BillboardWordmark() {
  return (
    <div
      className="absolute"
      style={{
        left: "4.58%",
        top: "23.60%",
        width: "41.10%",
        // Matches the source exactly, so `object-contain` fits edge to edge.
        aspectRatio: "781 / 307",
        transform: `skewY(${SIGN_SHEAR_DEG}deg)`,
        transformOrigin: "center",
      }}
    >
      <Image
        src={zeroDay}
        alt="HackUTD's Zero Day"
        fill
        sizes="(max-width: 639px) 105vw, 42vw"
        className="object-contain"
      />
    </div>
  );
}

function Scene({
  src,
  alt,
  focus,
  overlay,
  first,
}: {
  src: StaticImageData;
  alt: string;
  focus: number;
  overlay?: React.ReactNode;
  first: boolean;
}) {
  return (
    <div className="relative h-[62svh] min-h-[380px] w-full overflow-hidden sm:aspect-video sm:h-auto sm:min-h-0">
      <div
        className="scene-frame"
        style={{ "--focus": `${focus}%` } as React.CSSProperties}
      >
        <Image
          src={src}
          alt={alt}
          fill
          // Below `sm` the frame is wider than the viewport (it overflows to
          // cover), so 100vw would under-request and soften the art.
          sizes="(max-width: 639px) 250vw, 100vw"
          placeholder="blur"
          // Only the first panel is above the fold; the rest lazy-load by
          // default. `preload`, not `priority` â€” the latter is deprecated as of
          // Next 16.
          preload={first}
          className="object-cover"
        />
        {overlay}
      </div>
    </div>
  );
}
