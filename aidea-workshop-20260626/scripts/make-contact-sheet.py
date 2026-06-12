#!/usr/bin/env python3
from __future__ import annotations

import argparse
import math
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Build a contact sheet from slide PNGs.")
    parser.add_argument("slides_dir", type=Path)
    parser.add_argument("output", type=Path)
    parser.add_argument("--thumb-width", type=int, default=320)
    parser.add_argument("--columns", type=int, default=4)
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    images = sorted(args.slides_dir.glob("slide-*.png"))
    if not images:
        raise SystemExit(f"No slide PNGs found in {args.slides_dir}")

    label_h = 28
    gap = 14
    loaded: list[tuple[Path, Image.Image]] = []
    for image_path in images:
        image = Image.open(image_path).convert("RGB")
        ratio = args.thumb_width / image.width
        thumb = image.resize((args.thumb_width, round(image.height * ratio)), Image.Resampling.LANCZOS)
        loaded.append((image_path, thumb))

    thumb_h = max(image.height for _, image in loaded)
    rows = math.ceil(len(loaded) / args.columns)
    width = args.columns * args.thumb_width + (args.columns + 1) * gap
    height = rows * (thumb_h + label_h) + (rows + 1) * gap
    sheet = Image.new("RGB", (width, height), "white")
    draw = ImageDraw.Draw(sheet)
    font = ImageFont.load_default()

    for index, (image_path, thumb) in enumerate(loaded):
        row, col = divmod(index, args.columns)
        x = gap + col * (args.thumb_width + gap)
        y = gap + row * (thumb_h + label_h + gap)
        sheet.paste(thumb, (x, y))
        draw.text((x, y + thumb_h + 7), image_path.stem, fill=(35, 35, 35), font=font)

    args.output.parent.mkdir(parents=True, exist_ok=True)
    sheet.save(args.output)


if __name__ == "__main__":
    main()
