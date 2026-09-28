"""Trace the sky out of the skyline and alley plates. Requires Pillow.

Writes design-sources/backgrounds/masks/01-prehero-sky.png and
02-hero-sky.png: white where the sky is, black where the city is.
upscale-backgrounds.py uses them to cut each city out as its own layer and to
build the one sky that drifts behind both (SkyScene in app/page.tsx).

The skyline (01):

The skyline is traced column by column: the sky is everything above the first
solid run of building paint. Building paint is navy - blue well above green -
where the sky is neutral black, white stars, or teal cloud with green tracking
blue, so the two separate on colour alone. A 1-D closing then fills the narrow
notches that rows of lit windows punch into a roof without growing any edge.

Three dark towers carry lit windows right up to their roofs, so the run starts
too low on them; their tops are measured off the plate and pinned in TOPS. A
dark cloud bump over the skybridge reads as a roof; FLATTEN levels it.

The skybridge's windows look through to the sky too - left of the far tower -
so they are cut as a second pass: inside the opening band, sky is the neutral
or teal black, and the white of its stars, where the bridge's frame and rail
are violet. A closing tidies what is left of the stars' glow, and the
bridge's own blue - the thin line under its railing - is taken back out after
it, since the closing is wide enough to paint straight over a line that thin.

The alley (02): its sky is the black between the towers above the magenta
horizon glow, the second skybridge's windows, and the gaps between the cables.
The cables' bodies are the same pure black as that sky, so colour alone cannot
tell them apart - but every cable carries a magenta highlight, and anything
within a cable's width of one is kept as city. That leaves a thin still strip
of sky along each cable, where a drifting star is hidden a few pixels early.
Pieces smaller than a window are dropped, which keeps dark window cells and
shadows in the buildings out of it; the one building face big enough to pass
is kept by hand in ALLEY_KEEP.
"""

import collections


from pathlib import Path

from PIL import Image, ImageChops, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
BACKGROUNDS = ROOT / "design-sources" / "backgrounds"
SOURCE = BACKGROUNDS / "01-prehero.png"
MASK = BACKGROUNDS / "masks" / "01-prehero-sky.png"
ALLEY = BACKGROUNDS / "02-hero.png"
ALLEY_MASK = BACKGROUNDS / "masks" / "02-hero-sky.png"

RUN = 8  # consecutive building pixels that count as a roof
CLOSE = 9  # half-width of the notch-filling closing, in columns
# (x0, x1, top): the three tower tops the run misses.
TOPS = [(52, 208, 182), (626, 843, 243), (1785, 1919, 218)]
# (x0, x1): columns levelled to their neighbours' skyline.
FLATTEN = [(1120, 1160)]
# The bridge's window openings: rows, and the run of them that sees sky.
WINDOWS_Y = (916, 955)
WINDOWS_X = (880, 1560)
# The strip of sky under the bridge, between its underside and the panel's foot.
UNDER_BRIDGE_Y = (1045, 1080)
UNDER_BRIDGE_X = (700, 1920)
# The alley's second skybridge: its span, and the rows its top rim can be in.
ALLEY_BRIDGE_X = (1000, 1460)
ALLEY_BRIDGE_TOP = (25, 46)
# The alley's open sky: the box it lies in, the cable guard, the smallest piece.
ALLEY_BOX = (860, 0, 1455, 420)
CABLE_GUARD = 15
MIN_PIECE = 600
# Building faces painted in the sky's own black, kept as city: the tower face
# left of the navy tower under the second skybridge.
ALLEY_KEEP = [(1000, 140, 1075, 360)]


def building(r: int, g: int, b: int) -> bool:
    return b >= 4 and b - g >= 4 and g <= 0.4 * b


def bridge_paint(image: Image.Image, x0: int, x1: int, y0: int, y1: int) -> Image.Image:
    """The skybridges' own blue - the line under each railing, the frames -
    inside a box. The closings that take back the stars' glow are wide enough
    to bridge a line a few pixels thick, so this goes back out after them."""
    paint = Image.new("L", image.size, 0)
    pp, ip = paint.load(), image.load()
    for y in range(y0, y1):
        for x in range(x0, x1):
            r, g, b = ip[x, y]
            if b - g >= 18:
                pp[x, y] = 255
    return paint


def square_up(mask: Image.Image, x0: int, x1: int, y0: int, y1: int) -> Image.Image:
    """Snap each window opening in a box to a clean rectangle.

    The openings are rectangles, but their antialiased rims fall either side
    of the colour test pixel by pixel, so a traced edge comes out ragged. Each
    piece that mostly fills its bounding box is redrawn as a rectangle, every
    side at the median of where that side was traced - so a stray pixel, or a
    star's glow rounding a corner, cannot drag it. A piece that is not
    rectangular (a building edge through it) is left as traced.

    The line under the railing splits each window into a thin strip above and
    the opening below. The strip takes the opening's left and right edges, so
    the line between them reads as one even bar rather than two traced ends.
    """
    mp = mask.load()
    seen: set[tuple[int, int]] = set()
    rects: list[tuple[list[tuple[int, int]], list[int]]] = []
    for y in range(y0, y1):
        for x in range(x0, x1):
            if not mp[x, y] or (x, y) in seen:
                continue
            piece, queue = [], collections.deque([(x, y)])
            seen.add((x, y))
            while queue:
                cx, cy = queue.popleft()
                piece.append((cx, cy))
                for nx, ny in ((cx + 1, cy), (cx - 1, cy), (cx, cy + 1), (cx, cy - 1)):
                    if x0 <= nx < x1 and y0 <= ny < y1 and (nx, ny) not in seen and mp[nx, ny]:
                        seen.add((nx, ny))
                        queue.append((nx, ny))
            xs = [p[0] for p in piece]
            ys = [p[1] for p in piece]
            box = (max(xs) - min(xs) + 1) * (max(ys) - min(ys) + 1)
            if len(piece) < 40 or len(piece) / box < 0.75:
                continue
            rows = collections.defaultdict(list)
            cols = collections.defaultdict(list)
            for px_, py_ in piece:
                rows[py_].append(px_)
                cols[px_].append(py_)

            def median(values: list[int]) -> int:
                return sorted(values)[len(values) // 2]

            rects.append(
                (
                    piece,
                    [
                        median([min(v) for v in rows.values()]),
                        median([max(v) for v in rows.values()]),
                        median([min(v) for v in cols.values()]),
                        median([max(v) for v in cols.values()]),
                    ],
                )
            )

    for _, strip in rects:
        left, right, top, bottom = strip
        for _, below in rects:
            b_left, b_right, b_top, b_bottom = below
            overlap = min(right, b_right) - max(left, b_left)
            if b_top > bottom and b_bottom - b_top > bottom - top and overlap > 0.7 * (right - left):
                strip[0], strip[1] = b_left, b_right
                break

    out = mask.copy()
    op = out.load()
    for piece, (left, right, top, bottom) in rects:
        for px_, py_ in piece:
            op[px_, py_] = 0
        for yy in range(top, bottom + 1):
            for xx in range(left, right + 1):
                op[xx, yy] = 255
    return out


with Image.open(SOURCE) as source:
    plate = source.convert("RGB")
width, height = plate.size
px = plate.load()

skyline = []
for x in range(width):
    run, top = 0, height
    for y in range(height):
        run = run + 1 if building(*px[x, y]) else 0
        if run == RUN:
            top = y - RUN + 1
            break
    skyline.append(top)


def window(values: list[int], k: int, pick) -> list[int]:
    return [pick(values[max(0, i - k) : i + k + 1]) for i in range(len(values))]


skyline = window(skyline, 3, lambda w: sorted(w)[len(w) // 2])  # column jitter
skyline = window(window(skyline, CLOSE, min), CLOSE, max)  # roof notches
for x0, x1, top in TOPS:
    for x in range(x0, x1 + 1):
        skyline[x] = min(skyline[x], top)
for x0, x1 in FLATTEN:
    level = max(skyline[x0 - 2], skyline[x1 + 2])
    for x in range(x0, x1 + 1):
        skyline[x] = level

mask = Image.new("L", (width, height), 0)
mp = mask.load()
for x, top in enumerate(skyline):
    for y in range(top):
        mp[x, y] = 255

windows = Image.new("L", (width, height), 0)
wp = windows.load()
for y in range(*WINDOWS_Y):
    for x in range(*WINDOWS_X):
        r, g, b = px[x, y]
        dark_sky = r <= 4 and b - g <= 12
        star = r > 40 and max(r, g, b) - min(r, g, b) < 40  # white, and its glow
        if dark_sky or star:
            wp[x, y] = 255
windows = windows.filter(ImageFilter.MaxFilter(5)).filter(ImageFilter.MinFilter(5))
windows = ImageChops.subtract(windows, bridge_paint(plate, *WINDOWS_X, *WINDOWS_Y))
windows = square_up(windows, *WINDOWS_X, *WINDOWS_Y)
mask.paste(255, mask=windows)

# The sky between the bridge's underside and the panel's foot: the same test
# as the windows, minus anything green - the glass of the building behind the
# right end is dark green, not sky.
under = Image.new("L", (width, height), 0)
up = under.load()
for y in range(*UNDER_BRIDGE_Y):
    for x in range(*UNDER_BRIDGE_X):
        r, g, b = px[x, y]
        dark_sky = r <= 4 and -4 <= b - g <= 12 and max(r, g, b) < 40
        star = r > 40 and max(r, g, b) - min(r, g, b) < 40
        if dark_sky or star:
            up[x, y] = 255
under = under.filter(ImageFilter.MaxFilter(5)).filter(ImageFilter.MinFilter(5))
under = ImageChops.subtract(
    under, bridge_paint(plate, *UNDER_BRIDGE_X, *UNDER_BRIDGE_Y)
)
mask.paste(255, mask=under)
# A pixel of feather, so the roofline antialiases instead of stair-stepping.
mask.filter(ImageFilter.GaussianBlur(0.8)).save(MASK)
print(f"{MASK.relative_to(ROOT)}: {width} x {height}")


def is_dark_sky(r: int, g: int, b: int) -> bool:
    return max(r, g, b) < 16 and b - g < 8 and r - g < 8


def is_star(r: int, g: int, b: int) -> bool:
    return r > 40 and max(r, g, b) - min(r, g, b) < 40


def is_cable_highlight(r: int, g: int, b: int) -> bool:
    return r > 70 and b > 70 and g < 60 and r > g + 40


with Image.open(ALLEY) as source:
    alley = source.convert("RGB")
apx = alley.load()
x0, y0, x1, y1 = ALLEY_BOX
sky = Image.new("L", alley.size, 0)
highlight = Image.new("L", alley.size, 0)
skp, hp = sky.load(), highlight.load()
for y in range(y0, y1):
    for x in range(x0, x1):
        rgb = apx[x, y]
        if is_dark_sky(*rgb) or is_star(*rgb):
            skp[x, y] = 255
        if is_cable_highlight(*rgb):
            hp[x, y] = 255
sky = sky.filter(ImageFilter.MaxFilter(5)).filter(ImageFilter.MinFilter(5))
guard = highlight.filter(ImageFilter.MaxFilter(2 * CABLE_GUARD + 1))
sky = ImageChops.subtract(sky, guard)
x0, y0, x1, y1 = ALLEY_BOX
sky = ImageChops.subtract(sky, bridge_paint(alley, x0, x1, y0, y1))
# The thinnest cables have no highlight and are barely navy - but the alley's
# real sky is pure black, so any blue at all there is cable.
faint = Image.new("L", alley.size, 0)
fp = faint.load()
for y in range(y0, y1):
    for x in range(x0, x1):
        r, g, b = apx[x, y]
        if b >= 8 and b - max(r, g) >= 8:
            fp[x, y] = 255
faint = faint.filter(ImageFilter.MaxFilter(3))
sky = ImageChops.subtract(sky, faint)
# The bridge's top: carry the sky down to its rim, so the cut meets the
# bridge's own edge instead of stopping a few pixels short. The rim is a
# straight line but its paint is uneven, so it is found per column and the
# cut is squared off at the median row.
skp, fp = sky.load(), faint.load()
top0, top1 = ALLEY_BRIDGE_TOP
rims = []
for x in range(*ALLEY_BRIDGE_X):
    for y in range(top0, top1):
        r, g, b = apx[x, y]
        if b >= 5 and b - g >= 3:
            rims.append(y)
            break
rim = sorted(rims)[len(rims) // 2]
for x in range(*ALLEY_BRIDGE_X):
    if not skp[x, top0]:
        continue
    for y in range(top0, top1):
        skp[x, y] = 255 if y < rim and not fp[x, y] else 0
for box in ALLEY_KEEP:
    sky.paste(0, box)

skp = sky.load()
alley_mask = Image.new("L", alley.size, 0)
amp = alley_mask.load()
seen: set[tuple[int, int]] = set()
for y in range(y0, y1):
    for x in range(x0, x1):
        if not skp[x, y] or (x, y) in seen:
            continue
        piece, queue = [], collections.deque([(x, y)])
        seen.add((x, y))
        while queue:
            cx, cy = queue.popleft()
            piece.append((cx, cy))
            for nx, ny in ((cx + 1, cy), (cx - 1, cy), (cx, cy + 1), (cx, cy - 1)):
                if x0 <= nx < x1 and y0 <= ny < y1 and (nx, ny) not in seen and skp[nx, ny]:
                    seen.add((nx, ny))
                    queue.append((nx, ny))
        if len(piece) >= MIN_PIECE:
            for point in piece:
                amp[point] = 255
alley_mask.filter(ImageFilter.GaussianBlur(0.8)).save(ALLEY_MASK)
print(f"{ALLEY_MASK.relative_to(ROOT)}: {alley.width} x {alley.height}")
