#!/usr/bin/env python3
"""Speed up the raw TTS narration and align the script to it -> timeline.json

Usage: align.py EPDIR RAW_AUDIO [--speed 1.25]
  EPDIR/script.txt : the narration exactly as pasted into TTSMaker.
     Display overrides for captions: {tts text|caption text}  e.g. {מַכַּם|מכ"ם}
Writes EPDIR/voice.mp3 and EPDIR/timeline.json, and prints the phrase list with indices
(episode pages use these indices: A[i] = start of phrase i, B[i] = end of phrase i).
"""
import sys, os, re, json, subprocess, argparse

def speech_segments(path, noise="-35dB", d=0.16):
    out = subprocess.run(["ffmpeg", "-i", path, "-af", f"silencedetect=noise={noise}:d={d}", "-f", "null", "-"], capture_output=True, text=True).stderr
    ss = [float(x) for x in re.findall(r"silence_start: ([\d.]+)", out)]; se = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", out)]
    dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", path], capture_output=True, text=True).stdout)
    segs = []; cur = 0.0
    for a, b in zip(ss, se):
        if a - cur > 0.05: segs.append([cur, a])
        cur = b
    if dur - cur > 0.08: segs.append([cur, dur])
    return segs, dur

def phrases_from(text):
    disp = re.sub(r"\{[^|}]*\|([^}]*)\}", r"\1", text)          # caption text
    parts = re.findall(r"[^,.?!:\n]+[,.?!:]*", disp)
    return [p.strip() for p in parts if p.strip() and re.search(r"\w", p)]

def align_groups(phr, segs):
    """2026-11-07: assign whole phrases to speech segments (each segment = 1+ consecutive phrases), DP on chars-vs-duration fit;
    TTS often skips the pause at a comma, so a segment may hold several phrases. Inside a segment, split by characters."""
    n, m = len(phr), len(segs); w = [len(p.replace(" ", "")) + 2 for p in phr]; W = sum(w)
    D = [b - a for a, b in segs]; T = sum(D); import math
    INF = 1e18; dp = [[INF] * (n + 1) for _ in range(m + 1)]; bk = [[0] * (n + 1) for _ in range(m + 1)]; dp[0][0] = 0
    for j in range(1, m + 1):
        for i in range(j, n - (m - j) + 1):
            for k in range(j - 1, i):
                if dp[j - 1][k] >= INF: continue
                c = sum(w[k:i]) / W; d = D[j - 1] / T
                cost = dp[j - 1][k] + math.log(c / d) ** 2
                if cost < dp[j][i]: dp[j][i] = cost; bk[j][i] = k
    out = [None] * n; i = n
    for j in range(m, 0, -1):
        k = bk[j][i]; a, b = segs[j - 1]; tot = sum(w[k:i]); t = a
        for q in range(k, i):
            d = (b - a) * w[q] / tot; out[q] = [t, t + d]; t += d
        i = k
    return out

def align(phr, segs):
    if len(segs) == len(phr): return [list(x) for x in segs]
    if len(segs) < len(phr): return align_groups(phr, segs)
    speech = sum(b - a for a, b in segs)
    w = [len(p.replace(" ", "")) + 2 for p in phr]; tot = sum(w)
    def at(frac):
        tau = frac * speech
        for a, b in segs:
            if tau <= b - a: return a + tau
            tau -= b - a
        return segs[-1][1]
    exp, c = [], 0
    for x in w[:-1]: c += x; exp.append(at(c / tot))
    gaps = [((segs[j][1] + segs[j + 1][0]) / 2, -1.5 * (segs[j + 1][0] - segs[j][1])) for j in range(len(segs) - 1)]
    cands = sorted(gaps + [(e, 1.4) for e in exp])
    P1, C = len(exp), len(cands); INF = 1e18
    dp = [[INF] * C for _ in range(P1)]; bk = [[-1] * C for _ in range(P1)]
    for j in range(C): dp[0][j] = abs(cands[j][0] - exp[0]) + cands[j][1] + 3
    for i in range(1, P1):
        best, bj = INF, -1
        for j in range(C):
            if j - 1 >= 0 and dp[i - 1][j - 1] < best: best, bj = dp[i - 1][j - 1], j - 1
            if best < INF: dp[i][j] = best + abs(cands[j][0] - exp[i]) + cands[j][1] + 3; bk[i][j] = bj
    j = min(range(C), key=lambda k: dp[P1 - 1][k]); bounds = [0] * P1
    for i in range(P1 - 1, -1, -1): bounds[i] = cands[j][0]; j = bk[i][j]
    edges = [0.0] + bounds + [segs[-1][1] + 0.01]
    out = []
    for k in range(len(phr)):
        L, R = edges[k], edges[k + 1]
        inside = [(max(a, L), min(b, R)) for a, b in segs if b > L and a < R]
        out.append([inside[0][0], inside[-1][1]] if inside else [L, R])
    return out

def main():
    ap = argparse.ArgumentParser(); ap.add_argument("epdir"); ap.add_argument("raw"); ap.add_argument("--speed", type=float, default=1.25)
    o = ap.parse_args()
    voice = os.path.join(o.epdir, "voice.mp3")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", o.raw, "-af", f"atempo={o.speed}", "-ar", "44100", voice], check=True)
    text = open(os.path.join(o.epdir, "script.txt"), encoding="utf-8").read()
    phr = phrases_from(text); segs, dur = speech_segments(voice)
    spans = align(phr, segs)
    chunks = []
    for i, (p, (a, b)) in enumerate(zip(phr, spans)):
        ws = p.split(); L = sum(len(x) + 2 for x in ws); t = a; sw = []
        for x in ws:
            d = (b - a) * (len(x) + 2) / L; sw.append({"w": x, "a": round(t, 3), "b": round(t + d, 3)}); t += d
        groups = [sw] if len(sw) <= 4 else [sw[k:k + 3] for k in range(0, len(sw), 3)]
        if len(groups) > 1 and len(groups[-1]) == 1: groups[-2] += groups.pop()
        for g in groups: chunks.append({"a": g[0]["a"], "b": g[-1]["b"], "words": g, "seg": i})
    for i, c in enumerate(chunks):
        nb = chunks[i + 1]["a"] if i + 1 < len(chunks) else c["b"] + 1.2
        c["b"] = round(min(nb, c["b"] + 0.6), 3)
    tl = {"segA": [round(a, 3) for a, b in spans], "segB": [round(b, 3) for a, b in spans], "chunks": chunks,
          "end": round(dur + 1.0, 2), "phrases": phr, "speed": o.speed}
    json.dump(tl, open(os.path.join(o.epdir, "timeline.json"), "w"), ensure_ascii=False, indent=1)
    print(f"voice {dur:.2f}s, {len(segs)} speech segments, {len(phr)} phrases")
    for i, (p, (a, b)) in enumerate(zip(phr, spans)): print(f"{i:2d}  {a:6.2f}-{b:6.2f}  {p}")

if __name__ == "__main__":
    main()
