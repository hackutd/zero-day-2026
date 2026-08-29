/**
 * HUD furniture down the left and right edges of the viewport, from the
 * diamante.io reference: a short tick, a run of rotated text, another tick.
 *
 * Fixed rather than per-section, so it frames the whole page as instrument
 * chrome rather than decorating one band of it. It sits below the navbar and
 * the badge in the stack and takes no pointer events, so it can never intercept
 * a click meant for the page.
 *
 * `writing-mode` rather than a rotate transform: rotating would leave the box
 * laid out horizontally and need its width unpicked afterwards, where vertical
 * writing lays the text out correctly to begin with. The left rail is turned a
 * further 180deg so it reads bottom-to-top, which is the convention on that
 * side and keeps both rails reading toward the top of the screen.
 *
 * Hidden below `lg`: on a phone these would crowd the content they are meant to
 * frame, and the same breakpoint already drops the nav's centre pill.
 */

export function EdgeRails() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-30 hidden lg:block"
    >
      <Rail side="left" label="MMXXVI" />
      <Rail side="right" label="HACKUTD" />
    </div>
  );
}

function Rail({ side, label }: { side: "left" | "right"; label: string }) {
  const isLeft = side === "left";
  return (
    <div
      className={`absolute top-1/2 flex -translate-y-1/2 flex-col items-center gap-5 ${
        isLeft ? "left-4" : "right-4"
      }`}
    >
      <Tick />
      <span
        className="font-sans text-[10px] tracking-[0.42em] text-white/45 uppercase"
        style={{
          writingMode: "vertical-rl",
          transform: isLeft ? "rotate(180deg)" : undefined,
        }}
      >
        {label}
      </span>
      <Tick />
    </div>
  );
}

/** The bright little sight-marks that bracket the text in the reference. */
function Tick() {
  return <span className="block h-8 w-px bg-white/70" />;
}
