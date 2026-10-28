/**
 * The steel that holds the sponsor board up: a truss head bolted under the
 * board, a monopole with a service ladder and a junction box, slack cable, and
 * a red aviation beacon at each end of the head beam.
 *
 * Drawn rather than painted so it scales with the board at any width and can
 * take the board's light: the top faces catch a cyan light, and the
 * whole thing sinks into the dark below (`.billboard-pole` in globals.css).
 * Decoration only, so it is hidden from screen readers.
 */
const RUNGS = Array.from({ length: 16 }, (_, i) => 70 + i * 16);

export function BillboardPole() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 1000 250"
      className="billboard-pole"
      preserveAspectRatio="xMidYMin meet"
    >
      <defs>
        <pattern
          id="pole-hazard"
          width="10"
          height="10"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(45)"
        >
          <rect width="10" height="10" fill="#0e1015" />
          <rect width="5" height="10" fill="#ffc24b" />
        </pattern>
        <filter id="pole-glow" x="-200%" y="-200%" width="500%" height="500%">
          <feGaussianBlur stdDeviation="4" />
        </filter>
      </defs>

      {/* Head beam: an I-beam the width of the board's middle, then its flange. */}
      <rect x="40" y="0" width="920" height="16" fill="#2b2f39" />
      <rect
        x="40"
        y="0"
        width="920"
        height="1.5"
        fill="#4fbdd6"
        opacity="0.55"
      />
      <rect x="60" y="16" width="880" height="8" fill="#0e1015" />

      {/* Truss: two braces down to the pole, a tie, and the web between. */}
      <g stroke="#2b2f39" strokeLinecap="square">
        <line x1="110" y1="24" x2="486" y2="176" strokeWidth="13" />
        <line x1="890" y1="24" x2="514" y2="176" strokeWidth="13" />
        <line x1="274" y1="90" x2="726" y2="90" strokeWidth="7" />
        <polyline
          points="274,90 380,24 500,90 620,24 726,90"
          fill="none"
          strokeWidth="5"
        />
      </g>

      {/* Slack cable from the head to the junction box. */}
      <g fill="none" stroke="#0b0910" strokeWidth="3">
        <path d="M205 22 C 240 150, 370 130, 424 214" />
        <path d="M812 22 C 790 140, 640 120, 548 196" />
      </g>

      {/* The pole, tapering slightly to the ground, with two collars. */}
      <path d="M470 24 L530 24 L541 330 L459 330 Z" fill="#1c1f27" />
      <path
        d="M470 24 L459 330"
        stroke="#4fbdd6"
        strokeWidth="1.5"
        opacity="0.35"
      />
      <rect x="461" y="24" width="78" height="12" fill="#2b2f39" />
      <rect x="463" y="170" width="74" height="14" fill="#2b2f39" />

      {/* Service ladder up the right side. */}
      <g stroke="#2b2f39" strokeWidth="3">
        <line x1="550" y1="60" x2="552" y2="330" />
        <line x1="570" y1="60" x2="573" y2="330" />
        {RUNGS.map((y) => (
          <line key={y} x1="551" y1={y} x2="571" y2={y} strokeWidth="2" />
        ))}
      </g>

      {/* Junction box, with a hazard band and its status light. */}
      <rect
        x="414"
        y="206"
        width="40"
        height="52"
        rx="3"
        fill="#16181f"
        stroke="#2b2f39"
        strokeWidth="2"
      />
      <rect x="416" y="246" width="36" height="8" fill="url(#pole-hazard)" />
      <circle
        className="billboard-pole__status"
        cx="434"
        cy="220"
        r="7"
        fill="#22e0ff"
        filter="url(#pole-glow)"
      />
      <circle cx="434" cy="220" r="2.5" fill="#d4faff" />

      {/* Aviation beacons at the ends of the head beam. */}
      {[52, 948].map((cx) => (
        <g key={cx} className="billboard-pole__beacon">
          <circle
            cx={cx}
            cy="8"
            r="9"
            fill="#ff2e4d"
            filter="url(#pole-glow)"
          />
          <circle cx={cx} cy="8" r="3" fill="#ffd0d6" />
        </g>
      ))}
    </svg>
  );
}
