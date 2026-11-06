#!/usr/bin/env python3
"""Pause after each punctuation mark, measured from all episodes' timeline.json (raw-recording seconds). See docs/tts-punctuation.md."""
import json, glob, re, collections, os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
st = collections.defaultdict(list)
for f in sorted(glob.glob(f'{ROOT}/episodes/ep*/timeline.json')):
    if 'ep001' in f: continue
    t = json.load(open(f)); sp = t.get('speed') or 1.25
    W = [(w['w'], w['a'], w['b'], c['seg']) for c in t['chunks'] for w in c['words']]
    for i in range(len(W) - 1):
        m = re.search(r'(\.\.\.|…|[.,?!:;—-])["\']?$', W[i][0]); k = m.group(1) if m else 'none'
        st[k].append((W[i + 1][1] - W[i][2]) * sp)
for k, g in sorted(st.items(), key=lambda x: sum(x[1]) / len(x[1])):
    print(f"{k!r:7} n={len(g):4}  pause raw {sum(g)/len(g):.2f}s  in video {sum(g)/len(g)/1.25:.2f}s")
