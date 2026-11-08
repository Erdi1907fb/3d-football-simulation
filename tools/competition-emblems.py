#!/usr/bin/env python3
"""V124 project-drawn competition emblems for 'unl' (UEFA Nations League placeholder) and 'intl'
(International Friendly). These are original marks, not official logos: replace assets/competitions/unl.png
with the official file when it is supplied (keep the same names; broadcast/light+dark and thumbs are derived).
Usage: python3 tools/competition-emblems.py [path-to-official-unl.png]"""
import math, os, sys
from PIL import Image, ImageDraw, ImageFont, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
C = os.path.join(ROOT, 'assets', 'competitions')
FONT = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'

def font(n):
    try: return ImageFont.truetype(FONT, n)
    except Exception: return ImageFont.load_default()

def star(d, cx, cy, r, fill):
    pts = []
    for i in range(10):
        a = -math.pi / 2 + i * math.pi / 5
        rr = r if i % 2 == 0 else r * .42
        pts.append((cx + rr * math.cos(a), cy + rr * math.sin(a)))
    d.polygon(pts, fill=fill)

def ball(d, cx, cy, r, ink, fill):
    d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=fill, outline=ink, width=int(max(2, r // 14)))
    pent = [(cx + r * .38 * math.cos(-math.pi / 2 + i * 2 * math.pi / 5), cy + r * .38 * math.sin(-math.pi / 2 + i * 2 * math.pi / 5)) for i in range(5)]
    d.polygon(pent, fill=ink)
    for (px, py) in pent:
        ex, ey = cx + (px - cx) * 2.25, cy + (py - cy) * 2.25
        d.line([(px, py), (ex, ey)], fill=ink, width=int(max(2, r // 16)))

def unl(size=1500, light=True):
    im = Image.new('RGBA', (size, size), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    c = size / 2; ink = (255, 255, 255, 255) if light else (8, 24, 64, 255); acc = (0, 200, 255, 255)
    for i in range(12):  # ring of twelve stars: nations together
        a = -math.pi / 2 + i * math.pi / 6
        star(d, c + size * .3 * math.cos(a), size * .38 + size * .3 * math.sin(a), size * .04, acc if i % 3 == 0 else ink)
    ball(d, c, size * .38, size * .16, ink, (0, 0, 0, 0))
    f = font(int(size * .105))
    for k, word in enumerate(['NATIONS', 'LEAGUE']):
        w = d.textlength(word, font=f); d.text((c - w / 2, size * (.74 + k * .12)), word, font=f, fill=ink if k == 0 else acc)
    return im

def intl(size=1500, light=True):
    im = Image.new('RGBA', (size, size), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    c = size / 2; ink = (255, 255, 255, 255) if light else (20, 24, 32, 255); gold = (230, 181, 74, 255)
    r = size * .3; cy = size * .42
    d.ellipse([c - r, cy - r, c + r, cy + r], outline=ink, width=int(size * .022))
    for k in (.35, .7):  # meridians and parallels: a globe
        d.ellipse([c - r * k, cy - r, c + r * k, cy + r], outline=ink, width=int(size * .012))
        d.ellipse([c - r, cy - r * k, c + r, cy + r * k], outline=ink, width=int(size * .012))
    d.line([(c - r, cy), (c + r, cy)], fill=ink, width=int(size * .012))
    ball(d, c + r * .78, cy + r * .78, size * .1, ink, gold)
    f = font(int(size * .088)); f2 = font(int(size * .07))
    for k, (word, ff, col) in enumerate([('INTERNATIONAL', f, ink), ('FRIENDLY', f2, gold)]):
        w = d.textlength(word, font=ff); d.text((c - w / 2, size * (.8 + k * .1)), word, font=ff, fill=col)
    return im

def write(key, maker, official=None):
    big = Image.open(official).convert('RGBA').resize((1500, 1500), Image.LANCZOS) if official else maker(1500, False)  # main/thumb: dark ink, like the other competition marks
    os.makedirs(os.path.join(C, 'thumbs'), exist_ok=True); os.makedirs(os.path.join(C, 'broadcast'), exist_ok=True)
    big.save(os.path.join(C, key + '.png'))
    big.resize((128, 128), Image.LANCZOS).save(os.path.join(C, 'thumbs', key + '.png'))
    (Image.open(official).convert('RGBA').resize((700, 700), Image.LANCZOS) if official else maker(700, True)).save(os.path.join(C, 'broadcast', key + '-light.png'))
    (Image.open(official).convert('RGBA').resize((700, 700), Image.LANCZOS) if official else maker(700, False)).save(os.path.join(C, 'broadcast', key + '-dark.png'))

if __name__ == '__main__':
    write('unl', unl, sys.argv[1] if len(sys.argv) > 1 else None)
    write('intl', intl)
    print('ok')
