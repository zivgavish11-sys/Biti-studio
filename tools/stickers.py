#!/usr/bin/env python3
"""Biti story stickers: render engine/props/stickers/?pose=... on a transparent background, trim, add light accent marks,
save engine/assets/stickers/biti-<pose>.png (~1080 px on the long side). Usage: python3 tools/stickers.py [pose,...]"""
import sys, os, io, math, threading, http.server, functools
from playwright.sync_api import sync_playwright
from PIL import Image, ImageDraw, ImageFilter
REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(REPO, 'engine/assets/stickers'); ACC = (142, 166, 255, 255)
POSES = (sys.argv[1] if len(sys.argv) > 1 else 'point,surprise,wave,think,curious').split(',')
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
def marks(im, pose):
    """thin light-blue accents (no glow): wave = two motion arcs by the raised arm, think = three dots, surprise = two short lines, point = none."""
    W, H = im.size; pad = int(W * .4); big = Image.new('RGBA', (W + 2 * pad, H + 2 * pad), (0, 0, 0, 0)); big.paste(im, (pad, pad))
    d = ImageDraw.Draw(big); lw = max(8, W // 70); X, Y = pad, pad
    if pose == 'wave':
        for k, rr in enumerate((.09, .15)):
            cx, cy, R = X + W * .04, Y + H * .02, W * rr
            d.arc([cx - R, cy - R, cx + R, cy + R], 195, 255, fill=ACC, width=lw)
    elif pose == 'think':
        for k, s in enumerate((.035, .05, .07)):
            cx, cy, R = X + W * (.95 + k * .1), Y + H * (.05 - k * .09), W * s
            d.ellipse([cx - R, cy - R, cx + R, cy + R], fill=ACC)
    elif pose == 'curious':   # small question mark by the raised ear
        cx, cy, R = X + W * 1.02, Y + H * .02, W * .07
        d.arc([cx - R, cy - R, cx + R, cy + R], 180, 400, fill=ACC, width=lw); d.line([cx + R * .35, cy + R * .95, cx, cy + R * 1.5], fill=ACC, width=lw)
        d.ellipse([cx - lw * .7, cy + R * 2.1 - lw * .7, cx + lw * .7, cy + R * 2.1 + lw * .7], fill=ACC)
    elif pose == 'surprise':
        for a in (-62, -90, -118):
            ca, sa = math.cos(math.radians(a)), math.sin(math.radians(a)); cx, cy = X + W / 2, Y + H * .45
            r0, r1 = W * .5, W * .6; d.line([cx + ca * r0, cy + sa * r0, cx + ca * r1, cy + sa * r1], fill=ACC, width=lw)
    return big.crop(big.getbbox())
srv = http.server.ThreadingHTTPServer(("127.0.0.1", 8767), functools.partial(Q, directory=REPO)); threading.Thread(target=srv.serve_forever, daemon=True).start()
os.makedirs(OUT, exist_ok=True)
with sync_playwright() as p:
    b = p.chromium.launch(args=["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"])
    for pose in POSES:
        pg = b.new_page(viewport={"width": 1400, "height": 1400}); pg.on("pageerror", lambda e: print("pageerror:", e))
        pg.goto(f"http://127.0.0.1:8767/engine/props/stickers/index.html?pose={pose}"); pg.wait_for_function("window.ready===true", timeout=120000)
        im = Image.open(io.BytesIO(pg.locator('canvas').screenshot(omit_background=True))).convert('RGBA'); pg.close()
        im = im.crop(im.getbbox()); im = marks(im, pose)
        sh = Image.new('RGBA', im.size, (0, 0, 0, 0)); a = im.split()[3].point(lambda v: int(v * .28)); sh.putalpha(a)   # soft contact shadow so it reads on white stories
        m = 40; can = Image.new('RGBA', (im.width + 2 * m, im.height + 2 * m), (0, 0, 0, 0)); can.paste(sh.filter(ImageFilter.GaussianBlur(14)), (m + 6, m + 14), sh.filter(ImageFilter.GaussianBlur(14)))
        can.alpha_composite(im, (m, m)); s = 1080 / max(can.size); can = can.resize((round(can.width * s), round(can.height * s)), Image.LANCZOS)
        fn = os.path.join(OUT, f'biti-{pose}.png'); can.save(fn, optimize=True); print(fn, can.size)
    b.close()
srv.shutdown()
