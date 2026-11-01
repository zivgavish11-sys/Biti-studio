#!/usr/bin/env python3
"""Render morning concept cards (one image per idea).
Usage: concept.py OUT_DIR EPISODE_NUMBER "hook line 1|hook line 2" ["..." ...]
  Each hook arg = lines separated by '|'; wrap the key word in <span class="pill">...</span>.
  Optional per idea: append '::anim=Wave::scene=city' (anims: Wave Dance Idle Jump ThumbsUp Yes No Running Walking Punch Sitting).
"""
import sys, os, urllib.parse, threading, functools, http.server
from playwright.sync_api import sync_playwright
REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
out, ep, ideas = sys.argv[1], sys.argv[2], sys.argv[3:]
os.makedirs(out, exist_ok=True)
srv = http.server.ThreadingHTTPServer(("127.0.0.1", 8779), functools.partial(Q, directory=REPO)); threading.Thread(target=srv.serve_forever, daemon=True).start()
with sync_playwright() as p:
    b = p.chromium.launch(args=["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"])
    anims = ["Wave", "ThumbsUp", "Dance"]
    for i, idea in enumerate(ideas, 1):
        parts = idea.split("::"); prm = {"hook": parts[0], "ep": ep, "anim": anims[(i - 1) % 3], "seed": str(i * 7)}
        for kv in parts[1:]:
            k, v = kv.split("=", 1); prm[k] = v
        pg = b.new_page(viewport={"width": 1080, "height": 1920})
        pg.on("pageerror", lambda e: print("pageerror:", e))
        pg.goto("http://127.0.0.1:8779/engine/concept/index.html?" + urllib.parse.urlencode(prm))
        pg.wait_for_function("window.ready===true", timeout=120000)
        pg.evaluate("renderAt(1.2)"); path = os.path.join(out, f"idea{i}.jpg")
        pg.screenshot(path=path, type="jpeg", quality=88); pg.close(); print(path)
    b.close()
srv.shutdown()
