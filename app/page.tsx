import Image, { type StaticImageData } from "next/image";

import { AmbientVideo } from "@/components/ambient-video";
import { ChallengeTracks } from "@/components/challenge-tracks";
import { DayOfSchedule } from "@/components/day-of-schedule";
import { EventBoard } from "@/components/event-board";
import { KeynoteSpeaker } from "@/components/keynote-speaker";
import { PassingTrain } from "@/components/passing-train";
import { PreheroIntro } from "@/components/prehero-intro";
import { SiteCountdown } from "@/components/site-countdown";
import { SiteFaq } from "@/components/site-faq";
import { SiteFooter } from "@/components/site-footer";
import { SiteSponsors } from "@/components/site-sponsors";
import { SocialMarquee } from "@/components/social-marquee";
import { getConfigStatus, getFAQs, getSchedule, getSponsors } from "@/lib/api";
import type { FAQ, ScheduleItem, Sponsor } from "@/lib/types";
import zeroDay from "@/public/zero_day.png";
import prehero from "@/public/backgrounds/01-prehero.png";
import hero from "@/public/backgrounds/02-hero.png";
import street from "@/public/backgrounds/03-street.png";
import pipes from "@/public/backgrounds/03b-pipes.jpg";
import mascots from "@/public/mascots.png";
import subwayBackground from "@/public/backgrounds/04-subway-background.png";
import subwayForefront from "@/public/backgrounds/04-subway-forefront.png";

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

export default async function Home() {
  const content = await getPublicContent();

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
      {scenes.slice(1, 3).map(renderScene)}
      <PipesBand />
      {scenes.slice(3).map(renderScene)}
      <SiteCountdown />
      <KeynoteSpeaker />
      <EventBoard
        schedule={
          <DayOfSchedule
            schedule={content.schedule.items}
            unavailable={content.schedule.unavailable}
          />
        }
        tracks={<ChallengeTracks />}
      />
      <SiteSponsors
        sponsors={content.sponsors.items}
        unavailable={content.sponsors.unavailable}
      />
      <SiteFaq
        faqs={content.faqs.items}
        unavailable={content.faqs.unavailable}
      />
      {/*
        Both in one opaque block. The marquee had to give up its own background
        so the mascots could show through it, which exposed the ambient wash on
        body::before behind them - a grid over what should be flat black. The
        black lives out here instead, covering the pair and the overlap between
        them.
      */}
      <div className="bg-background relative">
        <Mascots />
        <SocialMarquee />
      </div>
      <SiteFooter />
    </main>
  );
}

/**
 * Starts the three independent HARP requests together. A temporary failure in
 * one public endpoint should empty only its own section, not take down the
 * rest of the marketing site.
 */
type PublicContent = {
  schedule: { items: ScheduleItem[]; unavailable: boolean };
  sponsors: { items: Sponsor[]; unavailable: boolean };
  faqs: { items: FAQ[]; unavailable: boolean };
};

async function getPublicContent(): Promise<PublicContent> {
  const status = getConfigStatus();

  if (!status.configured) {
    return {
      schedule: { items: [], unavailable: true },
      sponsors: { items: [], unavailable: true },
      faqs: { items: [], unavailable: true },
    };
  }

  const [schedule, sponsors, faqs] = await Promise.allSettled([
    getSchedule(),
    getSponsors(),
    getFAQs(),
  ]);

  if (schedule.status === "rejected") {
    console.error("Could not load the public HARP schedule", schedule.reason);
  }
  if (sponsors.status === "rejected") {
    console.error("Could not load public HARP sponsors", sponsors.reason);
  }
  if (faqs.status === "rejected") {
    console.error("Could not load public HARP FAQs", faqs.reason);
  }

  return {
    schedule:
      schedule.status === "fulfilled"
        ? { items: schedule.value, unavailable: false }
        : { items: [], unavailable: true },
    sponsors:
      sponsors.status === "fulfilled"
        ? { items: sponsors.value, unavailable: false }
        : { items: [], unavailable: true },
    faqs:
      faqs.status === "fulfilled"
        ? { items: faqs.value, unavailable: false }
        : { items: [], unavailable: true },
  };
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
    top: "45.00%",
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
        A plain img, not next/image: it is a remote SVG, so there is nothing to
        resize or re-encode, and routing it through the optimizer would only add
        a hop and a remote-host allowlist entry.
      */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="https://logged-assets.s3.amazonaws.com/trust-badge/2027/mlh-trust-badge-2027-black.svg"
        alt="Major League Hacking 2027 Hackathon Season"
        className="block w-full"
      />
    </a>
  );
}

/**
 * Everything laid over the hero plate: the billboard wordmark, and the screen
 * on the building down the alley.
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
      className="pointer-events-none object-cover"
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
 * YouTube cannot embed a *channel* URL - `/embed/<id>` wants a video, and the
 * channel link the organizers gave (youtube.com/channel/UCEM6btSfs7X7Yvv1dLMoyfA)
 * has no video id in it. The uploads playlist is the documented way to point an
 * embed at a whole channel: every channel has one, and its id is the channel id
 * with the `UC` prefix swapped for `UU`. So this plays the channel's newest
 * uploads and keeps working as they post.
 *
 * TODO(organizers): swap to a single video once there is a recap to feature -
 * replace this with `embed/<VIDEO_ID>` and drop the `list` parameter.
 */
const YOUTUBE_UPLOADS_PLAYLIST = "UUEM6btSfs7X7Yvv1dLMoyfA";

/**
 * Player parameters for the wall screen. This is set dressing on a platform,
 * not a video anyone came here to operate, so it should read as a screen
 * playing rather than as a YouTube page sitting in the wall.
 *
 * `showinfo` and `modestbranding` are gone, so the title bar, the channel
 * avatar and the watermark cannot be turned off directly. What removes them is
 * playing: YouTube only draws that furniture over a paused or hovered player,
 * so an autoplaying muted loop with no controls shows the picture and nothing
 * else. Muted is not a preference here, it is the only way autoplay is allowed
 * at all.
 *
 *  - controls=0        no scrubber, no play button, no fullscreen chrome
 *  - rel=0             end screen suggestions stay on this channel
 *  - iv_load_policy=3  no annotation cards over the picture
 *  - disablekb=1       the wall does not steal arrow keys from the page
 *  - playsinline=1     iOS plays it in the wall instead of going fullscreen
 */
const WALL_SCREEN_PARAMS = [
  "autoplay=1",
  "mute=1",
  "loop=1",
  "controls=0",
  "rel=0",
  "iv_load_policy=3",
  "disablekb=1",
  "playsinline=1",
].join("&");

function WallScreen() {
  return (
    <div className="absolute overflow-hidden bg-black" style={WALL_SCREEN}>
      {/*
        `youtube-nocookie.com` so a visitor who never presses play is not
        handed tracking cookies for it. `loading="lazy"` because this panel is
        several screens down - the player is well over a megabyte and there is
        no reason to spend it before the reader gets here.
      */}
      {/*
        The player is laid out four times the size of its box on a phone and
        scaled back down to fit it.
      
        YouTube draws its own chrome - the channel avatar, the title, the play
        button - at a size it picks from the iframe's own pixel width, and it
        has a floor. At the ~63px this screen gets on a phone, that chrome came
        out nearly as large as the picture. Nothing about it can be styled from
        here: it is a cross-origin document, and the parameters that used to
        trim it (`showinfo`, `modestbranding`) are gone.
      
        So the iframe is given four times the width and height it will occupy
        and scaled by a quarter from its top-left corner: YouTube sees a 250px
        player and sizes its furniture for one, while the box on the wall is
        unchanged. Clicks and fullscreen come through the transform intact.
      
        Above `sm` the screen is wide enough that YouTube's own sizing is
        right, so the scaling is switched off rather than left on at a size it
        was not needed for.
      */}
      <iframe
        src={`https://www.youtube-nocookie.com/embed/videoseries?list=${YOUTUBE_UPLOADS_PLAYLIST}&${WALL_SCREEN_PARAMS}`}
        title="HackUTD on YouTube"
        loading="lazy"
        allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="h-[400%] w-[400%] origin-top-left scale-25 border-0 sm:h-full sm:w-full sm:scale-100"
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
      className="absolute flex flex-col items-center justify-center text-center"
      style={WALL_STATS_BOX}
    >
      {WALL_STATS.map(({ value, label }) => (
        // The gap between stats rides on the items, not as `gap` on the list:
        // `cqw` in a property of the container element itself resolves against
        // the *next* container out, not against itself, so a gap here would be
        // sized off the viewport and throw the block clear of the ring.
        <li key={label} className="leading-none not-first:mt-[3cqw]">
          <span
            className="font-elevon block font-extrabold text-white"
            style={{
              fontSize: "17cqw",
              // Lets the numbers sit on the tiles as painted light rather than
              // as a caption laid over them.
              textShadow: "0 0 0.5em rgba(255, 46, 230, 0.75)",
            }}
          >
            {value}
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
/**
 * The mascots, standing under the FAQ with the marquee crossing in front of
 * their feet.
 *
 * The overlap is a negative bottom margin here rather than a pull on the
 * marquee, so the marquee keeps its own spacing and only this block reaches
 * under it. The marquee is raised above this in the stack and had to give up
 * its opaque background to do it: it was painting page black over anything
 * behind it, so the cards would have crossed a black bar instead of the
 * mascots. The page is that same black underneath, so nothing else changes.
 *
 * The plate is trimmed to its ink and carries no padding of its own, so the
 * overlap below is a share of the art rather than of empty pixels.
 */
function Mascots() {
  return (
    <div className="relative -mb-[7%] px-5 sm:px-6">
      <Image
        src={mascots}
        alt="The HackUTD mascots: an octopus cat, a masked raccoon, a winged messenger, a hooded pig and a spotted panther."
        sizes="(max-width: 940px) 100vw, 880px"
        placeholder="blur"
        className="mx-auto block h-auto w-full max-w-[880px]"
      />
    </div>
  );
}

function PipesBand() {
  return (
    <div
      className="relative w-full overflow-hidden"
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
      // Every panel in the descent is a 16:9 frame. The one plate that is not
      // - the portrait tunnel - is no longer a panel at all: it is the
      // backdrop the board lays its content over, and lives in
      // components/event-board.tsx.
      className="relative aspect-video w-full overflow-hidden"
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
