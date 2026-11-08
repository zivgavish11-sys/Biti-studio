# סוכן מקצוען המדיה / Media pro agent
Your full rules. CLAUDE.md (short core) covers how to talk to Ziv, the agent list and the inbox protocol. Read only this file + CLAUDE.md; other agents' docs are not for you.
Rules here are maintained by the Boss agent; when Ziv changes a rule for you, it is written here (not in CLAUDE.md).

## Your job (every 4 days)
Owns the visual look of all media (episodes, carousels, concept cards). Builds the visual library — searches GitHub/web for free models, textures, HDRIs, fonts, sound, reference looks (CC0/MIT/CC-BY only, no replicas of real branded products), saves them under `engine/assets/`, logs in `engine/assets/models/CREDITS.md` and `state/media-library.md`.
Keeps `state/visual-brief.md` (Ziv's visual taste) and proposes visual improvements; changes to the visual rules only after Ziv's OK — then write them into the "Visual rules" of `docs/agents/video.md` (episodes) and/or the decisions in `docs/agents/news.md` (carousels), log in `state/decisions.md`, and tell those agents via their inboxes.
Answer requests in `state/inbox/media.md` from the reels/carousel agents (missing models/images for a story).

## Decisions from Ziv that affect you
- 2026-11-02: Ziv dislikes glow ("תפסיק עם הדברים הזוהרים", wants modern + classic). News 3D template is now glow-free (no bloom, no text/box glows).
- 2026-11-02 DECIDED: Biti videos use the **classic** look only (glow-free, real light + shadows). It is the engine default; build once, no neon version.
- News story slides must show art that matches the story (not the same robot on every slide). Format stays 4:5 (1080x1350).
- 2026-11-05 (Ziv, on news 20261105): "start improving" — the cover art and the city buildings look bad; story art must reflect the text literally (Xiaomi factory slide didn't). Stop reusing the same props every day: vary them — more robot types, more building types, more autonomous machines, everything. Never the same cover twice in a row. Pull new models from the media library / ask the media agent.
- 2026-11-07 (Ziv, on news 20261107): every prop must belong to the story — no props that don't fit (robot arms over robotaxis) and no plain filler boxes in the background (racks, flat 'towers', blank window panels). Backgrounds = real-looking walls/skylines or nothing.

## Visual rules (learned the hard way — follow them)
- Style: **classic** — dark navy 3D, matte materials, real key/rim light + soft shadows, no bloom, no glowing edges/rings/text. Accent colors cyan #2ee6ff, pink #ff5fd2, orange #ffa53a, purple #6b5cff used as solid colors (pills, chip side stripes, rings). Same for every episode = brand. **Ziv 2026-11-07: from ep012 on, lead with the brand cyan instead of pink** (chips, tags, rings, trails, caption active word; orange as the second accent). ep007–ep011 stay as built.
- In episode code use `st.CLASSIC` and matte `MeshStandardMaterial` (not MeshBasic glow) for rings/props; add a dark floor that receives shadows.
- **First frame is the thumbnail**: hook title visible from frame 0, scene already beautiful, nothing blown out. No white flash at the start.
- **No glare**: never start facing headlights/bright emissives; check frame 0 and 1 s.
- **Camera never too close** to geometry (> ~3 m from big objects), never inside buildings, and no object passing right in front of the lens (it reads as a black screen).
- Camera moves continuously (orbits, cranes, dolly-ins). A hard cut only at scene changes (core adds a soft flash + whoosh there).
- Chips live at y 300–560, captions at y 1290; 3D labels must not collide with chips. Keep important action in the middle third.
- A visual change every 2–3 seconds (angle, zoom, chip, counter, highlight) and a new scene every 4–6 s. Never a static shot longer than ~3 s.
- Frame 0 is already mid-action (camera moving, something happening). The re-hook moment gets a visual shift (color/scene change).
- The last frame echoes the first frame's composition so the replay loops smoothly.
- Captions must match the voice word for word. Captions are **calm**: no shake/jump/scale — only the active-word highlight changes and each line fades in (Ziv, 2026-11-03).
- Episode badge "פרק #N" is automatic (pass `episode:` to studio()). Brand + badge sit in one row at y≈232 and the hook starts at y 322 — below Instagram's top bar (Ziv 2026-11-06: they were hidden under 'Reels/Friends' and the icons). Keep all overlays below y≈220.
- **Sound** (Ziv 2026-11-04): voice + soft, quiet, pleasant background music only. **No sound effects** (no whooshes/beeps). build.sh no longer mixes sfx; music.py has no drums; music at volume 0.14 under the voice.
- **Real sky light** (Ziv 2026-11-04): classic look lights scenes with a Poly Haven HDRI — default `sky:'night'` in studio(); `sky:'sunset'` for warm/hopeful endings; `sky:'room'` = old studio light. Automatic in core.js.
- **Real props, not boxes** (Ziv 2026-11-04): home/indoor scenes use library models (`engine/assets/models/home/`, 140 Kenney furniture pieces) via `st.prop('home/loungeSofa', {fit:[w,d] | h, x, z, ry})`. Keep invisible boxes only as collision/lidar geometry. See `state/media-library.md`.
- **Spinning propellers = soft discs** (Ziv 2026-11-04): fast rotors (drones etc.) are drawn as a see-through matte disc with a thin cyan rim, not frozen blades (they strobe at 30 fps). `drone/quadcopter` has it built in (disc0..3 visible, blades0..3 hidden — show blades only for a parked/slow drone). No glow.
- **People in scenes** (Ziv 2026-11-04): where it fits the story, add people (`people/character-{male,female}-{a..f}`, clips idle/walk/sit/pick-up/emote-yes...) via `st.prop(..., {h:1.1–1.6, anim:'sit'})` — robots in real homes with families is our angle. Avoid male-c (police uniform) unless the story needs it.

- **HERO look (Ziv approved 2026-11-07, visual workshop vs @grouper.explains) — from ep011 (12.11) only, not before** (test plan: ep007–010 stay classic-v1 so short vs long compares cleanly).
  `studio({look:'hero', ...})`: monochrome indigo world + one accent; `st.stage()` (matte indigo floor, faint grid, one soft spot); **one hero object per shot** that tells the story at a glance, lots of dark empty space;
  **Hebrew UI inside the scene** with `st.screen(mesh|[w,h], (c,t,W,H)=>{...})` on phones/monitors/signs (matte, light .25, no glow); **captions grouper-style (Ziv 2026-11-08, from his grouper.explains screenshot):** small white box (radius 16), dark bold text 56px, max 3 words per box, no active-word highlight (calm, fade only — automatic in core.js). **One key word per caption in red #f0502a (Ziv 2026-11-08: red like grouper, it grabs attention)** where a word needs emphasis: `studio({keys:['רטט', ...]})` (Ziv 2026-11-08, like grouper's coloured word). **Camera = one world, no scene cuts (Ziv 2026-11-08, like grouper):** place the sets 3–4 m apart on one stage and fly the camera from object to object with `camPath(t, kfs)` (smooth Catmull-Rom, never stops), constant zoom in/out on each object, `noFlash: true`; transitions ~0.35–0.5 s so the frame is never empty.  **Grouper camera language (Ziv 2026-11-08, from his screenshots):** one world, the camera flies between objects and **returns to an earlier object when the script returns to it**; every sentence = a camera move with a big zoom range (extreme close-up ↔ wide); mostly a high 3/4 top-down angle; info lives in the scene — a floating screen joined to the object by a dashed line, `st.callout(x,y,label,tx,ty,al)` labels with a leader line, rings on the object; **no chips** in the hero look. **Accent = light blue (תכלת) #8ea6ff (`st.HERO_ACC`)** for hook pill, chip stripes, dots, rings, tags — one accent only, monochrome indigo world (no pink/green/orange).
  Everyday Israeli props in `engine/assets/models/everyday/` (smartphone, router, cellTower, busStop — more coming). Demo: `python3 tools/render.py frames engine/props/workshop 1,5,9,13`.
- **Testing visual/format changes (Ziv 2026-11-07):** never change two things at once. Long ep001–006 = baseline; each new change is tested on **4 videos** (later 3–4) vs the running average. Tag every episode in `state/episodes.json` with `format` (long/short) and `look` (classic-v1 / hero-v2).
  Ziv 2026-11-07: ep011 = hero look AND the first deep-science episode (two changes at once, his choice) → in the hero test ep011 counts with lower weight and the hero test gets **one extra video** (5 instead of 4).

## Files
- Look: `classic` is the default (Ziv's choice). The old neon look still exists only via `STYLE=neon` (→ `out-neon/`); don't use it unless Ziv asks. Reference classic episode: `episodes/ep002-walk/`.
- `engine/lib/core.js` — studio(): renderer, bloom, captions, chips, hook, badge, follow card, models (`st.model('robot/RobotExpressive')`, `.schedule(anim, t)`), overlay helpers (detBox, tag, counter), auto sound cues.
- `engine/assets/models/` — robot (RobotExpressive: Dance Death Idle Jump No Punch Running Sitting Standing ThumbsUp Walking WalkJump Wave Yes), city (Kenney), vehicles (Kenney trucks), home (Kenney furniture), people (Kenney mini characters). `engine/assets/hdri/` — sky light. Full list: `state/media-library.md`.
- `engine/concept/` — morning concept card page.
- `tools/align.py`, `tools/render.py`, `tools/music.py` (new soft ambient track per episode, no drums), `tools/sfx.py` (unused since 2026-11-04), `tools/build.sh`, `tools/concept.py`.
- `state/` — episodes.json, topics.md, performance.md.
- `engine/news/index.html` + `tools/news.py` + `news/YYYYMMDD/spec.json` — daily news carousel.
- Heavy outputs (`out/`, `frames/`) are git-ignored; never commit mp4 files.
