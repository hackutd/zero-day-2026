"""Create build-ready 2x backgrounds from design sources. Requires Pillow."""

from pathlib import Path

from PIL import Image, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
SOURCE_BACKGROUNDS = ROOT / "design-sources" / "backgrounds"
OUTPUT_BACKGROUNDS = ROOT / "assets" / "images" / "backgrounds"

OUTPUT_BACKGROUNDS.mkdir(parents=True, exist_ok=True)

for source in sorted(SOURCE_BACKGROUNDS.iterdir()):
    if source.suffix.lower() not in {".png", ".jpg"}:
        continue
    with Image.open(source) as original:
        size = (original.width * 2, original.height * 2)
        # Pillow resamples RGBA with premultiplied alpha to avoid dark fringes.
        enlarged = original.resize(size, Image.Resampling.LANCZOS)
        sharpened = enlarged.convert("RGB").filter(
            ImageFilter.UnsharpMask(radius=1.2, percent=45, threshold=3)
        )
        if "A" in enlarged.getbands():
            # Sharpen only color; the resampled transparency stays untouched.
            sharpened.putalpha(enlarged.getchannel("A"))
        destination = OUTPUT_BACKGROUNDS / f"{source.stem}-2x.webp"
        # Lossy, not lossless. These are LANCZOS upscales of 1920px art - there
        # is no detail here that q=90 can lose, and next/image re-encodes them
        # lossily on the way out regardless, so a lossless master only ever cost
        # repo and deploy weight (~23 MiB across the eight plates, against ~3).
        # `alpha_quality=100` keeps the cutouts exact: the forefront car and the
        # carriage are composited over the scene behind them, and a soft alpha
        # edge there shows as a halo.
        sharpened.save(
            destination, "WEBP", quality=90, alpha_quality=100, method=6
        )
        with Image.open(destination) as result:
            assert result.size == size
            # Most plates are full-frame and their alpha is all-255; libwebp
            # drops a channel like that, which is free and changes nothing. Only
            # a plate with a real cutout - the forefront car, the carriage - has
            # to come back with its alpha intact, and at alpha_quality=100 it
            # comes back byte-exact.
            source_alpha = (
                enlarged.getchannel("A") if "A" in enlarged.getbands() else None
            )
            if source_alpha and source_alpha.getextrema()[0] < 255:
                assert "A" in result.getbands(), f"{destination.name} lost alpha"
                assert (
                    result.getchannel("A").tobytes() == source_alpha.tobytes()
                ), f"{destination.name} alpha changed"
        print(f"{destination.name}: {size[0]} x {size[1]}, {destination.stat().st_size / 1024 / 1024:.2f} MiB", flush=True)
