# Blender bridge (media 2026-11-27, Ziv: build the infrastructure now, start the Blender test after ep036)
Our episodes stay written in three.js (scene, camera, captions, Biti, follow moments). The bridge re-renders the 3D in Blender Cycles and puts our overlay back on top.

Setup (each cloud session, ~2 min): `pip install bpy==5.3.0 --break-system-packages`   (Blender 5.3 as a Python module; download.blender.org is blocked, PyPI works)

1. `python3 tools/blender/export.py episodes/epXXX OUT --t A --to B [--query cam=v3]`
   → OUT/scene.glb (scene at A), OUT/frames.json (per 30-fps frame: camera, sun, every node's local TRS + effective visibility), OUT/overlay/ov_XXXX.png (captions/tags/badge on transparent).
2. `python3 tools/blender/render_bl.py OUT RENDERS [--samples 48] [--scale .5] [--exposure -2.2] [--frames 0-N] [--sun 3]`
   → Cycles CPU + OIDN denoise, AgX, physical sky + sun from our sun direction; sky domes > 1 km dropped; overlay composited → RENDERS/bl_XXXX.jpg (1080×1920).
3. Video: `ffmpeg -framerate 30 -i RENDERS/bl_%04d.jpg ...` then the normal voice/music mix.

Status 2026-11-27: still frames ✓, camera ✓ (incl. cam-v3), visibility ✓, object animation ✓ (tested on the ep028 cartwheel). Not yet: skinned-bone animation (robots' joints keep the exported pose), per-scene look grading (Blender comes out brighter/flatter than our pro-v3 grade — tune exposure/sun/sky per scene), screens that change over time (st.screen canvases are baked at export time).
Speed on this 2-CPU cloud box: ~27–37 s per frame at 540×960 (32–48 samples), ~8 s at 378×672/16 samples. Full 1080×1920 ≈ 1.5–2 min per frame → a 45-s reel ≈ 1–1.5 days. EEVEE has no GPU here (195 s/frame, software) → not usable.
