#!/usr/bin/env python3
"""Export an episode scene for Blender (media 2026-11-27).
  export.py EPDIR OUTDIR --t 1.0 [--to 2.0] [--query cam=v3]
  → OUTDIR/scene.glb (the scene at --t), OUTDIR/frames.json (camera/sun/node transforms for every 30-fps frame from --t to --to),
    OUTDIR/overlay/ov_XXXX.png (captions, tags, hook, badge… on transparent — composited over the Blender render)."""
import sys, os, json, base64, argparse, threading, http.server, functools
from playwright.sync_api import sync_playwright
REPO = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
ap = argparse.ArgumentParser(); ap.add_argument('epdir'); ap.add_argument('out'); ap.add_argument('--t', type=float, default=1.0); ap.add_argument('--to', type=float, default=None)
ap.add_argument('--query', default=''); ap.add_argument('--port', type=int, default=8781); o = ap.parse_args()
os.makedirs(os.path.join(o.out, 'overlay'), exist_ok=True)
srv = http.server.ThreadingHTTPServer(("127.0.0.1", o.port), functools.partial(Q, directory=REPO)); threading.Thread(target=srv.serve_forever, daemon=True).start()
with sync_playwright() as p:
    b = p.chromium.launch(args=["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"])
    pg = b.new_page(viewport={"width": 1080, "height": 1920}); pg.on("pageerror", lambda e: print("pageerror:", e))
    rel = os.path.relpath(os.path.abspath(o.epdir), REPO)
    pg.goto(f"http://127.0.0.1:{o.port}/{rel}/index.html" + (f"?{o.query}" if o.query else "")); pg.wait_for_function("window.ready===true", timeout=180000)
    pg.evaluate("async()=>{window.BX = await import('/engine/lib/blender-export.js'); window.BX.prepare();}")
    open(os.path.join(o.out, 'scene.glb'), 'wb').write(base64.b64decode(pg.evaluate(f"window.BX.glb({o.t})")))
    ts = [o.t] if o.to is None else [round(o.t + i / 30, 4) for i in range(int(round((o.to - o.t) * 30)) + 1)]
    frames = []
    pg.add_style_tag(content="html,body{background:transparent!important} #c,#vig{visibility:hidden!important}")
    for i, t in enumerate(ts):
        frames.append(pg.evaluate(f"window.BX.frameData({t})"))
        pg.screenshot(path=os.path.join(o.out, 'overlay', f'ov_{i:04d}.png'), omit_background=True)
    json.dump({'fps': 30, 'frames': frames}, open(os.path.join(o.out, 'frames.json'), 'w'))
    print('exported', len(frames), 'frames →', o.out)
    b.close()
srv.shutdown()
