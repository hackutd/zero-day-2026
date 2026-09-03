"use client";

import { useState } from "react";

import type { ScheduleItem } from "@/lib/types";

/** All event dates and times are displayed in the hackathon's local zone. */
const EVENT_TIME_ZONE = "America/Chicago";

const dayKeyFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  timeZone: EVENT_TIME_ZONE,
});

const dayLabelFormatter = new Intl.DateTimeFormat("en-US", {
  weekday: "long",
  month: "short",
  day: "numeric",
  timeZone: EVENT_TIME_ZONE,
});

const timeFormatter = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
  timeZone: EVENT_TIME_ZONE,
});

const TAG_STYLES: Record<string, string> = {
  required: "bg-accent-magenta border-accent-magenta text-white",
  sponsor: "border-cyan/40 text-cyan",
  "company events": "border-cyan/40 text-cyan",
  food: "border-accent-soft/40 text-accent-soft",
  workshop: "border-magenta/40 text-magenta",
  workshops: "border-magenta/40 text-magenta",
  social: "border-muted/40 text-muted",
  "for fun": "border-muted/40 text-muted",
};

const FALLBACK_TAG_STYLE = "border-border-hairline text-text-muted";

type TagOption = { key: string; label: string };
type ScheduleDay = {
  key: string;
  date: Date | null;
  events: ScheduleItem[];
};

/**
 * Interactive filter over schedule data fetched by the page's Server
 * Component. The API key stays on the server; only serializable event rows
 * cross into this Client Component.
 */
export function DayOfSchedule({
  schedule,
  unavailable = false,
}: {
  schedule: ScheduleItem[];
  unavailable?: boolean;
}) {
  const [filter, setFilter] = useState<string | null>(null);
  const tags = scheduleTags(schedule);
  const days = groupByDay(schedule);

  return (
    // No heading of its own: this is a tab panel, and the tab that opens it is
    // the heading. See components/event-board.tsx.
    <div className="mx-auto max-w-[1000px]">
      <p className="font-sans text-text-muted text-center text-[13px] leading-[1.6] tracking-[0.04em]">
        Day-of schedule, all times CT. Events are subject to change.
      </p>

      {schedule.length === 0 ? (
        <EmptySchedule unavailable={unavailable} />
      ) : (
        <>
          {tags.length > 0 && (
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
              {tags.map((tag) => (
                <FilterChip
                  key={tag.key}
                  label={tag.label}
                  active={filter === tag.key}
                  onClick={() => setFilter(filter === tag.key ? null : tag.key)}
                />
              ))}
            </div>
          )}

          <div className="mt-10 grid gap-x-12 gap-y-10 md:grid-cols-2">
            {days.map((day, dayIndex) => {
              const shown = filter
                ? day.events.filter((event) =>
                    event.tags.some((tag) => normalizeTag(tag) === filter),
                  )
                : day.events;

              return (
                <div key={day.key}>
                  <div className="border-border-hairline flex items-baseline gap-3 border-b pb-3">
                    <h3 className="font-elevon text-[15px] leading-none font-extrabold tracking-[0.08em] text-white uppercase">
                      {day.date ? `Day ${dayIndex + 1}` : "TBA"}
                    </h3>
                    <span className="font-sans text-text-dim text-[12px] tracking-[0.12em] uppercase">
                      {day.date
                        ? dayLabelFormatter.format(day.date)
                        : "Date to be announced"}
                    </span>
                  </div>

                  {shown.length === 0 ? (
                    <p className="font-sans text-text-dim mt-6 text-[13px]">
                      Nothing tagged {tagLabel(tags, filter)} on this day.
                    </p>
                  ) : (
                    <ul className="mt-2">
                      {shown.map((event, eventIndex) => {
                        const time = formatEventTime(event.start_time);
                        return (
                          <ScheduleRow
                            key={event.id}
                            event={event}
                            time={time}
                            showTime={
                              eventIndex === 0 ||
                              time !==
                                formatEventTime(
                                  shown[eventIndex - 1].start_time,
                                )
                            }
                          />
                        );
                      })}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

function EmptySchedule({ unavailable }: { unavailable: boolean }) {
  return (
    <p className="font-sans text-text-dim mt-10 text-center text-[13px] leading-relaxed">
      {unavailable
        ? "The live schedule is temporarily unavailable. Please check back soon."
        : "The event schedule has not been published yet. Check back soon."}
    </p>
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

function ScheduleRow({
  event,
  time,
  showTime,
}: {
  event: ScheduleItem;
  time: string;
  showTime: boolean;
}) {
  const tags = event.tags.map((tag) => tag.trim()).filter(Boolean);

  return (
    <li className="border-border-hairline flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-dashed py-2.5 last:border-b-0">
      <span
        aria-hidden={!showTime}
        className={`font-elevon w-[68px] shrink-0 text-[13px] leading-none font-medium tabular-nums ${
          showTime ? "text-white" : "text-transparent"
        }`}
      >
        {time}
      </span>

      <h4 className="font-sans text-[13px] leading-[1.3] font-medium text-white sm:text-[14px]">
        {event.event_name}
      </h4>
      {tags.map((tag) => (
        <TagChip key={normalizeTag(tag)} tag={tag} />
      ))}

      {event.location && (
        <p className="font-sans text-text-dim ml-auto text-[11px] tracking-[0.04em]">
          {event.location}
        </p>
      )}
    </li>
  );
}

function TagChip({ tag }: { tag: string }) {
  return (
    <span
      className={`font-sans border px-2 py-[3px] text-[10px] leading-none tracking-[0.12em] uppercase ${tagStyle(tag)}`}
    >
      {tag}
    </span>
  );
}

function groupByDay(schedule: ScheduleItem[]): ScheduleDay[] {
  const days = new Map<string, ScheduleDay>();

  for (const event of schedule) {
    const date = parseDate(event.start_time);
    const key = date ? formatDayKey(date) : "tba";
    const day = days.get(key) ?? { key, date, events: [] };
    day.events.push(event);
    days.set(key, day);
  }

  return [...days.values()];
}

function scheduleTags(schedule: ScheduleItem[]): TagOption[] {
  const tags = new Map<string, string>();

  for (const event of schedule) {
    for (const rawTag of event.tags) {
      const label = rawTag.trim();
      const key = normalizeTag(label);
      if (key && !tags.has(key)) tags.set(key, label);
    }
  }

  return [...tags].map(([key, label]) => ({ key, label }));
}

function parseDate(value: string): Date | null {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDayKey(date: Date): string {
  const parts = dayKeyFormatter.formatToParts(date);
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((item) => item.type === type)?.value ?? "";
  return `${part("year")}-${part("month")}-${part("day")}`;
}

function formatEventTime(value: string): string {
  const date = parseDate(value);
  if (!date) return "TBA";
  return timeFormatter.format(date).replace(/\s/g, "").toLowerCase();
}

function normalizeTag(tag: string): string {
  return tag.trim().toLowerCase();
}

function tagStyle(tag: string): string {
  return TAG_STYLES[normalizeTag(tag)] ?? FALLBACK_TAG_STYLE;
}

function tagLabel(tags: TagOption[], key: string | null): string {
  return tags.find((tag) => tag.key === key)?.label ?? "this category";
}
