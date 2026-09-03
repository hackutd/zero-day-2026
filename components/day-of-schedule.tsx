"use client";

import { useState } from "react";

/**
 * The day-of schedule, with a filter across the kinds of thing on the grid.
 *
 * TODO(organizers): this is last year's grid, kept so the section is real and
 * laid out. HARP already serves the live version - `getSchedule()` in
 * `lib/api.ts` returns `ScheduleItem[]` with `event_name`, `start_time`,
 * `location` and `tags` - and the shape below is deliberately the same four
 * fields so swapping the constant for a fetch is the only change needed.
 *
 * A client component, unlike the FAQ next to it: the filter is real state, and
 * `<details>`-style progressive enhancement has no equivalent here. It ships
 * the whole grid in the HTML either way, so a reader who never touches a filter
 * pays only for the markup they would have got anyway.
 */

/** The five kinds of thing on the grid, in the order the filter lists them. */
const TAGS = ["Required", "Sponsor", "Food", "Workshop", "Social"] as const;

type Tag = (typeof TAGS)[number];

/**
 * One chip style per tag, from the theme tokens rather than new colours.
 *
 * Required is the only solid one - it is the set of things a hacker cannot skip
 * (check-in, ceremonies, the submission deadline), so it should read as louder
 * than the optional rest at a glance rather than only on inspection.
 */
const TAG_STYLES: Record<Tag, string> = {
  Required: "bg-accent-magenta border-accent-magenta text-white",
  Sponsor: "border-cyan/40 text-cyan",
  Food: "border-accent-soft/40 text-accent-soft",
  Workshop: "border-magenta/40 text-magenta",
  Social: "border-muted/40 text-muted",
};

type Event = { time: string; name: string; tag: Tag; location: string };

/**
 * Times are the event's own local clock, kept as written rather than as
 * timestamps: the grid is read on a phone in the building, so a string that
 * always says what the printed schedule says beats one that a device in the
 * wrong timezone can quietly shift. `lib/format.ts` is where the real
 * conversion lives once these come from HARP.
 *
 * Building codes are normalised to ECSW - last year's sheet had it as both
 * ECSW and ESCW, and only one of those is a building at UTD.
 */
const DAYS: { label: string; weekday: string; events: Event[] }[] = [
  {
    label: "Day 1",
    weekday: "Saturday",
    events: [
      {
        time: "8:00am",
        name: "Hacker Check-In",
        tag: "Required",
        location: "ECSW Front Door",
      },
      {
        time: "8:00am",
        name: "Sponsor Fair",
        tag: "Sponsor",
        location: "ECSW Atrium",
      },
      {
        time: "10:45am",
        name: "Opening Ceremony",
        tag: "Required",
        location: "ATC Lecture Hall (ATC 1.102)",
      },
      {
        time: "12:45pm",
        name: "Hacking Starts",
        tag: "Required",
        location: "UTD",
      },
      {
        time: "1:00pm",
        name: "Lunch",
        tag: "Food",
        location: "ECSW Courtyard",
      },
      {
        time: "1:45pm",
        name: "Team Building",
        tag: "Social",
        location: "ECSW 1.355",
      },
      {
        time: "2:00pm",
        name: "PNC Workshop",
        tag: "Workshop",
        location: "ECSW 1.315",
      },
      {
        time: "2:55pm",
        name: "T-Mobile Workshop",
        tag: "Workshop",
        location: "ECSW 1.315",
      },
      {
        time: "3:45pm",
        name: "Goldman Sachs Workshop",
        tag: "Workshop",
        location: "ECSW 1.355",
      },
      {
        time: "4:40pm",
        name: "State Farm Workshop",
        tag: "Workshop",
        location: "ECSW 1.355",
      },
      {
        time: "5:35pm",
        name: "NMC² Workshop",
        tag: "Workshop",
        location: "ECSW 1.355",
      },
      {
        time: "6:30pm",
        name: "EOG Workshop",
        tag: "Workshop",
        location: "ECSW 1.355",
      },
      {
        time: "7:30pm",
        name: "MLH Workshop",
        tag: "Workshop",
        location: "ECSW 1.355",
      },
      {
        time: "7:30pm",
        name: "Dinner",
        tag: "Food",
        location: "ECSW Atrium",
      },
      {
        time: "8:00pm",
        name: "Typing Competition",
        tag: "Social",
        location: "ECSW 1.365",
      },
      {
        time: "8:30pm",
        name: "WEHack Workshop",
        tag: "Workshop",
        location: "ECSW 1.355",
      },
      {
        time: "9:30pm",
        name: "Karaoke",
        tag: "Social",
        location: "ECSW 1.355",
      },
      {
        time: "10:00pm",
        name: "Hackathon Organizer Meetup",
        tag: "Social",
        location: "ECSW 1.315",
      },
      {
        time: "10:45pm",
        name: "Estimathon",
        tag: "Social",
        location: "ECSW 1.365",
      },
      {
        time: "11:30pm",
        name: "Midnight Snack",
        tag: "Food",
        location: "ECSW Atrium",
      },
    ],
  },
  {
    label: "Day 2",
    weekday: "Sunday",
    events: [
      {
        time: "12:00am",
        name: "Register your team on Devpost",
        tag: "Required",
        location: "Devpost",
      },
      {
        time: "12:00am",
        name: "HackUTD Olympics",
        tag: "Social",
        location: "ECSW 1.315",
      },
      {
        time: "12:00am",
        name: "Dev Hours",
        tag: "Social",
        location: "ECSW 1.365",
      },
      {
        time: "12:30am",
        name: "Worlds Watch Party",
        tag: "Social",
        location: "ECSW 1.355",
      },
      {
        time: "9:00am",
        name: "Dog Petting",
        tag: "Social",
        location: "ECSW 2.325",
      },
      {
        time: "9:30am",
        name: "Breakfast",
        tag: "Food",
        location: "ECSW Atrium",
      },
      {
        time: "12:00pm",
        name: "Project Submission Deadline",
        tag: "Required",
        location: "Devpost",
      },
      {
        time: "12:00pm",
        name: "Lunch",
        tag: "Food",
        location: "ECSW Atrium",
      },
      {
        time: "1:00pm",
        name: "Project Expo",
        tag: "Required",
        location: "ECSW and ECSS",
      },
      {
        time: "5:00pm",
        name: "Closing Ceremony",
        tag: "Required",
        location: "ATC Lecture Hall (ATC 1.102)",
      },
    ],
  },
];

export function DayOfSchedule() {
  const [filter, setFilter] = useState<Tag | null>(null);

  return (
    // No heading of its own: this is a tab panel, and the tab that opens it is
    // the heading. See components/event-board.tsx.
    <div className="mx-auto max-w-[1000px]">
      <p className="font-sans text-text-muted text-center text-[13px] leading-[1.6] tracking-[0.04em]">
        Day-of schedule, all times CST. Tentative until check-in; more events
        are still landing.
      </p>

      {/*
          `aria-pressed` rather than a radio group: these read as toggles, and
          the "All" chip is the same control unpressed. One live filter at a
          time, so pressing a second replaces the first.
        */}
      <div
        role="group"
        aria-label="Filter the schedule by kind of event"
        className="mt-9 flex flex-wrap justify-center gap-2"
      >
        <FilterChip
          label="All"
          active={filter === null}
          onClick={() => setFilter(null)}
        />
        {TAGS.map((tag) => (
          <FilterChip
            key={tag}
            label={tag}
            active={filter === tag}
            onClick={() => setFilter(filter === tag ? null : tag)}
          />
        ))}
      </div>

      {/*
        The two days run as columns from md up rather than one column of
        thirty rows. Saturday is twice Sunday's length, so the columns are
        uneven - but a ragged bottom edge costs nothing next to halving how
        far the panel reaches down the page.
      */}
      <div className="mt-10 grid gap-x-12 gap-y-10 md:grid-cols-2">
        {DAYS.map(({ label, weekday, events }) => {
          const shown = filter
            ? events.filter((e) => e.tag === filter)
            : events;

          return (
            <div key={label}>
              <div className="border-border-hairline flex items-baseline gap-3 border-b pb-3">
                <h3 className="font-elevon text-[15px] leading-none font-extrabold tracking-[0.08em] text-white uppercase">
                  {label}
                </h3>
                <span className="font-sans text-text-dim text-[12px] tracking-[0.12em] uppercase">
                  {weekday}
                </span>
              </div>

              {shown.length === 0 ? (
                <p className="font-sans text-text-dim mt-6 text-[13px]">
                  Nothing tagged {filter} on {weekday.toLowerCase()}.
                </p>
              ) : (
                <ul className="mt-2">
                  {shown.map((event, i) => (
                    <ScheduleRow
                      key={`${event.time}-${event.name}`}
                      event={event}
                      // A repeated time is printed once. Four things start at
                      // midnight on day two, and stamping every row with it
                      // makes the column look like the noise it is.
                      showTime={event.time !== shown[i - 1]?.time}
                    />
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`font-sans focus-visible:outline-accent-magenta border px-3.5 py-1.5 text-[11px] leading-none tracking-[0.12em] uppercase transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 ${
        active
          ? "border-white bg-white text-[#05070a]"
          : "border-border-hairline text-text-muted hover:border-white/40 hover:text-white"
      }`}
    >
      {label}
    </button>
  );
}

/**
 * One row, one line: time, name, tag, then the room pushed to the right edge.
 * The room used to sit on a second line under the name, which read well and
 * made the panel twice as tall as it needed to be. It still wraps to its own
 * line when the column is too narrow to hold both.
 */
function ScheduleRow({ event, showTime }: { event: Event; showTime: boolean }) {
  return (
    <li className="border-border-hairline flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-dashed py-2.5 last:border-b-0">
      {/*
        `tabular-nums` so the times stack in a straight column - Elevon's
        default figures are proportional, which makes a 1 narrower than a 3 and
        leaves the colons wandering down the page.
      */}
      <span
        className={`font-elevon w-[68px] shrink-0 text-[13px] leading-none font-medium tabular-nums ${
          showTime ? "text-white" : "text-transparent"
        }`}
      >
        {event.time}
      </span>

      <h4 className="font-sans text-[13px] leading-[1.3] font-medium text-white sm:text-[14px]">
        {event.name}
      </h4>
      <TagChip tag={event.tag} />

      <p className="font-sans text-text-dim ml-auto text-[11px] tracking-[0.04em]">
        {event.location}
      </p>
    </li>
  );
}

function TagChip({ tag }: { tag: Tag }) {
  return (
    <span
      className={`font-sans border px-2 py-[3px] text-[10px] leading-none tracking-[0.12em] uppercase ${TAG_STYLES[tag]}`}
    >
      {tag}
    </span>
  );
}
