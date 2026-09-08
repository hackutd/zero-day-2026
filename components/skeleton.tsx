/**
 * The block a section shows while its HARP request is still in flight.
 *
 * Deliberately shape-only: no text, `aria-hidden`, and the surrounding section
 * carries `aria-busy` so a screen reader is told "loading" once rather than
 * being read a wall of empty boxes. The shimmer is a background-position
 * animation on a gradient, which the compositor can run without repainting,
 * and `globals.css` stops it under `prefers-reduced-motion` where it becomes a
 * flat tint instead.
 */
export function Skeleton({ className = "" }: { className?: string }) {
  return <div aria-hidden className={`skeleton ${className}`} />;
}

/** A stack of rows, for the schedule and FAQ columns. */
export function SkeletonRows({
  count,
  className = "",
}: {
  count: number;
  className?: string;
}) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: count }, (_, i) => (
        <Skeleton key={i} className="h-[52px] w-full rounded-[3px]" />
      ))}
    </div>
  );
}
