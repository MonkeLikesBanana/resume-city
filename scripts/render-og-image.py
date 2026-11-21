"""Render the Open Graph card with Pillow and the macOS Avenir Next font."""

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

OUTPUT = Path(__file__).resolve().parents[1] / "public" / "og-image.png"
FONT = "/System/Library/Fonts/Avenir Next.ttc"

image = Image.new("RGB", (1200, 630), "#faf9f5")
draw = ImageDraw.Draw(image)
draw.text(
    (96, 210), "Aarav Vaswani", anchor="lt", fill="#19231f",
    font=ImageFont.truetype(FONT, 104, index=0),
)
draw.line((100, 334, 1100, 334), fill="#245644", width=3)
draw.text(
    (100, 370), "Saints Robotics Vice President · NEEMO Co-Founder", anchor="lt",
    fill="#245644", font=ImageFont.truetype(FONT, 34, index=7),
)
draw.text(
    (100, 424), "IB Diploma Candidate", anchor="lt",
    fill="#495750", font=ImageFont.truetype(FONT, 34, index=0),
)
image.save(OUTPUT, optimize=True)
