import { CloseOnScroll } from "@/components/close-on-scroll";

/**
 * Challenge tracks and prizes.
 *
 * TODO(organizers): last year's board, kept so the section is real and laid
 * out. Sponsors, prompts and prizes all move year to year - swap the two
 * constants below and nothing else changes.
 *
 * Two lists rather than one grid of sixteen: a sponsor track is a brief you
 * read (a prompt, then what it pays), while a HackUTD award is a single line
 * you scan. Forcing both into one card shape would either bury the prompts or
 * pad the awards with empty space, so they get the shape each one needs.
 *
 * Nothing here is interactive, so nothing here is a client component.
 */

type Prize = { place: string; prize: string };

type SponsorTrack = {
  sponsor: string;
  name: string;
  prompt: string;
  prizes: Prize[];
};

const SPONSOR_TRACKS: SponsorTrack[] = [
  {
    sponsor: "Capital One",
    name: "Best Financial Hack",
    prompt:
      "Your chance to change the game in fintech. Whether it's an innovative payment solution, helping consumers shop smarter, making financing more accessible, or a creative way to improve financial literacy, we want to see your boldest ideas in action. The track is intentionally vague to let you bring your own creativity to it.",
    prizes: [{ place: "1st", prize: "$300 Amazon gift card" }],
  },
  {
    sponsor: "NVIDIA",
    name: "Agents That Act",
    prompt:
      "Build with NVIDIA Nemotron and push beyond basic chatbots: intelligent agents that plan and execute multi-step workflows, integrate external tools and APIs, and solve real problems. Projects must show reasoning beyond single-prompt conversation, orchestration across steps or services, tool and API integration, and clear practical value.",
    prizes: [
      { place: "1st", prize: "3× RTX 5080 GPUs and 3 NVIDIA hats" },
      {
        place: "2nd",
        prize: "2× RTX 5080 GPUs, 3 backpacks, 3× $100 Brev credits",
      },
      { place: "3rd", prize: "3 NVIDIA backpacks and 3× $200 Brev credits" },
    ],
  },
  {
    sponsor: "T-Mobile",
    name: "Customer Happiness Index",
    prompt:
      "Build a real-time, data-driven solution that captures how customers feel about T-Mobile. Engineer a system that streams live sentiment, feedback and network data to catch issues before they spread, highlight moments of delight, and help teams act on them. Data engineering, APIs, analytics and visualization, turning customer emotion into insight.",
    prizes: [
      { place: "1st", prize: "iPhone" },
      { place: "2nd", prize: "iPad" },
      { place: "3rd", prize: "Beats earbuds" },
    ],
  },
  {
    sponsor: "CBRE",
    name: "AI for Real Estate Intelligence",
    prompt:
      "How might we build an AI-powered assistant that transforms how people access and trust information in real estate? Create a system that helps CBRE professionals find, summarize or predict key insights from large volumes of property, market and operational data, making decisions faster, easier and more reliable.",
    prizes: [
      { place: "1st", prize: "$250 Amazon gift card" },
      { place: "2nd", prize: "$150 Amazon gift card" },
      { place: "3rd", prize: "$75 Amazon gift card" },
    ],
  },
  {
    sponsor: "Toyota",
    name: "Find Your Dream Car",
    prompt:
      "Toyota builds some of the best-selling, most fuel-efficient and highest-quality cars in the world. Develop a web or mobile solution that helps people shop for them: searching, comparing and finding the right vehicle against personal preferences, including what it costs to finance or lease.",
    prizes: [
      { place: "1st", prize: "$500 Amazon gift card" },
      { place: "2nd", prize: "$350 Amazon gift card" },
      { place: "3rd", prize: "$150 Amazon gift card" },
    ],
  },
  {
    sponsor: "NMC²",
    name: "Tools for the Data Center Floor",
    prompt:
      "NMC² runs data centers worldwide, including a $2.8 billion facility powering 400MW of compute. The technicians keeping them running face complex workflows, varied environments and endless work orders. Build something that helps them stay efficient, safe and effective. Fresh perspectives encouraged.",
    prizes: [
      { place: "1st", prize: "Nintendo Switch 2" },
      { place: "2nd", prize: "Sony WH-1000XM5 headphones" },
      { place: "3rd", prize: "DJI Tello drones" },
    ],
  },
  {
    sponsor: "Goldman Sachs",
    name: "Onboarding Without the Friction",
    prompt:
      "Vendor and client onboarding is often manual, fragmented and slow, which drives up cost and risk. Those processes frequently lack real privilege management, and without fraud detection at onboarding an organization is exposed to loss and reputational damage. Build a unified, intelligent solution that streamlines onboarding while strengthening security and compliance.",
    prizes: [
      { place: "1st", prize: "Apple AirPods Pro 3" },
      { place: "2nd", prize: "Apple TV" },
      { place: "3rd", prize: "Grubhub gift card" },
    ],
  },
  {
    sponsor: "PNC",
    name: "AI for Product Managers",
    prompt:
      "Design an AI-powered productivity solution for product managers: the meetings, the specs, the roadmaps, the endless context-switching. Anything that gives a PM back their week.",
    prizes: [
      { place: "1st", prize: "PlayStation 5 Slim" },
      { place: "2nd", prize: "Ray-Ban Meta AI sunglasses" },
      { place: "3rd", prize: "Yaber T1 Pro mini projector" },
    ],
  },
  {
    sponsor: "State Farm",
    name: "Diff Two Versions of a Service",
    prompt:
      "Build a tool that sends the same request to two versions of a service and reports every difference in their responses. Some differences (generated IDs on creation, say) are expected and should be flagged as acceptable; mismatched fields or error statuses are not. Deep-compare the responses, distinguish expected from unexpected, and summarize the regressions. Design your own example service and front end as needed.",
    prizes: [
      { place: "1st", prize: "HOVERair X1 drone with camera" },
      { place: "2nd", prize: "Bose earbuds" },
      { place: "3rd", prize: "Newsmy portable power station" },
    ],
  },
  {
    sponsor: "EOG",
    name: "Potion Flow Monitoring",
    prompt:
      "Deep in Poyo's Potion Factory, dozens of enchanted cauldrons fill at their own pace before courier witches haul the brews to the Enchanted Market, logging each run on a Potion Transport Ticket. Lately the volumes don't match the tickets. Build a real-time dashboard that tracks levels across every cauldron, identifies collection events, checks them against the tickets, and flags anything unlogged or suspicious.",
    prizes: [
      { place: "1st", prize: "Nintendo Switch 2" },
      { place: "2nd", prize: "Ninja Creami" },
    ],
  },
];

/**
 * HackUTD's own awards. The general track is first because it is the one every
 * project is in by default.
 */
const HACKUTD_AWARDS: { name: string; prizes: Prize[] }[] = [
  {
    name: "General Track",
    prizes: [
      { place: "1st", prize: "MacBook M4, 16GB" },
      { place: "2nd", prize: "iPad 11″ A16 and Apple Pencil (USB-C)" },
      { place: "3rd", prize: "FlowLite 84" },
    ],
  },
  {
    name: "Best Beginner",
    prizes: [{ place: "1st", prize: "Anker power bank" }],
  },
  {
    name: "Best Startup",
    prizes: [{ place: "1st", prize: "Philips Hue light bar" }],
  },
  {
    name: "Best Design",
    prizes: [
      { place: "1st", prize: "Fujifilm Instax Mini SE and a 10-pack of film" },
    ],
  },
  {
    name: "Best Guided",
    prizes: [{ place: "1st", prize: "NordVPN, one year" }],
  },
  {
    name: "Best Hardware",
    prizes: [{ place: "1st", prize: "ELEGOO UNO starter kit" }],
  },
];

export function ChallengeTracks() {
  return (
    // No heading of its own: this is a tab panel, and the tab that opens it is
    // the heading. See components/event-board.tsx.
    <div className="mx-auto max-w-[1100px]">
      <p className="font-sans text-text-muted text-center text-[13px] leading-[1.6] tracking-[0.04em]">
        Enter up to two. Last year&rsquo;s board is shown while the 2026 tracks
        are confirmed.
      </p>

      {/*
        Collapsed by default, in two columns, exactly as the FAQ does it: ten
        briefs laid open at once ran several screens deep, and a hacker
        picking a track is scanning sponsors and prizes first and reading one
        brief second. `name` puts every card in one exclusive group across
        both columns, so opening a brief closes the last and the panel cannot
        grow past a screen or so however far down you read.
      */}
      <div className="mt-10 grid gap-3 lg:grid-cols-2">
        {SPONSOR_TRACKS.map((track) => (
          <TrackCard key={track.name} {...track} />
        ))}
      </div>
      <CloseOnScroll name="challenge-track" />

      <h3 className="font-hypik mt-14 text-center text-[22px] leading-none tracking-[-0.02em] text-white uppercase sm:text-[26px]">
        HackUTD awards
      </h3>
      <p className="font-sans text-text-muted mt-3 text-center text-[13px] leading-[1.6] tracking-[0.04em]">
        Open to every project, no sponsor brief required.
      </p>

      {/*
        These carry no brief, so they stay open cards - but three across and
        tighter than the briefs above, since each is a name and a prize or
        three rather than a paragraph.
      */}
      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {HACKUTD_AWARDS.map(({ name, prizes }) => (
          <div
            key={name}
            className="border-border-hairline flex flex-col gap-3 border bg-white/[0.02] p-4"
          >
            <h4 className="font-elevon text-[14px] leading-none font-extrabold tracking-[0.04em] text-white uppercase">
              {name}
            </h4>
            <PrizeList prizes={prizes} />
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * One track, closed to its header until you ask for the brief.
 *
 * The summary carries what a hacker chooses on - the sponsor, the track, and
 * the top prize - so the grid can be read without opening anything. The brief
 * and the rest of the prizes are one click away, and `name` makes that click
 * close whichever brief was open before.
 *
 * Native `<details>`, like the FAQ: keyboard and screen-reader accessible with
 * no work, and find-in-page can open a closed brief to reveal a match.
 */
function TrackCard({ sponsor, name, prompt, prizes }: SponsorTrack) {
  const [top] = prizes;

  return (
    <details
      name="challenge-track"
      className="disclosure border-border-hairline group border bg-white/[0.02] open:bg-white/[0.04]"
    >
      <summary className="flex cursor-pointer list-none items-start gap-4 p-4 sm:p-5">
        <div className="min-w-0 flex-1">
          <p className="font-sans text-text-dim text-[10px] tracking-[0.14em] uppercase">
            Presented by {sponsor}
          </p>
          <h3 className="font-elevon mt-1.5 text-[16px] leading-[1.15] font-extrabold tracking-[0.02em] text-white uppercase sm:text-[18px]">
            {name}
          </h3>
          <p className="font-sans text-accent-soft mt-2 text-[12px] leading-[1.4] group-open:hidden">
            {top.place}: {top.prize}
          </p>
        </div>

        {/* Rotates to point down when the card is open; see globals.css. */}
        <span
          aria-hidden
          className="disclosure-chevron text-text-dim mt-1 shrink-0 text-[11px] leading-none"
        >
          &#9660;
        </span>
      </summary>

      <div className="border-border-hairline mx-4 border-t pt-4 pb-5 sm:mx-5">
        <p className="font-sans text-text-muted text-[13px] leading-[1.65]">
          {prompt}
        </p>
        <div className="mt-4">
          <PrizeList prizes={prizes} />
        </div>
      </div>
    </details>
  );
}

function PrizeList({ prizes }: { prizes: Prize[] }) {
  return (
    <ul className="flex flex-col gap-2">
      {prizes.map(({ place, prize }) => (
        <li key={place} className="flex items-baseline gap-3">
          <span className="font-elevon text-accent-soft w-8 shrink-0 text-[12px] leading-none font-extrabold tracking-[0.06em] uppercase">
            {place}
          </span>
          <span className="font-sans text-[13px] leading-[1.45] text-white">
            {prize}
          </span>
        </li>
      ))}
    </ul>
  );
}
