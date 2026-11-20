"""Render the Open Graph card with Pillow and the macOS Avenir Next font."""

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

OUTPUT = Path(__file__).resolve().parents[1] / "public" / "og-image.png"
FONT = "/System/Library/Fonts/Avenir Next.ttc"

image = Image.new("RGB", (1200, 630), "#f4f1ea")
draw = ImageDraw.Draw(image)
draw.rectangle((0, 0, 1199, 11), fill="#2d5843")
draw.text(
    (96, 245), "Aarav Vaswani", anchor="lt", fill="#1f2a24",
    font=ImageFont.truetype(FONT, 100, index=0),
)
draw.text(
    (100, 371), "Robotics · Electronics · Entrepreneurship", anchor="lt",
    fill="#2d5843", font=ImageFont.truetype(FONT, 36, index=7),
)
image.save(OUTPUT)
