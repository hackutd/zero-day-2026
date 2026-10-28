import "server-only";

import sharp from "sharp";

import { logoSrc } from "@/lib/format";

/**
 * How a sponsor's logo sits on the night-sky sponsor board. Measured only: the
 * file itself is always shown exactly as the sponsor supplied it.
 *
 * Organizers upload whatever the sponsor sent - black wordmarks on transparent
 * (NVIDIA, Hugging Face), files with a white backdrop baked in (Goldman Sachs),
 * white marks (AT&T), and every amount of empty padding. Two things are read
 * off each file so the board can present them evenly without touching them:
 *
 *  - `plate`: a colour to mount the logo on, or null. A logo that does not
 *    read on the dark sky gets white, the background every brand's primary logo is
 *    drawn for. A file with a backdrop baked in gets that backdrop's own
 *    colour, so the plate and the file meet without a seam.
 *  - `box`: where the logo actually is in the file, so empty margins can be
 *    cropped by layout and every logo sized by its real shape. Only margins
 *    that look identical once cropped - transparent ones, or a backdrop on a
 *    plate of the same colour - are ever cropped.
 */
export type LogoFit = {
  plate: string | null;
  /** The logo's extent in the file, as fractions of its width and height. */
  box: { x: number; y: number; width: number; height: number };
  /** The file's own pixel size, for next/image. */
  width: number;
  height: number;
  /** How much of `box` is ink (0-1), so dense and thin marks can be evened out. */
  coverage: number;
};

// The board's screen: the hero's night sky (descent/sky-2x.webp), averaged
// over the part `.sponsor-board__screen` in globals.css shows.
const SCREEN = luminance(2, 22, 27);

export async function sponsorLogoFit(logoUrl: string): Promise<LogoFit | null> {
  const src = logoSrc(logoUrl);
  if (!src) return null;

  // Logo URLs are versioned by the backend, so a cached copy never goes stale.
  const res = await fetch(src, { cache: "force-cache" });
  if (!res.ok) throw new Error(`GET ${src} failed: ${res.status}`);

  const file = sharp(Buffer.from(await res.arrayBuffer()));
  const { width = 0, height = 0 } = await file.metadata();
  const { data, info } = await file
    .ensureAlpha()
    .resize(256, 256, { fit: "inside", withoutEnlargement: true })
    .raw()
    .toBuffer({ resolveWithObject: true });

  const measured = measure(new Uint8Array(data), info.width, info.height);
  return measured && { ...measured, width, height };
}

function measure(px: Uint8Array, w: number, h: number) {
  const at = (x: number, y: number) => (y * w + x) * 4;
  const rgb = (i: number) => [px[i], px[i + 1], px[i + 2]];
  const near = (i: number, c: number[]) =>
    Math.hypot(px[i] - c[0], px[i + 1] - c[1], px[i + 2] - c[2]) <= 40;

  const edge: number[] = [];
  for (let x = 0; x < w; x++) edge.push(at(x, 0), at(x, h - 1));
  for (let y = 1; y < h - 1; y++) edge.push(at(0, y), at(w - 1, y));

  if (edge.every((i) => px[i + 3] > 200)) {
    // A backdrop baked into the file: the colour most of its edge shares.
    // Counted along the whole edge, not at the corners, because a mark can
    // run into a corner - Toyota's red block takes two of its four.
    const corners = [at(0, 0), at(w - 1, 0), at(0, h - 1), at(w - 1, h - 1)];
    const [backdrop, count] = corners
      .map((i) => rgb(i))
      .map((c) => [c, edge.filter((i) => near(i, c)).length] as const)
      .reduce((best, next) => (next[1] > best[1] ? next : best));

    // No one colour: the file is a picture, shown whole as a tile.
    if (count < edge.length / 2) return { plate: null, box: FULL, coverage: 1 };

    // The plate takes the backdrop's own colour, so the file's margins can be
    // cropped and the logo looks exactly as it does in the file.
    const isInk = (i: number) => !near(i, backdrop);
    return { plate: hex(backdrop), ...inkExtent(px, w, h, isInk) };
  }

  const isInk = (i: number) => px[i + 3] > 128;
  const extent = inkExtent(px, w, h, isInk);

  // Plate the logo if more than a sliver of its ink would vanish on the sky.
  let ink = 0;
  let lost = 0;
  for (let i = 0; i < px.length; i += 4) {
    if (!isInk(i)) continue;
    ink++;
    if (contrast(luminance(px[i], px[i + 1], px[i + 2]), SCREEN) < 3) lost++;
  }
  return { plate: lost > ink * 0.15 ? "#ffffff" : null, ...extent };
}

function hex(c: number[]): string {
  return `#${c.map((v) => Math.round(v).toString(16).padStart(2, "0")).join("")}`;
}

const FULL = { x: 0, y: 0, width: 1, height: 1 };

/**
 * The bounding box of the ink, as fractions, and the share of it that is ink.
 * Rows and columns with only a stray pixel or two don't count - an
 * anti-aliased corner left at a file's edge would otherwise set the box - and
 * the box is padded a little, because it was measured on a downscaled copy.
 */
function inkExtent(
  px: Uint8Array,
  w: number,
  h: number,
  isInk: (i: number) => boolean,
) {
  const rows = new Array<number>(h).fill(0);
  const cols = new Array<number>(w).fill(0);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (!isInk((y * w + x) * 4)) continue;
      rows[y]++;
      cols[x]++;
    }
  }
  const solid = (n: number) => n >= 3;
  const top = rows.findIndex(solid);
  const left = cols.findIndex(solid);
  if (top < 0 || left < 0) return { box: FULL, coverage: 1 };
  const bottom = rows.findLastIndex(solid);
  const right = cols.findLastIndex(solid);

  let ink = 0;
  for (let y = top; y <= bottom; y++) {
    for (let x = left; x <= right; x++) if (isInk((y * w + x) * 4)) ink++;
  }

  const x0 = Math.max(0, left - 2) / w;
  const y0 = Math.max(0, top - 2) / h;
  const x1 = Math.min(w, right + 3) / w;
  const y1 = Math.min(h, bottom + 3) / h;
  return {
    box: { x: x0, y: y0, width: x1 - x0, height: y1 - y0 },
    coverage: ink / ((right - left + 1) * (bottom - top + 1)),
  };
}

/** WCAG relative luminance of an sRGB colour. */
function luminance(r: number, g: number, b: number): number {
  const lin = (c: number) => {
    const v = c / 255;
    return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

function contrast(a: number, b: number): number {
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}
