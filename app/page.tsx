import Image, { type StaticImageData } from "next/image";

import prehero from "@/public/backgrounds/01-prehero.png";
import hero from "@/public/backgrounds/02-hero.png";
import street from "@/public/backgrounds/03-street.png";

/**
 * The opening scenes of the site, stacked in reading order.
 *
 * The art is one continuous descent — skyline, then down between the towers,
 * then street level — so the panels butt against each other with no gap or
 * divider.
 *
 * `focus` is the horizontal point a narrow screen crops around; see `Scene` for
 * why it matters and why it does nothing on a wide one. Two rules set these:
 *
 *  - The hero's billboard carries the logo, so the crop centers on the sign
 *    rather than on the frame: 25.31% is where the sign's own middle sits.
 *  - The hero and the street below it share an edge — the same hexagon wall
 *    runs off the bottom of one and into the top of the other — so they must
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
    overlay: <BillboardLogo />,
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
    </main>
  );
}

/**
 * The HackUTD wordmark, sitting on the hero's blank billboard.
 *
 * Every number here was measured off `02-hero.png` rather than eyeballed. The
 * sign is not a rotated rectangle — its left and right edges are vertical while
 * the top and bottom slope down to the right (~6.0 deg and ~7.5 deg). That is a
 * vertical shear, so `skewY` is what makes the logo sit *on* the sign; a
 * `rotate` would tilt the letters' upright strokes away from the sign's own
 * vertical edges and read as a sticker laid on top.
 *
 * The sign spans x 9-963 and its midline runs through (486, 422) of the
 * 1920x1081 frame, which is where the percentages below come from. The logo
 * takes 62% of the sign's width, leaving margin on all four sides at the
 * shallow end of the shear.
 */
const SIGN_SHEAR_DEG = 6.72;

function BillboardLogo() {
  return (
    <div
      className="absolute"
      style={{
        // Centred on the sign's midpoint: 25.31% across, 39.02% down.
        left: "9.9%",
        top: "31.2%",
        width: "30.8%",
        // 2048x585 artwork, so height follows from width; expressed against the
        // frame's own 16:9 so it stays locked to the sign at every size.
        aspectRatio: "2048 / 585",
        transform: `skewY(${SIGN_SHEAR_DEG}deg)`,
        transformOrigin: "center",
      }}
    >
      {/*
        A plain <img>, as in components/sponsor-logo.tsx: the file is an SVG, so
        there is nothing for the image optimizer to resize or re-encode.
      */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/white-hackutd-logo.svg"
        alt="HackUTD"
        className="h-full w-full object-contain"
      />
    </div>
  );
}

/**
 * One full-bleed 16:9 panel.
 *
 * Sizing is the whole mobile story. From `sm` up the panel takes the art's own
 * 16:9 ratio, so wide screens see the entire frame uncropped. A portrait phone
 * can't have both — filling the width would leave a ~220px letterbox strip, and
 * filling the height would crop away two thirds of the frame — so the panel
 * takes a fixed slice of the viewport and the art covers it. 62svh is the
 * compromise: tall enough to read as a scene, shallow enough that the crop
 * keeps roughly the middle half of each frame.
 *
 * `svh`, not `vh`, so the panel doesn't resize as mobile browser chrome hides.
 *
 * The inner frame is what makes an overlay possible. Cropping with
 * `object-position` would move the art but leave anything positioned over it
 * behind, so instead the frame is itself a 16:9 box scaled to cover the panel,
 * and the art and its overlay are positioned inside it in percentages. They
 * then crop as one piece: the logo stays welded to the billboard on a phone.
 *
 * `--focus` names the point in the art that a narrow screen centres on; the
 * `.scene-frame` rule in globals.css does the arithmetic and explains it.
 */
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
          // default. `preload`, not `priority` — the latter is deprecated as of
          // Next 16.
          preload={first}
          className="object-cover"
        />
        {overlay}
      </div>
    </div>
  );
}
