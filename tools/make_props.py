#!/usr/bin/env python3
"""Export the in-house procedural prop kit (engine/props/kit.js) to GLB files.
Usage: make_props.py [name-filter]   (kit.js + kit-pro.js + kit-tlv.js; filter "tlv/" = Tel-Aviv kit; filter "pro/" = the realistic news kit; "pool/" = backyard pool kit; "farm/" = orchard + picker drone; "windowBotPro"/"tlvWindowRoom" = ep025 window kit; "car/" = ep024 cabin car (+ road/nightHighway, people/mannequin-driver); space/deepProbe; "biti" = Biti directions; kitchenLiving/crumpledBag/mannequin-sit = ep026; suvRobotaxi/conciergeDesk = news)   → engine/assets/models/<folder>/<name>.glb
Also: make_props.py --preview OUT.jpg  → contact sheet of all props in the classic look (for review).
"""
import sys, os, base64, threading, http.server, functools
from playwright.sync_api import sync_playwright

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PAGE = """<!doctype html><meta charset=utf-8><body style="margin:0;background:#0b1020">
<script type="importmap">{"imports":{"three":"/engine/node_modules/three/build/three.module.js","three/addons/":"/engine/node_modules/three/examples/jsm/"}}</script>
<script type="module">
import * as THREE from 'three';
import {GLTFExporter} from 'three/addons/exporters/GLTFExporter.js';
import {KIT as KIT0} from '/engine/props/kit.js';
import {KITPRO} from '/engine/props/kit-pro.js';
import {KITTLV, BAKE, bake} from '/engine/props/kit-tlv.js';
import {KITPOOL} from '/engine/props/kit-pool.js';
import {KITFARM} from '/engine/props/kit-farm.js';
import {KITCABIN} from '/engine/props/kit-cabin.js';
import {KITWINDOW} from '/engine/props/kit-window.js';
import {KITNEWS} from '/engine/props/kit-newsparts.js';
import {KITBITI} from '/engine/props/kit-biti.js';
import {KITHOME26} from '/engine/props/kit-home26.js';
const KIT = {...KIT0, ...KITPRO, ...KITTLV, ...KITPOOL, ...KITFARM, ...KITCABIN, ...KITWINDOW, ...KITNEWS, ...KITBITI, ...KITHOME26};
window.exportAll = async (filter) => {
  const out = {};
  for (const [k, fn] of Object.entries(KIT)) {
    if (filter && !k.includes(filter)) continue;
    let o = fn(); if (BAKE[k]) bake(o, BAKE[k]);
    const ab = await new GLTFExporter().parseAsync(o, {binary: true});
    let s = ''; const u = new Uint8Array(ab); for (let i = 0; i < u.length; i += 0x8000) s += String.fromCharCode(...u.subarray(i, i + 0x8000));
    out[k] = btoa(s);
  }
  return out;
};
window.ready = true;
</script>"""

class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
    def do_GET(self):
        if self.path.startswith("/__props.html"):
            b = PAGE.encode(); self.send_response(200); self.send_header("Content-Type", "text/html"); self.send_header("Content-Length", str(len(b))); self.end_headers(); self.wfile.write(b); return
        return super().do_GET()

def main():
    flt = sys.argv[1] if len(sys.argv) > 1 else ""
    srv = http.server.ThreadingHTTPServer(("127.0.0.1", 8771), functools.partial(Q, directory=REPO))
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    with sync_playwright() as p:
        b = p.chromium.launch(args=["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"])
        pg = b.new_page(); pg.on("pageerror", lambda e: print("pageerror:", e)); pg.on("console", lambda m: print("console:", m.text))
        pg.goto("http://127.0.0.1:8771/__props.html"); pg.wait_for_function("window.ready===true", timeout=60000)
        res = pg.evaluate("f => exportAll(f)", flt)
        for k, v in res.items():
            path = os.path.join(REPO, "engine/assets/models", k + ".glb"); os.makedirs(os.path.dirname(path), exist_ok=True)
            open(path, "wb").write(base64.b64decode(v)); print(f"{k}.glb  {os.path.getsize(path)//1024} KB")
        b.close()
    srv.shutdown()

if __name__ == "__main__":
    main()
