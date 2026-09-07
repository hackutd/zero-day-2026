"""Create faithful 2x background assets. Requires Pillow: pip install pillow."""

from pathlib import Path

from PIL import Image, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
BACKGROUNDS = ROOT / "public" / "backgrounds"

for source in sorted(BACKGROUNDS.iterdir()):
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
        destination = source.with_name(f"{source.stem}-2x.webp")
        sharpened.save(destination, "WEBP", lossless=True, method=6)
        with Image.open(destination) as result:
            assert result.size == size
            if "A" in enlarged.getbands():
                assert result.convert("RGBA").getchannel("A").tobytes() == enlarged.getchannel("A").tobytes()
        print(f"{destination.name}: {size[0]} x {size[1]}, {destination.stat().st_size / 1024 / 1024:.2f} MiB", flush=True)
