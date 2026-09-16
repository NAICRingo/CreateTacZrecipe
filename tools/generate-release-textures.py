"""Generate the project's original 16x16 release sprites.

Pillow is only a maintainer-time dependency; generated PNG files are committed.
"""
from pathlib import Path
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "src/kubejs/assets/createtaczrecipe/textures/item"
OUT.mkdir(parents=True, exist_ok=True)


def canvas():
    return Image.new("RGBA", (16, 16), (0, 0, 0, 0))


def save(name, draw_fn):
    image = canvas()
    draw_fn(ImageDraw.Draw(image))
    image.save(OUT / f"{name}.png", optimize=True)


def casing(d):
    d.polygon([(5, 2), (10, 2), (11, 4), (10, 13), (5, 13), (4, 4)], fill="#6d4314")
    d.rectangle((5, 3, 10, 11), fill="#d59b2b")
    d.rectangle((6, 4, 7, 10), fill="#f5cd57")
    d.rectangle((5, 12, 10, 13), fill="#a46d1d")
    d.rectangle((6, 2, 9, 2), fill="#3e2912")


def projectile(d, polished=False):
    dark, mid, light = (("#6b3324", "#b95f3c", "#e99a6b") if not polished else ("#5d3b27", "#d17b3e", "#ffd08a"))
    d.polygon([(7, 1), (9, 3), (11, 7), (10, 13), (5, 13), (4, 7), (6, 3)], fill=dark)
    d.polygon([(7, 2), (9, 4), (9, 11), (6, 11), (6, 4)], fill=mid)
    d.line((7, 3, 7, 10), fill=light, width=1)


def incomplete(d):
    casing(d)
    d.polygon([(7, 0), (9, 2), (10, 5), (5, 5), (6, 2)], fill="#c76b42")
    d.line((7, 1, 7, 4), fill="#ffd090")
    d.rectangle((4, 7, 11, 8), fill="#9b2525")


def packet(d, color, mark=0):
    d.polygon([(4, 3), (6, 1), (10, 1), (12, 3), (11, 13), (4, 13)], fill="#3a332a")
    d.rectangle((5, 3, 10, 12), fill="#d7c9a8")
    d.rectangle((5, 7, 10, 9), fill=color)
    d.point((6 + (mark & 3), 5), fill="#382d27")
    d.point((6 + ((mark >> 2) & 3), 11), fill="#382d27")
    d.line((6, 3, 9, 3), fill="#fff0c9")


save("empty_casing", casing)
save("rough_projectile", lambda d: projectile(d, False))
save("polished_projectile", lambda d: projectile(d, True))
save("incomplete_cartridge", incomplete)
save("brass_casing_blank", lambda d: (d.rounded_rectangle((3, 3, 12, 12), 2, fill="#9a651e"), d.rectangle((5, 4, 10, 10), fill="#e0ab39"), d.line((5, 4, 9, 4), fill="#ffe17a")))
save("copper_projectile_blank", lambda d: (d.rounded_rectangle((4, 2, 11, 13), 3, fill="#713827"), d.rectangle((5, 4, 10, 11), fill="#c56c45"), d.line((6, 4, 6, 10), fill="#efad82")))
save("small_arms_primer", lambda d: (d.ellipse((3, 3, 12, 12), fill="#6c4d21"), d.ellipse((4, 4, 11, 11), fill="#d5a13d"), d.ellipse((6, 6, 9, 9), fill="#f5d77a")))
save("primer_compound", lambda d: (d.polygon([(2, 12), (5, 7), (8, 4), (13, 12)], fill="#842f1f"), d.point((6, 8), fill="#ffb33f"), d.point((9, 8), fill="#e85a27"), d.point((7, 11), fill="#ffd467")))
save("loose_propellant", lambda d: [d.rectangle((x, y, x + 1, y + 1), fill=c) for x, y, c in [(3,10,"#292522"),(6,6,"#504943"),(10,9,"#1e1c1b"),(8,12,"#665d53"),(12,5,"#36322e"),(4,4,"#4b443d")]])
save("light_propellant_charge", lambda d: packet(d, "#6cb66f", 1))
save("standard_propellant_charge", lambda d: packet(d, "#d5a83e", 2))
save("heavy_propellant_charge", lambda d: packet(d, "#b94c43", 3))

keys = ["22wmr", "9mm", "45acp", "46x30", "57x28", "762x25", "357mag", "500mag", "50ae", "545x39", "556x45", "58x42", "68x51fury", "762x39", "30_06", "308", "338", "45_70", "762x54", "792x57", "50bmg", "12g"]
palette = ["#75b96f", "#64a7a8", "#668ac0", "#8474bd", "#b06eb3", "#c16b86", "#c86b54", "#ce8b4d", "#c9ad4d", "#a7b953", "#70aa5a"]
charge_out = OUT / "propellant_charge"
charge_out.mkdir(exist_ok=True)
for index, key in enumerate(keys):
    image = canvas()
    packet(ImageDraw.Draw(image), palette[index % len(palette)], index)
    image.save(charge_out / f"{key}.png", optimize=True)
