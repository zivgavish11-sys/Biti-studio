#!/usr/bin/env python3
"""Synthesize subtle sound effects at the cue times in EPDIR/sfx.json -> EPDIR/sfx.wav
Cue kinds: whoosh (scene change), blip (chip/label appears), pop (follow card), ping, rise.
Usage: sfx.py EPDIR DURATION_SECONDS
"""
import sys, json, os, wave, numpy as np
from scipy.signal import butter, lfilter
SR = 44100
def bp(x, lo, hi): b, a = butter(2, [lo / (SR / 2), hi / (SR / 2)], 'band'); return lfilter(b, a, x)
def whoosh(r):
    L = int(0.7 * SR); t = np.arange(L) / SR; n = r.standard_normal(L)
    out = np.zeros(L); seg = 512
    for i in range(0, L, seg):
        k = i / L; lo = 300 + 2500 * k; out[i:i + seg] = bp(n[i:i + seg] if i + seg <= L else n[i:], lo, lo * 2.2)[:len(out[i:i + seg])]
    env = np.sin(np.pi * np.minimum(1, t / 0.7)) ** 2
    return out * env * 0.35
def blip(r):
    L = int(0.09 * SR); t = np.arange(L) / SR; f = 1100 + 900 * t / t[-1]
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 40) * 0.18
def pop(r):
    L = int(0.25 * SR); t = np.arange(L) / SR; f = 600 + 900 * np.exp(-t * 25)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 14) * 0.3
def ping(r):
    L = int(0.6 * SR); t = np.arange(L) / SR
    return (np.sin(2 * np.pi * 1760 * t) + 0.4 * np.sin(2 * np.pi * 2640 * t)) * np.exp(-t * 7) * 0.12
def rise(r):
    L = int(1.0 * SR); t = np.arange(L) / SR; f = 200 + 1200 * t ** 2
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.minimum(1, t / 0.9) * np.exp(-np.maximum(0, t - 0.9) * 40) * 0.08
KIND = {"whoosh": whoosh, "blip": blip, "pop": pop, "ping": ping, "rise": rise}
if __name__ == "__main__":
    ep, dur = sys.argv[1], float(sys.argv[2]); r = np.random.default_rng(3)
    cues = json.load(open(os.path.join(ep, "sfx.json"))); N = int(dur * SR); out = np.zeros(N)
    for c in cues:
        snd = KIND.get(c["k"], blip)(r); s = int(max(0, c["t"] - (0.35 if c["k"] == "whoosh" else 0)) * SR)
        e = min(N, s + len(snd)); out[s:e] += snd[:e - s]
    out = np.clip(out, -1, 1); st = np.stack([out, out], 1)
    wf = wave.open(os.path.join(ep, "sfx.wav"), "wb"); wf.setnchannels(2); wf.setsampwidth(2); wf.setframerate(SR); wf.writeframes((st * 32767).astype(np.int16).tobytes()); wf.close()
    print(len(cues), "sfx cues")
