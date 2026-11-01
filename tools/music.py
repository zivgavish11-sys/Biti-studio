#!/usr/bin/env python3
"""Original soft lo-fi background track, different every episode (seeded).
Usage: music.py OUT.wav DURATION_SECONDS [--seed N]
"""
import sys, wave, argparse, numpy as np
from scipy.signal import butter, lfilter

SR = 44100
PROGS = [  # chord tones as MIDI (root position-ish), 4 chords each
    [[57, 60, 64, 67], [53, 57, 60, 64], [48, 55, 59, 64], [55, 59, 62, 64]],   # Am7 Fmaj7 Cmaj7 G6
    [[50, 53, 57, 60], [55, 59, 62, 65], [48, 52, 55, 59], [57, 60, 64, 67]],   # Dm7 G7 Cmaj7 Am7
    [[52, 55, 59, 62], [57, 60, 64, 67], [50, 53, 57, 60], [55, 59, 62, 66]],   # Em7 Am7 Dm7 Gmaj7
    [[53, 57, 60, 64], [52, 55, 59, 62], [50, 53, 57, 60], [48, 52, 55, 59]],   # Fmaj7 Em7 Dm7 Cmaj7
]
def mid(n): return 440 * 2 ** ((n - 69) / 12)
def lpf(x, fc, o=2): b, a = butter(o, fc / (SR / 2)); return lfilter(b, a, x)
def hpf(x, fc, o=2): b, a = butter(o, fc / (SR / 2), 'high'); return lfilter(b, a, x)

def make(dur, seed):
    r = np.random.default_rng(seed); N = int(SR * dur); t = np.arange(N) / SR
    bpm = int(r.integers(80, 97)); beat = 60 / bpm; bar = beat * 4; tr = int(r.integers(-3, 4))
    chords = [[n + tr for n in c] for c in PROGS[int(r.integers(len(PROGS)))]]
    cl = bar * 2; nch = int(dur / cl) + 2
    pad = np.zeros(N)
    for k in range(nch):
        s0 = int(k * cl * SR); s1 = min(N, int((k + 1) * cl * SR) + int(0.6 * SR))
        if s0 >= N: break
        tt = np.arange(s1 - s0) / SR; env = np.minimum(1, tt / 1.2) * np.minimum(1, np.maximum(0, (cl + 0.6 - tt) / 0.9))
        for n in chords[k % 4]:
            for det in (-0.08, 0.08):
                ph = (mid(n - 12) * 2 ** (det / 12) * tt) % 1; pad[s0:s1] += (2 * ph - 1) * env * 0.05
    pad = lpf(pad, 700 + 500 * r.random())
    bass = np.zeros(N)
    for k in range(nch * 2):
        s0 = int(k * bar * SR); s1 = min(N, int((k + 1) * bar * SR))
        if s0 >= N: break
        tt = np.arange(s1 - s0) / SR; f = mid(chords[(k // 2) % 4][0] - 24)
        bass[s0:s1] += np.sin(2 * np.pi * f * tt) * np.exp(-tt * 1.2) * np.minimum(1, tt / 0.02) * 0.28
    arp = np.zeros(N); step = beat / 2; pats = [[0, 2, 1, 3, 2, 1, 3, 2], [0, 1, 2, 3, 2, 1, 0, 2], [3, 2, 0, 2, 1, 2, 0, 1]]; pat = pats[int(r.integers(3))]
    for k in range(int(dur / step)):
        s0 = int(k * step * SR); s1 = min(N, s0 + int(1.2 * SR)); tt = np.arange(s1 - s0) / SR
        ch = chords[int(k * step / cl) % 4]; f = mid(ch[pat[k % 8]] + 12)
        env = np.exp(-tt * 5.5) * np.minimum(1, tt / 0.004)
        arp[s0:s1] += (np.sin(2 * np.pi * f * tt) + 0.3 * np.sin(4 * np.pi * f * tt) * np.exp(-tt * 8)) * env * (0.07 if k % 2 == 0 else 0.05)
    arp = lpf(arp, 3500)
    dr = np.zeros(N)
    for k in range(int(dur / beat)):
        s0 = int(k * beat * SR)
        if k % 4 in (0, 2):
            L = min(int(0.35 * SR), N - s0); tt = np.arange(L) / SR; f = 55 + 70 * np.exp(-tt * 30)
            dr[s0:s0 + L] += np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 9) * 0.45
        if k % 4 in (1, 3):
            L = min(int(0.12 * SR), N - s0); tt = np.arange(L) / SR
            dr[s0:s0 + L] += hpf(r.standard_normal(L), 1800) * np.exp(-tt * 35) * 0.12
        for h in (0, 0.5):
            s = s0 + int(h * beat * SR); L = max(0, min(int(0.05 * SR), N - s))
            if L: tt = np.arange(L) / SR; dr[s:s + L] += hpf(r.standard_normal(L), 7000) * np.exp(-tt * 80) * (0.05 if h else 0.035)
    mix = pad + bass + arp + dr * 0.8
    R = np.roll(mix, int(0.012 * SR)) * 0.95 + mix * 0.05
    fade = np.minimum(1, t / 1.5) * np.minimum(1, (dur - t) / 2.5)
    st = np.stack([mix * fade, R * fade], 1); st /= np.max(np.abs(st)) * 1.12
    return st, bpm

if __name__ == "__main__":
    ap = argparse.ArgumentParser(); ap.add_argument("out"); ap.add_argument("dur", type=float); ap.add_argument("--seed", type=int, default=1)
    o = ap.parse_args(); st, bpm = make(o.dur, o.seed)
    wf = wave.open(o.out, "wb"); wf.setnchannels(2); wf.setsampwidth(2); wf.setframerate(SR); wf.writeframes((st * 32767).astype(np.int16).tobytes()); wf.close()
    print("music", o.out, f"{bpm}bpm")
