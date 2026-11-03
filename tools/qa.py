#!/usr/bin/env python3
"""Automatic quality check for a finished episode video.

Usage: qa.py VIDEO.mp4 [--light LIGHT.mp4] [--sheet OUT.jpg]
Exit code 0 = all PASS, 1 = at least one FAIL (WARN does not fail).
Checks the problems we already hit once: glare at the start, black frames,
wrong length/size/resolution, missing or quiet audio, and a non-looping end.
"""
import argparse, json, os, re, subprocess, sys, tempfile
import numpy as np

def sh(cmd):
    return subprocess.run(cmd, capture_output=True, text=True)

def probe(path):
    r = sh(["ffprobe", "-v", "error", "-show_streams", "-show_format", "-of", "json", path])
    return json.loads(r.stdout)

def frame(path, t, w=270, h=480):
    """Grayscale + RGB frame at time t, downscaled, as float arrays 0..1."""
    r = subprocess.run(["ffmpeg", "-v", "error", "-ss", f"{t:.3f}", "-i", path, "-frames:v", "1",
                        "-vf", f"scale={w}:{h}", "-f", "rawvideo", "-pix_fmt", "rgb24", "-"],
                       capture_output=True)
    if len(r.stdout) != w * h * 3:
        return None
    rgb = np.frombuffer(r.stdout, np.uint8).reshape(h, w, 3).astype(np.float32) / 255
    return rgb

def luma(rgb):
    return rgb @ np.array([0.2126, 0.7152, 0.0722], np.float32)

results = []
def check(name, ok, detail, warn=False):
    status = "PASS" if ok else ("WARN" if warn else "FAIL")
    results.append((status, name, detail))

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("video")
    ap.add_argument("--light")
    ap.add_argument("--sheet")
    ap.add_argument("--min", type=float, default=30)
    ap.add_argument("--max", type=float, default=46)
    a = ap.parse_args()
    v = a.video
    info = probe(v)
    vs = [s for s in info["streams"] if s["codec_type"] == "video"]
    au = [s for s in info["streams"] if s["codec_type"] == "audio"]
    dur = float(info["format"]["duration"])
    size_mb = os.path.getsize(v) / 1e6

    # format
    if vs:
        w, h = int(vs[0]["width"]), int(vs[0]["height"])
        check("resolution", (w, h) == (1080, 1920), f"{w}x{h} (want 1080x1920)")
    else:
        check("video stream", False, "no video stream")
    check("duration", a.min <= dur <= a.max, f"{dur:.1f}s (want {a.min:.0f}-{a.max:.0f}s)")
    check("file size", size_mb <= 22, f"{size_mb:.1f} MB (want <= 22 MB, phones choke on big files)")
    if a.light:
        lmb = os.path.getsize(a.light) / 1e6
        check("light size", lmb <= 4, f"{lmb:.1f} MB (want <= 4 MB, Ziv: must open fast on his phone)")

    # glare at the start (thumbnail + first second)
    for t in (0.0, 0.5, 1.0):
        rgb = frame(v, t)
        if rgb is None:
            check(f"frame {t}s", False, "could not decode"); continue
        L = luma(rgb)
        bright = float((L > 0.85).mean())
        check(f"glare @{t}s", L.mean() < 0.38 and bright < 0.08,
              f"mean luma {L.mean():.2f} (<0.38), bright {bright*100:.1f}% (<8%)")
    # first frame must not be (near) black either: it's the thumbnail
    rgb0 = frame(v, 0.0)
    if rgb0 is not None:
        check("thumbnail not dark", luma(rgb0).mean() > 0.06, f"mean luma {luma(rgb0).mean():.2f} (>0.06)")

    # black segments (camera inside geometry, object in front of the lens)
    r = sh(["ffmpeg", "-v", "info", "-i", v, "-vf", "blackdetect=d=0.15:pix_th=0.10:pic_th=0.90",
            "-an", "-f", "null", "-"])
    blacks = re.findall(r"black_start:([\d.]+) black_end:([\d.]+)", r.stderr)
    blacks = [(float(s), float(e)) for s, e in blacks]
    # dark scenes (night/fog) are allowed; fail only on dark in the hook or a long dead stretch
    bad = [(s, e) for s, e in blacks if s < 3 or e - s > 3]
    txt = "none" if not blacks else ", ".join(f"{s:.2f}-{e:.2f}s" for s, e in blacks)
    check("black / empty frames", not blacks, txt + ("" if not blacks else "  (look: is it intentional?)"), warn=not bad)

    # dark object sweeping across the lens (the ep1 v4 bug): share of fully-dark columns per frame
    worst = 0; worst_t = 0
    for t in np.arange(0, dur, 0.1 if dur < 8 else 0.2):
        rgb = frame(v, float(t), 108, 192)
        if rgb is None: continue
        L = luma(rgb)
        dcol = (L < 0.03).mean(axis=0) > 0.8
        cols = float(dcol.mean())
        if cols >= 0.97 or cols == 0: continue  # fully dark frame = blackdetect's job
        if L[:, ~dcol].mean() < 0.12: continue    # whole scene is dark (night/fog), not a blocker
        if cols > worst: worst, worst_t = cols, t
    check("no lens blocker", worst < 0.3, f"max dark columns {worst*100:.0f}% at {worst_t:.1f}s (<30%)")

    # audio
    if not au:
        check("audio", False, "no audio stream")
    else:
        r = sh(["ffmpeg", "-v", "info", "-i", v, "-af", "ebur128=peak=true", "-f", "null", "-"])
        m = re.findall(r"I:\s+(-?[\d.]+) LUFS", r.stderr)
        lufs = float(m[-1]) if m else -99
        check("loudness", -20 <= lufs <= -11, f"{lufs:.1f} LUFS (want -20..-11)")
        r = sh(["ffmpeg", "-v", "info", "-i", v, "-af", "silencedetect=n=-45dB:d=2.5", "-f", "null", "-"])
        sil = re.findall(r"silence_start: ([\d.]+)", r.stderr)
        check("no long silence", not sil, "none" if not sil else f"silence from {', '.join(sil)}s")

    # loop: last frame should resemble the first (composition / colors)
    first = frame(v, 0.0, 54, 96); last = frame(v, max(0, dur - 0.1), 54, 96)
    if first is not None and last is not None:
        diff = float(np.abs(first - last).mean())
        check("loop (last ~ first)", diff < 0.12, f"mean diff {diff:.3f} (<0.12)", warn=True)

    # contact sheet for a human/agent glance
    sheet = a.sheet or os.path.splitext(v)[0] + "_qa.jpg"
    ts = [0, 1] + [round(dur * k / 6, 2) for k in range(1, 6)] + [max(0, dur - 0.1)]
    with tempfile.TemporaryDirectory() as td:
        for i, t in enumerate(ts):
            sh(["ffmpeg", "-v", "error", "-y", "-ss", str(t), "-i", v, "-frames:v", "1", "-vf",
                f"scale=270:480,drawtext=text='{t:.1f}s':x=8:y=8:fontsize=22:fontcolor=white:box=1:boxcolor=black@0.5",
                f"{td}/{i:02d}.jpg"])
        sh(["ffmpeg", "-v", "error", "-y", "-pattern_type", "glob", "-i", f"{td}/*.jpg",
            "-vf", "tile=4x2", "-frames:v", "1", sheet])

    fails = 0
    for st, name, detail in results:
        print(f"{st:4}  {name:24} {detail}")
        fails += st == "FAIL"
    print(f"\n{'ALL PASS' if not fails else f'{fails} FAIL'}  · contact sheet: {sheet}")
    sys.exit(1 if fails else 0)

if __name__ == "__main__":
    main()
