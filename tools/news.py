#!/usr/bin/env python3
"""Daily news carousel: render slides from a spec and (optionally) publish them as public URLs.

Usage:
  news.py render news/YYYYMMDD            -> news/YYYYMMDD/out/slide-1.jpg ... + contact sheet
  news.py upload news/YYYYMMDD MEDIA_REPO  -> copies slides to MEDIA_REPO/v/news-YYYYMMDD-N.jpg, pushes,
                                             checks each URL returns 200, prints the URL list (JSON)
  news.py clean  YYYYMMDD MEDIA_REPO       -> removes that day's slides from the media repo after posting
Spec format: see engine/news/index.html header and docs/news.md.
"""
import sys, os, json, glob, shutil, subprocess, threading, functools, http.server, time, urllib.request

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW = "https://raw.githubusercontent.com/zivgavish11-sys/Biti-media/main/v/"

class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass

def render(d):
    from playwright.sync_api import sync_playwright
    d = os.path.abspath(d); rel = os.path.relpath(d, REPO)
    spec = json.load(open(os.path.join(d, "spec.json")))
    out = os.path.join(d, "out"); os.makedirs(out, exist_ok=True)
    for f in glob.glob(os.path.join(out, "slide-*.jpg")): os.remove(f)
    srv = http.server.ThreadingHTTPServer(("127.0.0.1", 8781), functools.partial(Q, directory=REPO))
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    paths = []
    with sync_playwright() as p:
        b = p.chromium.launch(args=["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"])
        for i in range(len(spec["slides"])):
            pg = b.new_page(viewport={"width": 1080, "height": 1350})
            pg.on("pageerror", lambda e: print("pageerror:", e))
            pg.goto(f"http://127.0.0.1:8781/engine/news/index.html?spec=/{rel}/spec.json&i={i}")
            pg.wait_for_function("window.ready===true", timeout=180000)
            pg.wait_for_timeout(300)
            path = os.path.join(out, f"slide-{i + 1}.jpg")
            pg.screenshot(path=path, type="jpeg", quality=92); pg.close(); paths.append(path); print(path)
        b.close()
    srv.shutdown()
    n = len(paths); cols = min(n, 3); rows = (n + cols - 1) // cols
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", os.path.join(out, "slide-%d.jpg"), "-start_number", "1",
                    "-vf", f"scale=360:450,tile={cols}x{rows}:padding=8:color=0x05061a", "-frames:v", "1",
                    os.path.join(out, "sheet.jpg")])
    print(os.path.join(out, "sheet.jpg"))

def git(repo, *args):
    r = subprocess.run(["git", "-C", repo, "-c", "user.name=Ziv", "-c", "user.email=zivgavish11@gmail.com", *args],
                       capture_output=True, text=True)
    if r.returncode: print(r.stderr, file=sys.stderr)
    return r

def upload(d, media):
    day = os.path.basename(os.path.normpath(d))
    slides = sorted(glob.glob(os.path.join(d, "out", "slide-*.jpg")), key=lambda p: int(p.rsplit("-", 1)[1][:-4]))
    os.makedirs(os.path.join(media, "v"), exist_ok=True)
    git(media, "pull", "-q", "--rebase")
    names = []
    for k, s in enumerate(slides, 1):
        n = f"news-{day}-{k}.jpg"; shutil.copy(s, os.path.join(media, "v", n)); names.append(n)
    git(media, "add", "v"); git(media, "commit", "-qm", f"news {day}"); git(media, "push", "-q")
    urls = [RAW + n for n in names]
    for u in urls:  # raw CDN can lag a few seconds after push
        for _ in range(12):
            try:
                if urllib.request.urlopen(u, timeout=10).status == 200: break
            except Exception: pass
            time.sleep(5)
        else:
            sys.exit(f"URL not reachable: {u}")
    print(json.dumps(urls, indent=1))

def clean(day, media):
    git(media, "pull", "-q", "--rebase")
    files = glob.glob(os.path.join(media, "v", f"news-{day}-*.jpg"))
    if not files: print("nothing to clean"); return
    git(media, "rm", "-q", *[os.path.relpath(f, media) for f in files])
    git(media, "commit", "-qm", f"clean news {day}"); git(media, "push", "-q"); print(f"removed {len(files)} files")

if __name__ == "__main__":
    cmd = sys.argv[1] if len(sys.argv) > 1 else ""
    if cmd == "render": render(sys.argv[2])
    elif cmd == "upload": upload(sys.argv[2], sys.argv[3])
    elif cmd == "clean": clean(sys.argv[2], sys.argv[3])
    else: print(__doc__)
