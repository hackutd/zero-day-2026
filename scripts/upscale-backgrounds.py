"""Create build-ready 2x backgrounds from design sources. Requires Pillow."""

from pathlib import Path

from PIL import Image, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
SOURCE_BACKGROUNDS = ROOT / "design-sources" / "backgrounds"
OUTPUT_BACKGROUNDS = ROOT / "assets" / "images" / "backgrounds"

# The descent's separated layers (`Descent` in app/page.tsx). Each is painted
# on the same 1920x3240 canvas as the flattened plates it replaces, so the
# four line up with no offset when stacked. Most of that canvas is empty for
# the far layers - the sky is black below the skyline and the back buildings
# end at row 2326 - so each is cropped to the rows (or the box) that carry
# paint, and the component positions the crop back at its origin. The front
# layer keeps the full canvas; it is what gives the section its shape.
#
# sky.png has the moon painted out (the export still carried a copy of it
# under moon.png); the layers move at different rates, so a second moon in
# the sky would drift away from the real one as soon as the page scrolls.
DESCENT_LAYERS = {
    "sky.png": (0, 0, 1920, 1250),
    "moon.png": (773, 0, 1641, 626),
    "back-buildings.png": (0, 0, 1920, 2340),
    "front-buildings.png": None,
}

OUTPUT_BACKGROUNDS.mkdir(parents=True, exist_ok=True)
(OUTPUT_BACKGROUNDS / "descent").mkdir(exist_ok=True)


def upscale(original: Image.Image) -> Image.Image:
    size = (original.width * 2, original.height * 2)
    # Pillow resamples RGBA with premultiplied alpha to avoid dark fringes.
    enlarged = original.resize(size, Image.Resampling.LANCZOS)
    sharpened = enlarged.convert("RGB").filter(
        ImageFilter.UnsharpMask(radius=1.2, percent=45, threshold=3)
    )
    if "A" in enlarged.getbands():
        # Sharpen only color; the resampled transparency stays untouched.
        sharpened.putalpha(enlarged.getchannel("A"))
    return sharpened


def save(image: Image.Image, destination: Path, *, exact_alpha: bool) -> None:
    # Lossy, not lossless. These are LANCZOS upscales of 1920px art - there
    # is no detail here that q=90 can lose, and next/image re-encodes them
    # lossily on the way out regardless, so a lossless master only ever cost
    # repo and deploy weight (~23 MiB across the eight plates, against ~3).
    # `alpha_quality=100` keeps the cutouts exact: the forefront car and the
    # carriage are composited over the scene behind them, and a soft alpha
    # edge there shows as a halo.
    image.save(
        destination,
        "WEBP",
        quality=90,
        alpha_quality=100 if exact_alpha else 90,
        method=6,
    )
    with Image.open(destination) as result:
        assert result.size == image.size
        # Most plates are full-frame and their alpha is all-255; libwebp
        # drops a channel like that, which is free and changes nothing. Only
        # a plate with a real cutout - the forefront car, the carriage - has
        # to come back with its alpha intact, and at alpha_quality=100 it
        # comes back byte-exact.
        source_alpha = image.getchannel("A") if "A" in image.getbands() else None
        if source_alpha and source_alpha.getextrema()[0] < 255:
            assert "A" in result.getbands(), f"{destination.name} lost alpha"
            if exact_alpha:
                assert (
                    result.getchannel("A").tobytes() == source_alpha.tobytes()
                ), f"{destination.name} alpha changed"
    print(
        f"{destination.relative_to(ROOT)}: {image.width} x {image.height}, "
        f"{destination.stat().st_size / 1024 / 1024:.2f} MiB",
        flush=True,
    )


for source in sorted(SOURCE_BACKGROUNDS.iterdir()):
    if source.suffix.lower() not in {".png", ".jpg"}:
        continue
    with Image.open(source) as original:
        save(
            upscale(original),
            OUTPUT_BACKGROUNDS / f"{source.stem}-2x.webp",
            exact_alpha=True,
        )

for name, box in DESCENT_LAYERS.items():
    with Image.open(SOURCE_BACKGROUNDS / "descent" / name) as original:
        cropped = original.crop(box) if box else original
        # The layers' transparency is soft by design - haze over the sky, the
        # glow around the moon - so a lossy alpha is fine here and much
        # smaller; nothing is composited hard-edged against them.
        save(
            upscale(cropped),
            OUTPUT_BACKGROUNDS / "descent" / f"{Path(name).stem}-2x.webp",
            exact_alpha=False,
        )
