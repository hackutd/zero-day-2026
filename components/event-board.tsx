"use client";

import Image from "next/image";
import { useId, useRef, useState } from "react";

import tracksPrizesFaq from "@/public/backgrounds/05-tracks-prizes-faq.png";

/**
 * The schedule and the challenge tracks, over the tunnel plate.
 *
 * The art is the section's own backdrop rather than a panel above it. It is
 * 1920x2160 - a portrait plate, not a 16:9 frame - so the box takes its aspect
 * from the import's own width and height and sits at the top of the section;
 * the content is far taller than that, so it runs off the bottom of the art
 * onto the page background. The plate's floor fade is what makes that work:
 * the artwork is already black by its last row, so there is no edge to see.
 *
 * Both fades come with it. The ceiling fade still meets the keynote section
 * above, and the floor fade still lands on the background, exactly as they did
 * when this was a panel in the descent.
 *
 * `alt=""`: with a page of content laid over it, the plate is decoration. A
 * screen reader announcing a paragraph about rails and cables before reaching
 * the tabs would be noise, not description.
 *
 * The two panels are passed in as props rather than imported, so they stay
 * Server Components - only the tab state and the schedule's own filter are
 * client code. Both panels stay mounted and are hidden with `hidden`, so the
 * copy is in the document for search and for find-in-page whichever tab is up.
 */
const TABS = [
  { id: "schedule", label: "Schedule" },
  { id: "tracks", label: "Challenge tracks" },
] as const;

type TabId = (typeof TABS)[number]["id"];

/** The same chamfer as the buttons, at the size these sit. */
const NOTCH =
  "polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)";

export function EventBoard({
  schedule,
  tracks,
}: {
  schedule: React.ReactNode;
  tracks: React.ReactNode;
}) {
  const [active, setActive] = useState<TabId>("schedule");
  const base = useId();
  const tablist = useRef<HTMLDivElement>(null);

  const tabId = (id: TabId) => `${base}-${id}-tab`;
  const panelId = (id: TabId) => `${base}-${id}-panel`;

  /**
   * Arrow keys move between tabs and take focus with them, which is what the
   * ARIA tabs pattern expects: the tablist is one tab stop, and the arrows
   * choose within it.
   */
  function onKeyDown(event: React.KeyboardEvent) {
    const order = TABS.map((t) => t.id);
    const i = order.indexOf(active);

    const next =
      event.key === "ArrowRight"
        ? order[(i + 1) % order.length]
        : event.key === "ArrowLeft"
          ? order[(i - 1 + order.length) % order.length]
          : event.key === "Home"
            ? order[0]
            : event.key === "End"
              ? order[order.length - 1]
              : null;

    if (!next) return;
    event.preventDefault();
    setActive(next);
    tablist.current
      ?.querySelector<HTMLButtonElement>(`#${CSS.escape(tabId(next))}`)
      ?.focus();
  }

  return (
    <section id="tracks" className="bg-background relative overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0">
        <Image
          src={tracksPrizesFaq}
          alt=""
          sizes="100vw"
          placeholder="blur"
          className="h-auto w-full"
        />
        <div className="scene-ceiling-fade scene-ceiling-fade-tunnel" />
        <div className="scene-floor-fade scene-floor-fade-tunnel" />
      </div>

      <div className="relative px-5 py-20 sm:px-6 sm:py-28">
        <h2 className="sr-only">Schedule and challenge tracks</h2>

        <div
          ref={tablist}
          role="tablist"
          aria-label="Schedule and challenge tracks"
          onKeyDown={onKeyDown}
          className="flex flex-wrap justify-center gap-3"
        >
          {TABS.map(({ id, label }) => {
            const selected = id === active;
            return (
              <button
                key={id}
                id={tabId(id)}
                role="tab"
                type="button"
                aria-selected={selected}
                aria-controls={panelId(id)}
                // Only the selected tab is in the tab order; the arrows reach
                // the others.
                tabIndex={selected ? 0 : -1}
                onClick={() => setActive(id)}
                style={{ clipPath: NOTCH }}
                className={`font-sans px-6 py-3.5 text-[12px] leading-none tracking-[0.14em] uppercase transition-colors sm:px-8 ${
                  selected
                    ? "bg-white text-[#05070a]"
                    : "bg-white/8 text-white/70 hover:bg-white/15 hover:text-white"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/*
          The board itself: a translucent plate over the artwork rather than
          type straight onto it. The plate's hexagon sits dead centre and its
          walkway is the brightest thing in the scene, so unbacked text would
          be fighting both of them for the same pixels.
        */}
        <div
          style={{ clipPath: NOTCH_PANEL }}
          className="mx-auto mt-10 max-w-[1100px] bg-white/12 p-px"
        >
          <div
            style={{ clipPath: NOTCH_PANEL }}
            className="bg-[#05030a]/88 px-5 py-10 backdrop-blur-[3px] sm:px-10 sm:py-14"
          >
            <div
              role="tabpanel"
              id={panelId("schedule")}
              aria-labelledby={tabId("schedule")}
              hidden={active !== "schedule"}
            >
              {schedule}
            </div>

            <div
              role="tabpanel"
              id={panelId("tracks")}
              aria-labelledby={tabId("tracks")}
              hidden={active !== "tracks"}
            >
              {tracks}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const NOTCH_PANEL =
  "polygon(24px 0, 100% 0, 100% calc(100% - 24px), calc(100% - 24px) 100%, 0 100%, 0 24px)";
