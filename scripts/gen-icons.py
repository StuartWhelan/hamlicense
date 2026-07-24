"""Generate PWA icons: a signal-tower 'radio wave' mark on a teal→navy gradient."""
import math
from PIL import Image, ImageDraw

TEAL = (15, 118, 110)
NAVY = (11, 17, 32)
LIGHT = (94, 234, 212)


def gradient(size, top, bottom):
    img = Image.new("RGB", (size, size))
    px = img.load()
    for y in range(size):
        t = y / (size - 1)
        r = int(top[0] * (1 - t) + bottom[0] * t)
        g = int(top[1] * (1 - t) + bottom[1] * t)
        b = int(top[2] * (1 - t) + bottom[2] * t)
        for x in range(size):
            px[x, y] = (r, g, b)
    return img


def draw_mark(size, pad_frac):
    img = gradient(size, TEAL, NAVY).convert("RGBA")
    d = ImageDraw.Draw(img)
    cx, cy = size / 2, size * 0.60
    lw = max(2, int(size * 0.045))
    # radiating arcs (radio waves) from an antenna point
    ax, ay = cx, size * 0.30
    for i, r in enumerate([0.13, 0.22, 0.31]):
        rr = size * r
        bbox = [ax - rr, ay - rr, ax + rr, ay + rr]
        d.arc(bbox, start=210, end=330, fill=LIGHT, width=lw)
    # antenna mast
    d.line([(ax, ay), (ax, size * 0.72)], fill=(255, 255, 255), width=lw)
    # dot emitter
    d.ellipse([ax - lw, ay - lw, ax + lw, ay + lw], fill=(255, 255, 255))
    # base / tower legs
    d.line([(ax, size * 0.72), (ax - size * 0.12, size * 0.82)], fill=(255, 255, 255), width=lw)
    d.line([(ax, size * 0.72), (ax + size * 0.12, size * 0.82)], fill=(255, 255, 255), width=lw)
    return img


def rounded(img, radius_frac=0.22):
    size = img.width
    mask = Image.new("L", (size, size), 0)
    ImageDraw.Draw(mask).rounded_rectangle(
        [0, 0, size, size], radius=int(size * radius_frac), fill=255
    )
    out = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    out.paste(img, (0, 0), mask)
    return out


def main():
    out = "public/icons"
    import os
    os.makedirs(out, exist_ok=True)
    # standard (rounded)
    for s in (192, 512):
        rounded(draw_mark(s, 0.1)).save(f"{out}/icon-{s}.png")
    # maskable: full-bleed square, mark within safe zone
    draw_mark(512, 0.2).save(f"{out}/icon-512-maskable.png")
    # apple touch icon
    rounded(draw_mark(180, 0.1)).save(f"{out}/apple-touch-icon.png")
    print("icons written to", out)


if __name__ == "__main__":
    main()
