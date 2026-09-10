import Image, { type StaticImageData } from "next/image";

import { AmbientVideo } from "@/components/ambient-video";
import {
  FaqSection,
  ScheduleSection,
  SponsorsSection,
  TracksSection,
} from "@/components/api-sections";
import { EventBoard } from "@/components/event-board";
import { KeynoteSpeaker } from "@/components/keynote-speaker";
import { PassingTrain } from "@/components/passing-train";
import { PreheroIntro } from "@/components/prehero-intro";
import { RoamingMascots } from "@/components/roaming-mascots";
import { SiteCountdown } from "@/components/site-countdown";
import { SiteFooter } from "@/components/site-footer";
import { SocialMarquee } from "@/components/social-marquee";
import hero from "@/assets/images/backgrounds/02-hero-2x.webp";
import prehero from "@/assets/images/backgrounds/01-prehero-2x.webp";
import street from "@/assets/images/backgrounds/03-street-2x.webp";
import pipes from "@/assets/images/backgrounds/03b-pipes-2x.webp";
import subwayBackground from "@/assets/images/backgrounds/04-subway-background-2x.webp";
import subwayForefront from "@/assets/images/backgrounds/04-subway-forefront-2x.webp";
import zeroDay from "@/assets/images/zero_day.png";

/**
 * The opening scenes of the site, stacked in reading order.
 *
 * The art is one continuous descent - skyline, then down between the towers,
 * then street level, then underground to the platform - so the panels butt
 * against each other with no gap or divider.
 *
 * why it matters and why it does nothing on a wide one. Two rules set these:
 *
 *  - The hero's billboard carries the logo, so the crop centers on the sign
 *    rather than on the frame: 25.31% is where the sign's own middle sits.
 *  - The hero and the street below it share an edge - the same hexagon wall
 *    runs off the bottom of one and into the top of the other - so they must
 *    crop around the *same* point or the seam visibly slips. The street panel
 *    is 25% because the hero is, not on its own merits.
 *
 * The skyline is a standalone frame, so it keeps the moon centered.
 */
const scenes: {
  src: StaticImageData;
  alt: string;
  overlay?: React.ReactNode;
  seams?: React.ReactNode;
  /** Let the scroll settle onto this panel when the reader stops near it. */
  settle?: boolean;
  zoom?: number;
  zoomOrigin?: string;
}[] = [
  {
    src: prehero,
    alt: "Neon city skyline at night under a full moon, an MMXXVI tower lit at the left.",
  },
  {
    src: hero,
    alt: "A blank glowing billboard on a wall between skyscrapers, strung with cables.",
    overlay: <HeroOverlays />,
    settle: true,
  },
  {
    src: street,
    alt: "Silhouetted figures on a rain-slicked street lined with red neon.",
    seams: <StreetSeams />,
  },
  {
    src: subwayBackground,
    alt: "A neon-lit subway platform, a train stopped at it with its doors closed.",
    overlay: <SubwayOverlays />,
    seams: <SubwaySeams />,
    /*
     * Pushed in so the back wall reads. The screen and the stats are wall
     * detail seen across a platform, and at 1:1 the video was a postage stamp
     * and the numbers were near unreadable on a phone. The origin sits between
     * them, at the midpoint of the stats block's centre (24.5%, 28.8%) and the
     * screen's (48.5%, 30.1%), so the zoom grows the wall in place instead of
     * sliding it out of frame.
     */
    zoom: 1.3,
    zoomOrigin: "37% 29%",
  },
];

/** Shared by both halves of the stack, so the two render identically. */
function renderScene(scene: (typeof scenes)[number]) {
  return <Scene key={scene.src.src} {...scene} first={false} />;
}

export default function Home() {
  return (
    <main>
      <PinnedPrehero {...scenes[0]} />
      {/*
        The descent runs unbroken from the skyline down to the platform, then
        stops there. The countdown and the keynote open on the page
        background, which is what the platform above them fades down to, and
        the board below carries the descent's last plate itself - the tunnel is
        its backdrop rather than a panel of its own, so the artwork arrives
        under the content instead of ahead of it.
      */}
      {renderScene(scenes[1])}
      <StreetScene scene={scenes[2]} />
      <PipesBand />
      {scenes.slice(3).map(renderScene)}
      <SiteCountdown />
      <KeynoteSpeaker />
      <EventBoard schedule={<ScheduleSection />} tracks={<TracksSection />} />
      <SponsorsSection />
      <FaqSection />
      <RoamingMascots />
      <SocialMarquee />
      <SiteFooter />
    </main>
  );
}

/**
 * The "HackUTD's Zero Day" wordmark, sitting on the hero's blank billboard.
 *
 * Every number here was measured off `02-hero.png` rather than eyeballed. The
 * sign is not a rotated rectangle - its left and right edges are vertical while
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
 * transparent pixels above it and 28 below - so centring the *image box* on the
 * sign would hang the visible wordmark low. These percentages centre the ink
 * instead, which is why they aren't symmetric.
 */
const SIGN_SHEAR_DEG = 6.72;

function BillboardWordmark() {
  return (
    <div
      className="billboard-sign absolute"
      style={{
        left: "4.58%",
        top: "23.62%",
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
        className="media-fade object-contain"
      />

      {/*
        The displaced slice, the same idea as the platform stats' echo. Only a
        band of it ever shows, and the sign underneath stays legible the whole
        time - see `.sign-echo`. Decoration on top of an image that already
        carries the alt text, so it is hidden from the reading order.
      */}
      <Image
        src={zeroDay}
        alt=""
        aria-hidden
        fill
        sizes="(max-width: 639px) 105vw, 42vw"
        className="sign-echo object-contain"
      />
    </div>
  );
}

/**
 * The application deadline, painted on the billboard under the wordmark.
 *
 * Measured off `02-hero.png` the way the wordmark above it was, because the
 * space this has to live in is bounded on both sides. At the sign's midline the
 * wordmark's *ink* stops at y 537 of the 1920x1080 plate - its box runs on to
 * 565, but 28 of those rows are the artwork's own padding, see
 * BillboardWordmark - and the sign's lit face ends at y 693, its bottom rail
 * running from (40, 655) to (955, 734). That leaves a 156px band.
 *
 * This box takes 135 of it, centred. Being the tighter of the two is the point:
 * it shears at the wordmark's 6.72 deg while the rail only falls at 4.94, so the
 * band narrows as you go right, and a box measured to fit at the midline is
 * what would push through the sign at its right-hand end.
 *
 * Two lines rather than one. The sign is 41% of the frame wide, so as a single
 * line the whole string had to fit that width at every viewport - about 6px of
 * type on a phone. Split, each line is short enough to hold a legible floor, so
 * the deadline still reads where the sign is 160px wide and still grows with the
 * artwork above that.
 *
 * Set in Satoshi, not the Elevon the subway stats use. Elevon is deliberately
 * not preloaded (app/layout.tsx) on the grounds that nothing above the fold is
 * set in it, and the hero is the second panel on the page - the first Elevon
 * glyphs here would put ~40KB back in front of the opening artwork for two
 * lines of type.
 */
const BILLBOARD_DEADLINE_BOX = {
  // Flush with the wordmark's box, so the two centre on the same column and the
  // shear below pivots both about the same x.
  left: "4.58%",
  width: "41.10%",
  top: "50.69%",
  height: "12.50%",
  containerType: "inline-size",
} as const;

function BillboardDeadline() {
  return (
    <div
      className="absolute flex flex-col items-center justify-center text-center"
      style={{
        ...BILLBOARD_DEADLINE_BOX,
        transform: `skewY(${SIGN_SHEAR_DEG}deg)`,
        transformOrigin: "center",
      }}
    >
      {/*
        Dark ink, not neon. This band of the sign is flat #00b8d3, so the deep
        purple reads as something printed on a lightbox and lands about 8:1;
        the wordmark's magenta over the same cyan would be 1.3:1 and vanish.

        Sized in `cqw` against this box rather than `vw`, so the type is a
        fraction of the sign instead of of the window - the sign is a fixed
        share of a panel that holds 16:9 at every width, so anything measured
        against the viewport would drift off it as the panel changed shape. The
        size sits on this element and not on the box above, because `cqw` in a
        property of the container itself resolves against the *next* container
        out - the same trap the subway stats' gap had to avoid.
      */}
      <p
        className="font-sans uppercase"
        style={{ fontSize: "clamp(10px, 3.4cqw, 28px)", lineHeight: 1.25 }}
      >
        <span className="text-surface-deep/75 block font-medium tracking-[0.14em]">
          Priority deadline
        </span>
        {/*
          A <time>, for the same reason the footer's copy of this line carries
          one: the visible text is uppercased by CSS and written for a US
          reader, which neither a parser nor a screen reader should have to
          interpret.
        */}
        <span className="text-surface-deep block font-bold tracking-[0.06em]">
          <time dateTime="2026-10-03">October 3, 2026</time>
        </span>
      </p>
    </div>
  );
}

/**
 * The opening scene, pinned.
 *
 * From `sm` up the outer section is pure scroll distance and the panel inside
 * sticks to the top of the viewport for all of it, so the city holds still and
 * you scroll *through* the intro rather than scrolling the city out from under
 * it. When the track runs out the sticky releases.
 *
 * On a phone it does neither - see `.prehero-track` for why - and the panel
 * just scrolls at the plate's own aspect. The intro reads the geometry rather
 * than a breakpoint, so it follows either arrangement on its own.
 *
 * Unlike the other panels this one fills the viewport rather than holding 16:9
 * - a pinned scene that letterboxed would look broken. It still needs a frame,
 * though: the building ads are pinned to specific windows, so `.prehero-frame`
 * tracks where the artwork actually lands and the ads sit inside it in
 * percentages of the art. The intro text is deliberately outside that frame,
 * because it should centre on the viewport rather than on the city.
 *
 * The id sits on the track rather than the panel, so the navbar - which waits
 * for this element to scroll past - appears once the pinned sequence is done.
 *
 */
/**
 * Screens playing on the sides of two buildings in the skyline.
 *
 * Every figure is a fraction of the artwork's own 1920x1080, measured off the
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
    top: "37.50%",
    width: "8.33%",
    aspect: "800 / 600",
  },
  {
    // High on the dark tower in the top-left corner.
    src: "/ads/ad-reboot.mp4",
    label: "Reboot advertisement screen on a city building",
    left: "2.86%",
    top: "18.99%",
    width: "7.55%",
    aspect: "600 / 338",
  },
  {
    // The wide slab under the MMXXVI clock tower - aligned with the lettered
    // tower and stopping well short of it, its roof a flat edge at y 455 where
    // the tower carries on up past the oval.
    //
    // The lit facade runs x 184-366 of the plate - read off the pixels either
    // side, where the wall drops to the near-black of its own edge. The screen
    // is 124 wide at x 227-351, which is not the geometric centre of that
    // (275) but sits right of it by request: the wall's left end carries a
    // bright column of windows at 184-206 that pulls the eye, so a screen
    // centred on the measurement reads as sitting left of centre. It keeps
    // 35px above it, clear of the roofline. Wider than the tower to its right
    // could ever carry, which is the point: at this size the neon reads as a
    // sign rather than as a lit window.
    src: "/ads/ad-tmobile.mp4",
    label: "T-Mobile advertisement screen on a city building",
    left: "11.82%",
    top: "45.38%",
    width: "6.46%",
    aspect: "480 / 228",
  },
] as const;

function BuildingAd({
  src,
  label,
  left,
  top,
  width,
  aspect,
  fade = 1,
}: {
  src: string;
  label: string;
  left: string;
  top: string;
  width: string;
  aspect: string;
  /**
   * Atmospheric perspective: 1 is full strength, lower sits the screen further
   * back. It dims the panel and softens its glow together, because a distant
   * light source loses its bloom before it loses its shape.
   */
  fade?: number;
}) {
  return (
    <div
      className="absolute overflow-hidden"
      style={{
        left,
        top,
        width,
        aspectRatio: aspect,
        opacity: fade,
        // Sells it as a lit panel rather than a sticker on the facade. The
        // bloom scales with `fade` so a distant screen does not glow like a
        // near one.
        boxShadow: `0 0 ${1.2 * fade}vw rgba(150, 90, 255, ${0.45 * fade})`,
      }}
    >
      {/*
        Shipped as MP4 only: H.264 plays in every current browser, and VP9 came
        out larger for the longer clip, so a second format would be weight for
        nothing. AmbientVideo holds the fetch until the screen is in view and
        pauses it on the way out.
      */}
      <AmbientVideo
        src={src}
        label={label}
        className="h-full w-full object-cover"
      />
    </div>
  );
}

function PinnedPrehero({ src, alt }: { src: StaticImageData; alt: string }) {
  return (
    <section id="scene-prehero" className="prehero-track">
      <div className="prehero-pin">
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
          {/*
            Inside the frame, not the panel: on a phone the frame is the
            letterboxed art, and the pane and headline belong on the picture
            rather than floating over the black around it. On wider screens the
            frame covers the viewport, so this is the same thing either way.
          */}
          <PreheroIntro />
        </div>
        <MlhBadge />
      </div>
    </section>
  );
}

/**
 * The MLH trust badge - MLH's own embed, not a copy.
 *
 * Served from MLH's bucket rather than self-hosted, which is the one case where
 * hotlinking is right: they roll the badge each season and expect the link's
 * campaign parameters intact, so a local copy would silently go stale and stop
 * attributing. It links to mlh.io as they require.
 *
 * Sizing follows their embed's own floor and ceiling. Their snippet sets
 * min-width 60px; the 42px this used before was under that, so it goes back up
 * on phones. 74px on wider screens keeps it inside their 60-100px range while
 * staying the size that already looked right here.
 *
 * Hangs flush to the top edge because the artwork is a ribbon with its own
 * hanger, and sits above the intro layer so the scrim never dims it.
 */
function MlhBadge() {
  return (
    <a
      id="mlh-trust-badge"
      href="https://mlh.io/na?utm_source=na-hackathon&utm_medium=TrustBadge&utm_campaign=2026-season&utm_content=black"
      target="_blank"
      rel="noreferrer"
      className="absolute top-0 right-3 z-40 block w-[60px] sm:right-6 sm:w-[74px]"
    >
      {/*
        A plain img, not next/image: it is an SVG, so there is nothing to resize
        or re-encode and the optimizer would only add a hop.

        Served from public/ rather than from MLH's S3 bucket. The badge sits in
        the prehero, so a remote src put a DNS lookup, a TCP connect and a TLS
        handshake to a third-party origin on the opening critical path for a
        21KB static file. The URL was already season-pinned by hand, so nothing
        auto-updated anyway - when the season rolls over, drop the new file in
        beside this one and change the name here and in next.config.ts.

        The intrinsic size is the artwork's own viewBox (392.79 x 688, rounded).
        It is only there to reserve the box: the width is set in CSS, and
        without a ratio the badge used to land after layout and shift the
        corner it sits in.
      */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/mlh-trust-badge-2027-black.svg"
        alt="Major League Hacking 2027 Hackathon Season"
        width={393}
        height={688}
        className="block h-auto w-full"
      />
    </a>
  );
}

/**
 * Everything laid over the hero plate: the billboard wordmark and the deadline
 * under it, and the screen on the building down the alley.
 */
function HeroOverlays() {
  return (
    <>
      <BillboardWordmark />
      <BillboardDeadline />
      <BuildingAd
        src="/ads/ad-gif4.mp4"
        label="Screen on a building down the alley"
        // The orange-windowed slab down the alley. Its facade runs y 500-650 of
        // the plate, split by cable bundles at 540-560 and 655; this sits in
        // the clean gap between them, centred across the slab's x 1195-1272
        // so it clears the blue building abutting it on the left. Kept small
        // and dimmed: it is the
        // furthest screen in the scene, so it reads as distance rather than as
        // a panel that happens to be tiny. Recentred on the same point as the
        // larger version so it stays in the gap. No shear: the window rows
        // there are drawn horizontal despite the recession.
        left="62.66%"
        top="56.47%"
        width="3.18%"
        aspect="800 / 423"
        fade={0.5}
      />
    </>
  );
}

/**
 * The train stopped at the platform, laid over the platform plate.
 *
 * Two files rather than one because the car's windows are genuinely
 * transparent - a third of `04-subway-forefront.png` is alpha - and the
 * platform wall behind it shows through them. Flattening the pair in the
 * artwork would lose that.
 *
 * Both plates are 1920x1080 and drawn on the same camera, so this sits on the
 * frame with no offset and takes the same `object-cover` crop as the layer
 * under it. They have to stay identical in size and fit: crop one differently
 * and the car slides off its own doorway.
 *
 * `alt=""` because the layer beneath already describes the scene, and a
 * screen reader announcing it twice would just be noise.
 */
function SubwayCar() {
  return (
    <Image
      src={subwayForefront}
      alt=""
      fill
      sizes="100vw"
      quality={65}
      className="media-fade pointer-events-none object-cover"
    />
  );
}

/**
 * Everything on the platform wall, in paint order: the screen, the stats, then
 * the train car over the top of both.
 *
 * The order is the whole trick. Both wall features sit *behind* the glass -
 * measured against `04-subway-forefront.png`, the screen's rectangle and the
 * ring's interior are 100% alpha there, so they read through the windows with
 * the car's mullions framing them. The car is painted last so it occludes
 * correctly, and carries `pointer-events-none` so clicks still reach the video
 * underneath it. Drop that class and the player goes dead behind the glass.
 */
function SubwayOverlays() {
  return (
    <>
      <WallScreen />
      <WallStats />
      {/*
        Between the wall and the carriage, so the train runs behind the window
        openings and over the wall features - it passes in front of the tiles,
        so it should cover the screen and the stats while it is across them.
      */}
      <PassingTrain />
      <SubwayCar />
    </>
  );
}

/**
 * The platform's two seam fades, kept out of the overlay so they are not
 * scaled with it.
 *
 * The ceiling half sits over the car for the same reason the floor half does:
 * the carriage roof runs up into the ceiling band, so fading only the
 * background would leave it lit. The floor half sinks the car and the platform
 * together, since the floor belongs to the forefront plate. See
 * `.subway-floor-fade`.
 *
 * Both are measured against the panel, not the plate, which is exactly why the
 * zoom must not reach them: their black has to land on the panel's own first
 * and last rows to meet the plates above and below.
 */
/**
 * The street's own way down into the pipework.
 *
 * The plate already darkens toward its foot - its last row is 0.73 - but it
 * gets there on the art's schedule, dropping from 41 to 8 over the final
 * stretch and then meeting the pipes' fade, which took it the rest of the way
 * to black in a few pixels. Two ramps of very different slopes meeting is what
 * made the join read as a bar rather than a blend. This carries the street down
 * on the same gentle slope the pipes come back up on, so the pair reads as one
 * long crossing.
 */
/**
 * The street plate, with what the hackathon actually is written on it.
 *
 * Where the copy sits was measured off the plate rather than guessed. Sampled
 * on a 12x12 grid, the left half is the loud half - the lit buildings, the
 * umbrella, the wet reflections, all high mean and high variance - and the road
 * running away up the middle-right is the one large region that is both dark
 * and flat: x 960-1450, y 360-900 of its 1920x1080. That is where this goes,
 * over `.street-scrim`, which has no edge of its own.
 *
 * Below `sm` the copy is not on the picture at all. The panel holds the plate's
 * aspect, so at 390px wide it is 219px tall - there is no room for a paragraph
 * on it at any size worth reading, and shrinking type to fit is how this ends
 * up looking like an interface rather than a page. So it drops into flow
 * underneath instead, on black, and the scrim turns off with it.
 *
 * The wrapper is what the pipes below overlap. On a wide screen the copy is
 * absolutely positioned, so the wrapper is exactly the panel and the overlap is
 * unchanged. On a phone the wrapper grows by the copy's height, and the pipes'
 * 3.59% bite - about 14px there - lands inside this block's bottom padding.
 */
function StreetScene({ scene }: { scene: (typeof scenes)[number] }) {
  return (
    // A landmark, not just artwork: this is the first place the page says what
    // the event actually is, so it gets a name a screen reader can jump to.
    <section id="about" aria-labelledby="about-heading" className="relative">
      <Scene {...scene} first={false} />

      <div className="bg-background sm:pointer-events-none sm:absolute sm:inset-0 sm:bg-transparent">
        <div
          aria-hidden
          className="street-scrim pointer-events-none absolute inset-0 hidden sm:block"
        />

        {/*
          The column sits in the road. `44%` from the left puts its leading edge
          just past the crossing's last figure; the right inset keeps it clear
          of the silhouettes standing at the plate's edge.
        */}
        <div className="relative px-5 pt-10 pb-16 sm:absolute sm:top-1/2 sm:right-[7%] sm:left-[44%] sm:-translate-y-1/2 sm:px-0 sm:pt-0 sm:pb-0">
          <p className="reveal font-sans text-accent-soft text-[11px] tracking-[0.18em] uppercase sm:text-[12px]">
            About the event
          </p>

          {/*
            No question mark: Hypik is letters only, and a `?` would silently
            fall back to another face mid-line. The question reads as a heading
            without it.
          */}
          <h2
            id="about-heading"
            className="reveal reveal-1 font-hypik mt-3 leading-none tracking-[-0.02em] text-white uppercase"
            style={{ fontSize: "clamp(1.75rem, 3.2vw, 3.25rem)" }}
          >
            What is HackUTD
          </h2>

          <p className="reveal reveal-2 font-sans text-text-muted mt-5 max-w-[46ch] text-[14px] leading-[1.8] sm:text-[15px] lg:text-[16px]">
            HackUTD is the largest 24 hour university hackathon in North
            America: a weekend-long event where students build apps, hardware
            and more. It is a venue for self-expression and creativity through
            technology. People with varying technical backgrounds, from
            universities all over the US, come together, form teams around a
            problem or an idea, and build something from scratch. Whether you
            are a frequent hackathon attendee or just getting started, we would
            love to see what you can make.
          </p>
        </div>
      </div>
    </section>
  );
}

function StreetSeams() {
  return <div className="scene-floor-fade scene-floor-fade-street" />;
}

function SubwaySeams() {
  return (
    <>
      <div className="scene-ceiling-fade scene-ceiling-fade-subway" />
      <div className="subway-floor-fade" />
    </>
  );
}

/**
 * The HackUTD channel, playing on the bracketed screen on the back wall.
 *
 * The four corner brackets painted on the tiles mark a real rectangle, so the
 * frame is measured off them rather than eyeballed. The ink runs x 769-1092 by
 * y 225-426 of the 1920x1080 plate, and the strokes are about 7px thick, so the
 * clear space they enclose is x 776-1085 by y 232-419.
 *
 * The player sits *inside* that clear space with a ~5px margin on each side -
 * x 782-1079 by y 237-413 - rather than filling the brackets' outer bounds. At
 * the outer bounds the video covered the corner marks entirely, which read as a
 * misplaced overlay; leaving them showing is what makes the picture read as
 * something mounted on the wall.
 *
 * That is 297x176, a 1.69 aspect rather than 16:9, so the player letterboxes
 * itself by a few pixels top and bottom. Matching 16:9 instead would pull the
 * picture back off the brackets, which are the thing the eye lines up against.
 *
 * The window mullion beside it runs to x 744, so the frame clears it by 38px.
 * Anything wider here would slide under the car's door frame.
 */
const WALL_SCREEN = {
  left: "40.73%",
  top: "21.94%",
  width: "15.47%",
  height: "16.30%",
} as const;

/**
 * The wall screen, dark.
 *
 * There is no recap to run here yet. It held a YouTube playlist embed, which
 * cost well over a megabyte of player for a box this size and drew its own
 * chrome that could not be styled from outside a cross-origin document. A
 * screen between showings is a better answer than a bad showing.
 *
 * So this is the panel with nothing playing: the same box, unlit, with the
 * faint vertical wash a dark display gives off and a hairline where its bezel
 * catches the platform light. It reads as part of the wall rather than as a
 * hole in it.
 *
 * TODO(organizers): when there is a video, put an <AmbientVideo> in here with
 * an MP4 in public/. Prefer that to an embed: it defers its own fetch, carries
 * no third-party player, and sets no cookies.
 */
function WallScreen() {
  return (
    <div
      aria-hidden
      className="absolute overflow-hidden bg-[#05040a]"
      style={WALL_SCREEN}
    >
      <div
        className="h-full w-full"
        style={{
          background:
            "linear-gradient(160deg, rgb(255 255 255 / 5%) 0%, rgb(255 255 255 / 1%) 42%, rgb(0 0 0 / 0%) 70%)",
          boxShadow: "inset 0 0 0 1px rgb(255 255 255 / 8%)",
        }}
      />
    </div>
  );
}

/**
 * Event numbers, sitting inside the ring of graffiti further along the wall.
 *
 * The ring is an ellipse centred at (470.5, 310.5) of the plate with radii
 * 129.5 x 115.5, fitted to the ink from its beam-free lower arc - the ceiling
 * spotlights throw bright streaks across its top edge that swallow a naive
 * bounding box. This block is 62% of those axes, inside the ~71% that would
 * touch the ring, so the text keeps a margin off the paint at every size.
 *
 * Set in Elevon, not the Hypik used elsewhere for display type. Hypik has no
 * digits and no punctuation at all, so every one of these - "1200+", "30+",
 * "200+" - was falling back to Satoshi mid-string, at Satoshi's metrics inside
 * a size tuned for Hypik. That is what made them look mis-scaled against their
 * own labels. Elevon covers digits and the plus, so the numbers are now one
 * face at one size.
 *
 * Sized in `cqw` against the block itself, so the numbers scale with the
 * artwork instead of stepping at breakpoints, and the ratios hold at every
 * width: the widest value is 3.6em (61% of the block) and the longest label,
 * UNIVERSITIES, is 11.4em with its tracking (80%), so nothing reaches the ink
 * even before the 62% inset above. At phone widths this is genuinely small - it
 * is wall detail seen across a platform - but it stays real text, so it is
 * selectable and a screen reader still reads all three.
 */
const WALL_STATS_BOX = {
  left: "20.32%",
  top: "22.12%",
  width: "8.36%",
  height: "13.26%",
  containerType: "inline-size",
} as const;

const WALL_STATS = [
  { value: "1200+", label: "Hackers" },
  { value: "30+", label: "Universities" },
  { value: "200+", label: "Projects" },
] as const;

function WallStats() {
  return (
    <ul
      className="wall-stats absolute flex flex-col items-center justify-center text-center"
      style={WALL_STATS_BOX}
    >
      {WALL_STATS.map(({ value, label }) => (
        // The gap between stats rides on the items, not as `gap` on the list:
        // `cqw` in a property of the container element itself resolves against
        // the *next* container out, not against itself, so a gap here would be
        // sized off the viewport and throw the block clear of the ring.
        <li key={label} className="wall-stat leading-none not-first:mt-[3cqw]">
          <span
            className="wall-stat-value font-elevon block font-extrabold text-white"
            style={{
              fontSize: "17cqw",
              // Lets the numbers sit on the tiles as painted light rather than
              // as a caption laid over them.
              textShadow: "0 0 0.5em rgba(255, 46, 230, 0.75)",
            }}
          >
            {value}
            <span aria-hidden="true" className="wall-stat-echo">
              {value}
            </span>
          </span>
          <span
            className="font-elevon text-accent-soft mt-[0.35em] block font-medium tracking-[0.12em] uppercase"
            style={{ fontSize: "7cqw" }}
          >
            {label}
          </span>
        </li>
      ))}
    </ul>
  );
}

/**
 * The pipework under the street, between it and the platform below.
 *
 * A transition piece rather than a scene: a 1920x360 strip that holds its own
 * 5.33:1 ratio at every width instead of cropping, with no overlay and no
 * settle. It is short enough that it reads as a beat in the descent rather
 * than a stop in it.
 *
 * It needs neither of the seam fades. The plate is already black at both edges,
 * averaging rgb(6, 2, 4) across its top row and rgb(8, 3, 5) across its bottom,
 * so it meets the street's rgb(1, 1, 1) foot above it and the platform's
 * ceiling fade below it on matching pixels. That is what makes this usable as
 * an interstitial in the first place.
 *
 * The image is block rather than inline: an inline image sits on the text
 * baseline and leaves a gap beneath it, which on a full bleed band shows as a
 * hairline of page background across the join.
 *
 * The negative margins close the dead black around it. Neither join had any
 * layout gap, but the plates carry their own black edges and those stack: the
 * street ends on 69 black rows and this plate opens on 12, which together read
 * as ~60px of nothing above the pipework at 1440. Pulling up by the street's
 * foot leaves this plate's own 12 rows to soften the meeting, which is all the
 * blending the join needs since both sides are already black. The smaller pull
 * at the bottom takes back this plate's 7 black rows and leaves the platform's
 * ceiling fade to do its work untouched.
 *
 * Both are percentages, not vw: a percentage margin resolves against the
 * containing block's width, which is what the plates are scaled to, where vw
 * would also count the scrollbar and over-pull by its width. 69/1920 = 3.59%
 * and 7/1920 = 0.36%.
 */
function PipesBand() {
  return (
    // Hidden on a phone for now. The band is 360px against the 1080 of the
    // panels either side of it, so at 390px wide it renders about 68px tall -
    // too little for the pipework to read as anything but a smudge, and its
    // two 40% fades leave barely a quarter of that at full strength. With it
    // out, the street's floor fade meets the platform's ceiling fade directly
    // and the descent still crosses through black.
    <div
      className="relative hidden w-full overflow-hidden sm:block"
      style={{ marginTop: "-3.59%", marginBottom: "-0.36%" }}
    >
      <Image
        src={pipes}
        alt="Pipework running beneath the city street."
        sizes="100vw"
        placeholder="blur"
        className="block h-auto w-full"
      />
      {/* Tint first, then the fades, so black still wins at both edges. */}
      <div className="pipes-tint" />
      <div className="scene-ceiling-fade scene-ceiling-fade-pipes" />
      <div className="scene-floor-fade scene-floor-fade-pipes" />
    </div>
  );
}

function Scene({
  src,
  alt,
  overlay,
  seams,
  first,
  settle = false,
  zoom,
  zoomOrigin,
}: {
  src: StaticImageData;
  alt: string;
  overlay?: React.ReactNode;
  /**
   * Rendered outside the zoomed frame. The seam fades have to stay welded to
   * the panel's own top and bottom rows, and scaling the frame would carry
   * them off it and leave the joins unfaded.
   */
  seams?: React.ReactNode;
  first: boolean;
  settle?: boolean;
  /** Enlarge the plate and everything pinned to it, about `zoomOrigin`. */
  zoom?: number;
  zoomOrigin?: string;
}) {
  return (
    <div
      // Read by components/smooth-scroll.tsx, which eases onto this panel if
      // the reader comes to rest already close to it.
      data-settle={settle ? "" : undefined}
      /*
       * The panel takes its own plate's shape rather than a fixed 16:9. Every
       * plate has a 16:9 aspect today, so this resolves to the same box for all of
       * them - but it is read from the import rather than hardcoded, so a plate
       * that comes back a different size sizes its own panel instead of being
       * silently cropped by `object-cover`, which is how the descent drifted
       * out of alignment before.
       */
      style={{ aspectRatio: `${src.width} / ${src.height}` }}
      className="relative w-full overflow-hidden"
    >
      <div
        className="scene-frame"
        style={
          zoom
            ? { transform: `scale(${zoom})`, transformOrigin: zoomOrigin }
            : undefined
        }
      >
        <Image
          src={src}
          alt={alt}
          fill
          sizes="100vw"
          placeholder="blur"
          // Flat illustrated art with broad gradients: 65 is indistinguishable
          // from the default 75 here and lands ~25% smaller. Allowlisted in
          // next.config.ts, without which the optimizer answers 400.
          quality={65}
          // Only the first panel is above the fold; the rest lazy-load by
          // default. `preload`, not `priority` - the latter is deprecated as of
          // Next 16.
          preload={first}
          className="object-cover"
        />
        {overlay}
      </div>
      {seams}
    </div>
  );
}
