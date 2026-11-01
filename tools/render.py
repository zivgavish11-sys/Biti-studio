#!/usr/bin/env python3
"""Render an episode page to video frames with headless Chromium (WebGL via SwiftShader).

Usage:
  render.py frames EPDIR t1,t2,...            -> EPDIR/frames/fr_<t>.jpg (render-time seconds)
  render.py video  EPDIR OUT.mp4 [--from A --to B] [--scale 1.0] [--port 8765]
     A/B are OUTPUT seconds (default whole timeline). scale>1 slows the animation to match a slower voice.
  render.py sfx    EPDIR                      -> EPDIR/sfx.json (auto sound cues, render-time seconds)
Serve root is the repo root, so pages can import /engine/... paths.
"""
import sys, os, json, time, subprocess, threading, http.server, functools, argparse
from playwright.sync_api import sync_playwright

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass

def serve(port):
    srv = http.server.ThreadingHTTPServer(("127.0.0.1", port), functools.partial(Q, directory=REPO))
    threading.Thread(target=srv.serve_forever, daemon=True).start(); return srv

def open_page(p, epdir, port):
    exe = "/opt/pw-browsers/chromium" if os.path.exists("/opt/pw-browsers/chromium") else None
    b = p.chromium.launch(args=["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"])
    pg = b.new_page(viewport={"width": 1080, "height": 1920})
    pg.on("console", lambda m: print("console:", m.text) if m.type in ("error", "warning") else None)
    pg.on("pageerror", lambda e: print("pageerror:", e))
    rel = os.path.relpath(os.path.abspath(epdir), REPO)
    pg.goto(f"http://127.0.0.1:{port}/{rel}/index.html")
    pg.wait_for_function("window.ready===true", timeout=120000)
    return b, pg

def main():
    ap = argparse.ArgumentParser(); ap.add_argument("mode"); ap.add_argument("epdir"); ap.add_argument("arg", nargs="?")
    ap.add_argument("--from", dest="a", type=float, default=0.0); ap.add_argument("--to", dest="b", type=float, default=None)
    ap.add_argument("--scale", type=float, default=1.0); ap.add_argument("--port", type=int, default=8765)
    o = ap.parse_args()
    srv = serve(o.port)
    with sync_playwright() as p:
        b, pg = open_page(p, o.epdir, o.port)
        if o.mode == "frames":
            os.makedirs(os.path.join(o.epdir, "frames"), exist_ok=True)
            for ts in o.arg.split(","):
                t0 = time.time(); pg.evaluate(f"renderAt({ts})")
                pg.screenshot(path=os.path.join(o.epdir, "frames", f"fr_{ts}.jpg"), type="jpeg", quality=92)
                print(ts, round(time.time() - t0, 2))
        elif o.mode == "sfx":
            json.dump(pg.evaluate("window.SFX"), open(os.path.join(o.epdir, "sfx.json"), "w"))
            print("sfx cues written")
        elif o.mode == "video":
            tl = json.load(open(os.path.join(o.epdir, "timeline.json")))
            end = o.b if o.b is not None else tl["end"] * o.scale
            tmp = o.arg + ".part.mp4"
            ff = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "image2pipe", "-framerate", "30", "-c:v", "mjpeg", "-i", "-",
                                   "-c:v", "libx264", "-preset", "medium", "-crf", "18", "-pix_fmt", "yuv420p", "-r", "30", tmp], stdin=subprocess.PIPE)
            n = int(round((end - o.a) * 30)); t0 = time.time()
            for i in range(n):
                pg.evaluate(f"renderAt({(o.a + i / 30) / o.scale})"); ff.stdin.write(pg.screenshot(type="jpeg", quality=92))
                if i % 150 == 0: print(f"frame {i}/{n} {round(time.time()-t0)}s", flush=True)
            ff.stdin.close(); rc = ff.wait()
            if rc == 0: os.replace(tmp, o.arg)
            print("exit", rc)
        b.close()
    srv.shutdown()

if __name__ == "__main__":
    main()
