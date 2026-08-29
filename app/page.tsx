import Image, { type StaticImageData } from "next/image";

import { PreheroIntro } from "@/components/prehero-intro";
import { SiteFooter } from "@/components/site-footer";
import zeroDay from "@/public/zero_day.png";
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
    overlay: <HeroOverlays />,
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
      <PinnedPrehero {...scenes[0]} />
      {scenes.slice(1).map((scene) => (
        <Scene key={scene.src.src} {...scene} first={false} />
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

/**
 * How many viewport heights the opening scene is pinned for. The sticky panel
 * eats the first 100svh, so the intro plays out over the remainder — at 280
 * that is 1.8 screens of scrolling spent on the city before the page moves on.
 */
const PREHERO_TRACK_VH = 280;

/**
 * The opening scene, pinned.
 *
 * The tall outer section is pure scroll distance; the panel inside sticks to
 * the top of the viewport and stays there for all of it. So the city holds
 * still and you scroll *through* the intro animation rather than scrolling the
 * city out from under it. When the track runs out the sticky releases and the
 * page carries on normally.
 *
 * Unlike the other panels this one fills the viewport rather than holding 16:9
 * — a pinned scene that letterboxed would look broken. It still needs a frame,
 * though: the building ads are pinned to specific windows, so `.prehero-frame`
 * tracks where the artwork actually lands and the ads sit inside it in
 * percentages of the art. The intro text is deliberately outside that frame,
 * because it should centre on the viewport rather than on the city.
 *
 * The id sits on the track rather than the panel, so the navbar — which waits
 * for this element to scroll past — appears once the pinned sequence is done.
 *
 * It takes no `focus`: `.prehero-frame` centres the art, which is what this
 * scene's focus was set to anyway.
 */
/**
 * Screens playing on the sides of two buildings in the skyline.
 *
 * Every figure is a fraction of the artwork's own 1920x1089, measured off the
 * plate rather than eyeballed, so they stay on their buildings at any viewport.
 * Unlike the hero billboard these need no shear: this building's window grid is
 * drawn perfectly axis-aligned, so the screens are plain rectangles.
 *
 * `aspect` is the source clip's own ratio, which fixes each screen's height
 * from its width and guarantees the footage is never stretched.
 */
const BUILDING_ADS = [
  {
    // The tower left of centre with the dense white-and-black window grid.
    src: "/ads/ad-gif1.mp4",
    label: "Advertisement screen on a city building",
    left: "30.99%",
    top: "37.19%",
    width: "8.33%",
    aspect: "800 / 600",
  },
  {
    // High on the dark tower in the top-left corner.
    src: "/ads/ad-reboot.mp4",
    label: "Reboot advertisement screen on a city building",
    left: "2.86%",
    top: "18.83%",
    width: "7.55%",
    aspect: "600 / 338",
  },
] as const;

function BuildingAd({
  src,
  label,
  left,
  top,
  width,
  aspect,
  skewDeg = 0,
}: {
  src: string;
  label: string;
  left: string;
  top: string;
  width: string;
  aspect: string;
  skewDeg?: number;
}) {
  return (
    <div
      className="absolute overflow-hidden"
      style={{
        left,
        top,
        width,
        aspectRatio: aspect,
        // Screens on a receding plane are sheared onto it, as the billboard is.
        transform: skewDeg ? `skewY(${skewDeg}deg)` : undefined,
        transformOrigin: "center",
        // Sells it as a lit panel rather than a sticker on the facade.
        boxShadow: "0 0 1.2vw rgba(150, 90, 255, 0.45)",
      }}
    >
      {/*
        Muted autoplay is allowed everywhere — unlike the soundtrack, this needs
        no gesture. `playsInline` stops iOS taking it fullscreen. Shipped as MP4
        only: H.264 plays in every current browser, and VP9 came out larger for
        the longer clip, so a second format would be weight for nothing.
      */}
      <video
        aria-label={label}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        className="h-full w-full object-cover"
      >
        <source src={src} type="video/mp4" />
      </video>
    </div>
  );
}

function PinnedPrehero({ src, alt }: { src: StaticImageData; alt: string }) {
  return (
    <section
      id="scene-prehero"
      className="relative"
      style={{ height: `${PREHERO_TRACK_VH}svh` }}
    >
      <div className="sticky top-0 h-svh w-full overflow-hidden">
        <div className="prehero-frame">
          <Image
            src={src}
            alt={alt}
            fill
            sizes="100vw"
            placeholder="blur"
            preload
            className="object-cover"
          />
          {BUILDING_ADS.map((ad) => (
            <BuildingAd key={ad.src} {...ad} />
          ))}
        </div>
        <PreheroIntro />
      </div>
    </section>
  );
}

/**
 * Everything laid over the hero plate: the billboard wordmark, and a screen on
 * the hexagon wall below it.
 */
function HeroOverlays() {
  return (
    <>
      <BillboardWordmark />
      <BuildingAd
        src="/ads/ad-gif4.mp4"
        label="Screen on a building down the alley"
        // The orange-windowed slab down the alley. Its facade runs y 500-650 of
        // the plate, split by cable bundles at 540-560 and 655; this sits in
        // the clean gap between them, x 1185-1266 by y 605-648. No shear: the
        // window rows there are drawn horizontal despite the recession.
        left="61.72%"
        top="55.97%"
        width="4.22%"
        aspect="800 / 423"
      />
      <BuildingAd
        src="/ads/ad-gif3.mp4"
        label="Screen on the wall below the billboard"
        // The wall runs from x 635 to 795 of the 1920 plate here, sitting just
        // under its top edge, which the shear below matches.
        left="33.07%"
        top="87.37%"
        width="8.33%"
        aspect="1440 / 1000"
        // The wall is a plane receding to the right: its top edge was measured
        // off the plate at 17.24deg, so the screen is sheared onto it rather
        // than pasted flat, exactly as the billboard is.
        skewDeg={17.24}
      />
    </>
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
