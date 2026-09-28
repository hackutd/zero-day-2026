import Image from "next/image";

import { AmbientVideo } from "@/components/ambient-video";
import {
  FaqSection,
  ScheduleSection,
  SponsorsSection,
  TracksSection,
} from "@/components/api-sections";
import { EventBoard } from "@/components/event-board";
import { ParallaxScene } from "@/components/parallax-scene";
import { PassingTrain } from "@/components/passing-train";
import { PreheroIntro } from "@/components/prehero-intro";
import { SiteCountdown } from "@/components/site-countdown";
import { SiteFooter } from "@/components/site-footer";
import { SocialMarquee } from "@/components/social-marquee";
import backBuildings from "@/assets/images/backgrounds/descent/back-buildings-2x.webp";
import frontBuildings from "@/assets/images/backgrounds/descent/front-buildings-2x.webp";
import moon from "@/assets/images/backgrounds/descent/moon-2x.webp";
import sky from "@/assets/images/backgrounds/descent/sky-2x.webp";
import pipes from "@/assets/images/backgrounds/03b-pipes-2x.webp";
import subwayBackground from "@/assets/images/backgrounds/04-subway-background-2x.webp";
import subwayForefront from "@/assets/images/backgrounds/04-subway-forefront-2x.webp";
import zeroDay from "@/assets/images/zero_day.png";

export default function Home() {
  return (
    <main>
      <h1 className="sr-only">
        HackUTD 2026: Zero Day, a 24-hour hackathon at The University of Texas
        at Dallas, November 7-8, 2026
      </h1>
      {/*
        The descent runs unbroken from the skyline down to the platform, then
        stops there. The countdown opens on the page background, which is
        what the platform above it fades down to, and
        the board below carries the descent's last plate itself - the tunnel is
        its backdrop rather than a panel of its own, so the artwork arrives
        under the content instead of ahead of it.
      */}
      <Descent />
      <PipesBand />
      <SubwayScene />
      <SiteCountdown />
      <EventBoard schedule={<ScheduleSection />} tracks={<TracksSection />} />
      <SponsorsSection />
      <FaqSection />
      <SocialMarquee />
      <SiteFooter />
    </main>
  );
}

/**
 * The city, from the skyline down to the street: one 1920x3240 canvas drawn as
 * four layers - sky, moon, the far towers, and the near buildings that carry
 * the billboard - stacked so that at rest they read as the single flattened
 * illustration they were cut from.
 *
 * ParallaxScene pulls them apart as the reader scrolls. The buildings - far
 * and near together - move with the page; the sky and the moon lag behind
 * them by a share of the canvas height, so the sky shows down the alley as
 * the camera drops. On a pointer device the sky and moon also lean with the
 * cursor. Every value is a percentage of the layer itself, so it holds at every
 * viewport and under the phone zoom (`.descent` in globals.css).
 *
 * The page's own content sits in three bands over the canvas - the prehero,
 * the hero and the street are each a third of it, exactly the 16:9 panels the
 * flattened plates used to be - so the intro, the settle marker and the about
 * copy all keep the geometry they were measured against. Things painted *onto*
 * the art - the building screens, the wordmark on the sign - live inside the
 * layer that carries their building instead, and move with it.
 */
function Descent() {
  return (
    // The wrapper is what the pipes below overlap, and what the about copy
    // hangs off on a phone - see StreetCopy.
    <div className="relative">
      <ParallaxScene className="descent">
        {/*
          Every layer starts from rest, so on load the three read as the one
          flattened picture, and the sky and moon slide down the canvas as the
          page scrolls - the further back, the further it slides. The sky ends
          up half a canvas down, which is to say it scrolls at half the speed
          of the street. Nothing ever shows past a layer's top edge: the
          section's own top leaves the viewport faster than any layer descends.
        */}
        <DescentLayer parallaxY={50} drift={2.8}>
          <Image
            src={sky}
            alt=""
            sizes="100vw"
            placeholder="blur"
            quality={65}
            loading="eager"
            className="descent-plate"
          />
        </DescentLayer>

        <DescentLayer
          parallaxY={36}
          parallaxX={8}
          parallaxScale={1.22}
          parallaxOrigin="63% 8%"
          drift={3.8}
        >
          {/*
            Cropped to its glow in the build script and hung back at the crop's
            origin on the canvas: x 773, of 1920, and 868 wide.
          */}
          <Image
            src={moon}
            alt=""
            sizes="(max-width: 639px) 62vw, (max-width: 1023px) 55vw, 46vw"
            placeholder="blur"
            quality={65}
            loading="eager"
            className="descent-plate"
            style={{ left: "40.26%", width: "45.21%" }}
          />
        </DescentLayer>

        {/*
          The far towers ride in the same layer as the near buildings rather
          than lagging behind them: the cables strung down the alley are
          painted on the far plate but anchor to the near one, so any offset
          between the two leaves them hanging in mid-air.
        */}
        <DescentLayer drift={0.5}>
          <Image
            src={backBuildings}
            alt=""
            sizes="100vw"
            placeholder="blur"
            quality={65}
            loading="eager"
            className="descent-plate"
          />
          {BUILDING_ADS.map((ad) => (
            <BuildingAd key={ad.src} {...ad} />
          ))}
          <Image
            src={frontBuildings}
            alt="A neon city at night: a skyline under a full moon, a glowing billboard strung between the towers, and a rain-slicked street lined with red neon below."
            sizes="100vw"
            placeholder="blur"
            quality={65}
            preload
            className="descent-plate"
          />
          <BillboardWordmark />
          <BillboardDeadline />
        </DescentLayer>

        <PreheroBand />

        {/*
          Read by components/smooth-scroll.tsx, which eases onto this band if
          the reader comes to rest already close to it - the billboard is the
          one place in the descent worth stopping square on.
        */}
        <div
          data-settle
          aria-hidden
          className="descent-band descent-band-hero pointer-events-none"
        />

        <div
          aria-hidden
          className="street-scrim descent-band descent-band-street pointer-events-none hidden sm:block"
        />
        <div className="scene-floor-fade scene-floor-fade-street" />
      </ParallaxScene>

      <StreetCopy />
    </div>
  );
}

/**
 * One layer of the descent: the scroll-driven element outside, the
 * pointer-driven one inside, so the two never write the same transform. The
 * plate and anything pinned to it go in the inner box, in percentages of the
 * canvas.
 *
 * Every layer is decoration to a screen reader except the front one, whose
 * plate carries the alt text for the whole picture.
 */
function DescentLayer({
  parallaxY,
  parallaxX,
  parallaxScale,
  parallaxOrigin,
  drift,
  children,
}: {
  parallaxY?: number;
  parallaxX?: number;
  parallaxScale?: number;
  parallaxOrigin?: string;
  drift?: number;
  children: React.ReactNode;
}) {
  return (
    <div
      className="descent-layer"
      data-parallax-y={parallaxY}
      data-parallax-x={parallaxX}
      data-parallax-scale={parallaxScale}
      data-parallax-origin={parallaxOrigin}
    >
      <div className="descent-drift" data-drift={drift}>
        {children}
      </div>
    </div>
  );
}

/**
 * The "HackUTD's Zero Day" wordmark, sitting on the hero's blank billboard.
 *
 * Every number here was measured off the front layer of the descent
 * (`design-sources/backgrounds/descent/front-buildings.png`, 1920x3240) rather
 * than eyeballed. The sign is not a rotated rectangle - its left and right
 * edges are vertical while the top and bottom slope down to the right (~6.1
 * deg and ~5.5 deg). That is a vertical shear, so `skewY` is what makes the
 * art sit *on* the sign; a `rotate` would tilt the upright strokes away from
 * the sign's own vertical edges and read as a sticker laid on top.
 *
 * The sign's lit face spans x 20-955; its top edge runs from y 1090 at the left
 * to 1190 at the right, its bottom from 1600 to 1690. The wordmark takes 82% of
 * the face's width, which leaves an even ~80px of sign on either side of the
 * ink at the canvas's native scale.
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
        top: "36.73%",
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
        sizes="(max-width: 639px) 56vw, (max-width: 1023px) 50vw, 42vw"
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
        sizes="(max-width: 639px) 56vw, (max-width: 1023px) 50vw, 42vw"
        className="sign-echo object-contain"
      />

      <BillboardPresenter />
    </div>
  );
}

/**
 * The title sponsor's credit, tucked under the wordmark's right-hand ring the
 * way the event's own lockup sets it.
 *
 * It lives inside the wordmark's box so it inherits the same shear and scales
 * with the artwork. Measured off `zero_day.png`: below row 222 the art is
 * empty from x 100 to 690, save the barbed wire at x 734, so the line hangs
 * from row ~240 and stops well short of the wire. That keeps it clear of the
 * glitch slice (`.sign-echo`, rows 36%-57%) and above the deadline's box.
 *
 * Set in Elevon's heaviest cut, matching the lockup. `cqw` against this box for
 * the same reason as the deadline: the type is a fraction of the sign.
 */
function BillboardPresenter() {
  return (
    <div
      className="pointer-events-none absolute inset-0"
      style={{ containerType: "inline-size" }}
    >
      <p
        className="font-elevon absolute flex items-center gap-[0.55em] leading-none font-extrabold whitespace-nowrap text-white"
        style={{
          right: "12.5%",
          top: "78%",
          fontSize: "clamp(7px, 2.6cqw, 22px)",
        }}
      >
        Presented by
        <Image
          src="/tmobile-logo.svg"
          alt="T-Mobile"
          width={7936}
          height={1632}
          unoptimized
          className="h-[1.35em] w-auto"
        />
      </p>
    </div>
  );
}

/**
 * The application deadline, painted on the billboard under the wordmark.
 *
 * Measured off the front layer the way the wordmark above it was, because the
 * space this has to live in is bounded on both sides. At the sign's midline the
 * wordmark's *ink* stops at y 1472 of the 1920x3240 canvas - its box runs on
 * to 1500, but 28 of those rows are the artwork's own padding, see
 * BillboardWordmark - and the sign's lit face ends at y 1645 there, its bottom
 * rail running from (20, 1600) to (955, 1690). That leaves a ~170px band.
 *
 * This box takes 110 of it, centred. Being the tighter of the two is the point:
 * it shears at the wordmark's 6.72 deg while the rail only falls at 5.5, so the
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
 * set in it, and the sign is a screen below the fold - the first Elevon glyphs
 * here would put ~40KB back in front of the opening artwork for two lines of
 * type.
 */
const BILLBOARD_DEADLINE_BOX = {
  // Flush with the wordmark's box, so the two centre on the same column and the
  // shear below pivots both about the same x.
  left: "4.58%",
  width: "41.10%",
  top: "46.14%",
  height: "3.40%",
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
        against the viewport would drift off it as the canvas changed shape.
        The size sits on this element and not on the box above, because `cqw` in a
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
 * Screens playing on the sides of the far towers.
 *
 * Every figure is a fraction of the back layer's own 1920x3240 canvas,
 * measured off `descent/back-buildings.png` rather than eyeballed, so the
 * screens stay on their buildings at any viewport and ride with the layer as it
 * drifts. Unlike the hero billboard these need no shear: the window grids are
 * drawn axis-aligned, so the screens are plain rectangles.
 *
 * `aspect` is the source clip's own ratio, which fixes each screen's height
 * from its width and guarantees the footage is never stretched.
 */
const BUILDING_ADS = [
  {
    // The tower left of centre with the dense white window grid, x 560-770
    // by y 215-720 of the canvas.
    src: "/ads/ad-gif1.mp4",
    label: "Advertisement screen on a city building",
    left: "31.80%",
    top: "7.40%",
    width: "7.00%",
    aspect: "800 / 600",
  },
  {
    // High on the dark tower in the top-left corner, x 50-200 by y 20-170.
    src: "/ads/ad-reboot.mp4",
    label: "Reboot advertisement screen on a city building",
    left: "3.40%",
    top: "1.85%",
    width: "6.25%",
    aspect: "600 / 338",
  },
  {
    // The purple-windowed block right of the MMXXVI tower, x 480-640 by
    // y 370-640, just under its roofline.
    src: "/ads/ad-tmobile.mp4",
    label: "T-Mobile advertisement screen on a city building",
    left: "26.80%",
    top: "12.60%",
    width: "6.46%",
    aspect: "480 / 228",
  },
  {
    // The orange-windowed slab down the alley, x 1170-1280 by y 1500-1800.
    // Kept small and dimmed: it is the furthest screen in the scene, so it
    // reads as distance rather than as a panel that happens to be tiny.
    src: "/ads/ad-gif4.mp4",
    label: "Screen on a building down the alley",
    left: "61.20%",
    top: "47.50%",
    width: "5.20%",
    aspect: "800 / 423",
    fade: 0.5,
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

/**
 * The opening band: the top third of the canvas, which is the 16:9 skyline the
 * intro was written over. The id is what the nav's Home link and the intro's
 * scroll maths point at; the band sits over the layers, so the line and its
 * scrim hold still on the viewport while the city moves behind them.
 */
function PreheroBand() {
  return (
    <section id="scene-prehero" className="descent-band descent-band-prehero">
      <PreheroIntro />
      <MlhBadge />
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
 * The platform, with the train stopped at it.
 *
 * Two plates rather than one because the car's windows are genuinely
 * transparent - a third of `04-subway-forefront.png` is alpha - and the
 * platform wall behind it shows through them. Flattening the pair in the
 * artwork would lose that, and it is what lets the wall sit a little further
 * back than the glass: ParallaxScene slides it a few percent against the car
 * as the reader scrolls through, so the tiles move behind the mullions the way
 * a far wall does past a near window.
 *
 * Both plates are 1920x1080 and drawn on the same camera, so the car sits on
 * the frame with no offset and takes the same `object-cover` crop as the wall
 * under it. They have to stay identical in size and fit: crop one differently
 * and the car slides off its own doorway.
 *
 * Pushed in so the back wall reads. The screen and the stats are wall detail
 * seen across a platform, and at 1:1 the video was a postage stamp and the
 * numbers were near unreadable on a phone. The origin sits between them, at
 * the midpoint of the stats block's centre (24.5%, 28.8%) and the screen's
 * (48.5%, 30.1%), so the zoom grows the wall in place instead of sliding it
 * out of frame. The zoom is also what gives the wall room to move: at 1.3 the
 * frame overhangs the panel by 94px above and 230px below, so the slide never
 * shows an edge.
 */
const SUBWAY_ZOOM = { transform: "scale(1.3)", transformOrigin: "37% 29%" };

function SubwayScene() {
  return (
    <ParallaxScene
      className="relative w-full overflow-hidden"
      style={{
        aspectRatio: `${subwayBackground.width} / ${subwayBackground.height}`,
      }}
    >
      <div className="scene-frame" style={SUBWAY_ZOOM}>
        {/*
          Paint order is the whole trick. The wall and everything mounted on it
          sit *behind* the glass - measured against `04-subway-forefront.png`,
          the screen's rectangle and the ring's interior are 100% alpha there,
          so they read through the windows with the car's mullions framing them.
          The passing train runs in front of the tiles, so it covers the screen
          and the stats while it is across them, and the car is painted last so
          it occludes everything correctly.
        */}
        <div
          className="absolute inset-0"
          data-parallax-from-y={-7}
          data-parallax-y={7}
        >
          <Image
            src={subwayBackground}
            alt="A neon-lit subway platform, a train stopped at it with its doors closed."
            fill
            sizes="100vw"
            placeholder="blur"
            // Flat illustrated art with broad gradients: 65 is indistinguishable
            // from the default 75 here and lands ~25% smaller. Allowlisted in
            // next.config.ts, without which the optimizer answers 400.
            quality={65}
            className="object-cover"
          />
          <WallScreen />
          <WallStats />
        </div>
        <PassingTrain />
        <SubwayCar />
      </div>

      {/*
        Outside the zoomed frame. The seam fades have to stay welded to the
        panel's own top and bottom rows, and scaling the frame would carry them
        off it and leave the joins unfaded. The ceiling half sits over the car
        for the same reason the floor half does: the carriage roof runs up into
        the ceiling band, so fading only the background would leave it lit.
      */}
      <div className="scene-ceiling-fade scene-ceiling-fade-subway" />
      <div className="subway-floor-fade" />
    </ParallaxScene>
  );
}

/**
 * The stopped car, painted over the platform.
 *
 * `alt=""` because the layer beneath already describes the scene, and a
 * screen reader announcing it twice would just be noise. `pointer-events-none`
 * so clicks still reach the wall screen behind the glass - drop that class and
 * the player goes dead behind it.
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
 * What the hackathon actually is, written on the street.
 *
 * Where the copy sits was measured off the street third of the canvas rather
 * than guessed: the left half is the loud half - the lit buildings, the
 * umbrella, the wet reflections - and the road running away up the middle-right
 * is the one large region that is both dark and flat. That is where this goes,
 * over `.street-scrim`, which has no edge of its own.
 *
 * Below `sm` the copy is not on the picture at all. Even zoomed, the street
 * band is ~330px tall on a phone - there is no room for a paragraph on it at
 * any size worth reading, and shrinking type to fit is how this ends up looking
 * like an interface rather than a page. So it drops into flow underneath
 * instead, on black, and the scrim turns off with it.
 *
 * From `sm` the section is pinned over the bottom third of the canvas, so the
 * Descent wrapper is exactly the canvas and the pipes' overlap below is
 * unchanged. On a phone the wrapper grows by the copy's height, and the pipes'
 * 3.59% bite - about 14px there - lands inside this block's bottom padding.
 */
function StreetCopy() {
  return (
    // A landmark, not just artwork: this is the first place the page says what
    // the event actually is, so it gets a name a screen reader can jump to.
    <section
      id="about"
      aria-labelledby="about-heading"
      className="bg-background sm:pointer-events-none sm:absolute sm:inset-x-0 sm:top-2/3 sm:bottom-0 sm:bg-transparent"
    >
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
          HackUTD is the largest 24 hour university hackathon in North America:
          a weekend-long event where students build apps, hardware and more. It
          is a venue for self-expression and creativity through technology.
          People with varying technical backgrounds, from universities all over
          the US, come together, form teams around a problem or an idea, and
          build something from scratch. Whether you are a frequent hackathon
          attendee or just getting started, we would love to see what you can
          make.
        </p>
      </div>
    </section>
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
