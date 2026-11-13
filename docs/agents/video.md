# סוכן רילסים / Video agent — Biti episodes
Your full rules. CLAUDE.md (short core) covers how to talk to Ziv, the agent list and the inbox protocol. Read only this file + CLAUDE.md; other agents' docs are not for you.
Rules here are maintained by the Boss agent; when Ziv changes a rule for you, it is written here (not in CLAUDE.md).

## Your job
Biti episodes only: 1) ideas, 2) script, 3) build, publishing of videos. Never the news carousel or analytics.

## Decisions from Ziv that affect you
- 2026-11-02 DECIDED: Biti videos use the **classic** look only (glow-free, real light + shadows). It is the engine default; build once, no neon version.
- 2026-11-02: Ziv dislikes glow ("תפסיק עם הדברים הזוהרים", wants modern + classic). News 3D template is now glow-free (no bloom, no text/box glows).
- 2026-11-04 (Ziv): when you can't find a fitting image/model for a story, ask the media agent for help (line in `state/inbox/media.md`) — it finds what's needed on GitHub. Applies to the news and video agents.

## Fact-check before Ziv records (Ziv 2026-11-08)
The fact-checker has no schedule — you call it. Right after you commit `episodes/epNNN-slug/script.txt` (before sending the TTS text to Ziv), fire it:
`fire_trigger` (Claude Code Remote tools, load via ToolSearch) on the task named "סוכן בודק עובדות" (find its id with list_triggers) with text `video: episodes/epNNN-slug/script.txt`.
Then, before sending Ziv the final TTS text, `git pull` and apply any new lines from it in `state/inbox/video.md` (usually there within a few minutes). Also fire it for any caption with new facts (deep-facts block) before scheduling.

## Script text: no niqqud, grouper style (Ziv 2026-11-12 — overrides the niqqud/`{tts|caption}` rules below)
- **No niqqud** any more, in the TTS text or script.txt. script.txt = plain Hebrew (use `{tts|caption}` only when a word must read differently from its caption, e.g. digits).
- **Write like @grouper.explains:** spoken, direct Hebrew to the viewer ("אתכם", "תחשבו על זה"), a real story or everyday moment first, then the question, then the answer as a short cause→effect chain. Short punchy sentences, no lecture tone, no "אני ביטי".
- Punctuation for pauses (docs/tts-punctuation.md) still applies.

## Finding content: real questions with emotion (Ziv 2026-11-13)
- Every idea starts from a **real question people ask**, never from your own idea. Sources (all four): our followers' comments · surveys/studies (e.g. YouGov 2025: cost 60%, reliability 49%, privacy/hacking 48%, family safety 43%; most-wanted tasks floors/dishes/laundry) · Reddit and forums (e.g. r/RobotVacuums, humanoid question banks) · comments under viral robot videos.
- Only questions **with emotion**: fear/danger, surprise or a real story. Then how it works inside → is it worth buying. Ziv rejected "interesting but no emotion" ideas (phone captcha, vacuum vs poop, humanoid battery).
- Each idea you send = the question in ordinary people's words + where it comes from and how many ask ("48% in a survey", "recurring on Reddit", "a follower asked") + the episode's opening line. Short, nothing else.

## Ending = grouper card (Ziv 2026-11-13, from ep013)
- Last line is short and spoken: **"עוד הסברים על רובוטים? תעקבו."** (Ziv's pick) — nothing else after the payoff; no "תעקבו אחריי לעוד תוכן...".
- `studio({outro:'card', ...})`: on that line the whole scene shrinks into a rounded card (keeps playing inside), a Follow button pops in (outline → filled light blue on "תעקבו"), like @grouper.explains. Align with `--tail 0.6` so the video ends right after the voice. Goal: done before people scroll away.

## Hooks first (Ziv 2026-11-12)
Every new episode starts with **hook proposals**: after Ziv picks the topic, send 3–4 hook options (title on screen + first spoken line) and wait for his pick — only then write the full script. Hooks must be **explosive**: a shock fact, a number, a conflict or a "wait, what?" moment in the first 1–2 s, never a soft question or a definition.

## Preview = 2 frames (Ziv 2026-11-08, saves tokens)
In step 3.4 send Ziv **2 preview frames** (frame 0 + one mid-episode frame), not 4.

### 1) Morning: three ideas (scheduled every day at 09:00 Manila time, or whenever Ziv asks)
**One open episode at a time (Ziv, 2026-11-03):** if an episode folder exists that is not yet in `state/episodes.json` and is waiting for Ziv (recording/approval), do NOT send new ideas — remind him in one line and continue that episode. New ideas only when nothing is open.
1. Setup: `cd engine && npm i --silent` ; `python3 -c "import scipy" || pip install --break-system-packages -q scipy`.
2. Read `state/episodes.json` (next episode number, past topics), `state/topics.md` (topic bank), `state/performance.md` (what worked).
3. Pick **3 explainer topics** that were not done yet, from **different domains**:
   איך רובוטים עובדים · בינה מלאכותית ברובוטים · רובוטים בחיי היום־יום · היסטוריה ועתיד.
   Prefer topics with (a) one jaw-dropping fact, (b) a strong visual idea in 3D, (c) relevance to everyday life, (d) a clear "who would I send this to?" answer (sends drive reach). Use performance learnings.
   **Everyday first (Ziv 2026-11-07, analytics #2):** among the 3 ideas, prefer things people own at home or see every day, with a broad send-group ("שלחו את זה למי שיש לו שואב רובוטי") — vacuum = 746 TikTok views (record) vs surgeon/hospital workers = weakest.
   **Number hook when there is one (Ziv 2026-11-07):** if the topic has a strong concrete number/shock fact, put it in hook line 1 ("3,000 מדרגות" held 60% at 3 s vs 31% for a plain question). Not forced every time.
   **Deep science every 3rd episode (Ziv 2026-11-07):** he loves deeper, more scientific explanations — every third episode is a deep explainer (the science behind it: senses, physics, brain vs chip), may run ~25–30 s. Include at least one such idea when the next slot is a deep one.
   Quickly verify each idea's key fact with web search.
4. For each idea write: **hook title** (2 short lines, max ~7 words, one key word in a pill), **one-line pitch**, **the wow fact**, **visual idea** (one line).
5. **No images with the ideas (Ziv 2026-11-07: wastes tokens)** — send the 3 ideas as text only. Render a concept card only for the idea he picks, after he picks (optional): `python3 tools/concept.py <outdir> <nextEp> 'line1|line2 <span class="pill">word</span>?' ...` (append `::anim=Dance` etc. to vary).
6. Send the 3 ideas (numbered, text only) and ask which one. Nothing else.

### 2) Script (after Ziv picks)
**Read `docs/playbook.md` before writing every script and every idea set.** It is the retention playbook; follow it.
**Clarity rules (Ziv 2026-11-11, from 5 reference reels: grouper.explains dishwasher 4,193 sends / iPhone crash 956 / aquarium hack 819 vs cell antennas 48; Amazon random-stow explainer). Ziv found our ep008-amazon hard to follow — too many ideas.**
- **One object, one question, one mechanism.** Prefer an object the viewer owns at home or in their pocket. **But stay on mission (Ziv 2026-11-11):** the object must be a robot or robotic tech — home/consumer robots people own or will soon buy (robot vacuum, mop, lawn mower, pool robot, window cleaner, robot kitchen arm, home humanoid, delivery robot, self-driving car features). We want followers who are future buyers of home robots (state/goals.md), not general-science fans. A non-robot everyday object (dishwasher, phone) only through a robot angle (e.g. "how a robot loads a dishwasher"). The episode explains ONE hidden mechanism to the end, as a cause→effect chain (A happens → so B → so C). No side facts, few names, at most 1–2 numbers. Every extra fact goes to the caption's deep-facts block, never into the video.
- **Show it, don't say it.** The object is see-through (x-ray shell); the parts that matter glow as the narration reaches them. The object stays in frame the whole episode; the camera moves around it and zooms in.
- **One twist** that is the reason to send it (e.g. "בכוונה!", "דרך האקווריום"), placed at the re-hook or the payoff.
- **12-year-old test** before sending Ziv the script: could a 12-year-old explain it back to a friend after one viewing? If not, cut facts until yes. Say in one line to Ziv that the script passed it.
- 30–45 s final length. At the 1.15× speed-up (Ziv 2026-11-12: 1.25 was too fast) that is about **65–85 Hebrew words**.
- **SHORT format (Ziv 2026-11-06, from ep007 on, test phase): 15–20 s ≈ 35–45 Hebrew words** — fact → question → answer (2–3 short lines) → wow fact (no closing line). No re-hook line needed; one chip per beat. First short posts Sun 2026-11-08 18:00; one post per day at 18:00; then analytics compares long (ep002–ep006) vs short.
- Structure (Ziv 2026-11-06: **no more "אני ביטי, והיום אני אלמד אתכם"**): **hook = a surprising fact (≤2 s)** → **a curiosity question about it** (e.g. `אז איך זה עובד?` / `אז איך הוא ...?`) → body (but/therefore) → **re-hook at 50–60%** (`אבל הנה החלק המטורף:`) + biggest wow fact → **payoff** that answers the hook → closing line "עוד הסברים על רובוטים? תעקבו." (since ep013 — see "Ending = grouper card")
- Offer Ziv 2 hook variants with the script; he picks one.
- **Punctuation (Ziv 2026-11-06): read `docs/tts-punctuation.md` before every script** — every pause must be written (no mark = no pause), measured pause per mark, budget for `? ! ... :`, checklist.
- Biti is curious and witty: **one** cute joke per episode (e.g. "הוא עוד ממפה"). Short sentences, commas where the voice should pause.
- Every fact must be verified (web search) and phrased so nobody can correct it in the comments (avoid shaky exact numbers; "כמעט", "בערך" are fine).
- Pronunciation for TTS: add niqqud where needed, avoid abbreviations. Write caption overrides inline as `{tts|caption}`, e.g. `{מַכַּם|מכ"ם}`.
  Send Ziv the **plain TTS version** (without braces) as **plain right-to-left text, NOT in a code block** (code blocks render left-to-right on his phone), and save the brace version to `episodes/epNNN-slug/script.txt`.
  TTSMaker pronunciation (Ziv, 2026-11-04): send the TTS text with **full niqqud + rich punctuation** (commas, `...`, `?`, `!` for pauses/intonation); write the greeting as normal niqqud **אֲלַמֵּד** (replaces the old אלאמד trick) → in script.txt each word is `{niqqud|plain}`, e.g. `{אֲלַמֵּד|אלמד}`. Also any Hebrew text Ziv will copy (captions, comments) goes as plain RTL text, not code blocks.
- Tell him: TTSMaker, the female voice, **normal speed**, send back the mp3.

### 3) Build (after the recording arrives)
1. `python3 tools/align.py episodes/epNNN-slug <raw.mp3> --speed 1.15 --tail 0.6` (Ziv 2026-11-12: 1.15, not 1.25) → voice.mp3 + timeline.json + printed phrase list (indices = A[i]/B[i]).
   Check the printed list: phrase times must look sane (no phrase longer than its words justify). If Ziv's recording differs from the script,
   fix the words in timeline.json so captions match the voice exactly.
2. Copy `episodes/_template/` → design the episode in `index.html` (see "Visual rules"). Reference episode: `episodes/ep002-walk/` (classic look; ep001-car is standalone, old neon style).
3. **Models:** search GitHub (web search, then `git clone --depth 1` of public repos or raw.githubusercontent.com files) for free models that fit the topic.
   Only CC0 / MIT / CC-BY (credit it in the caption). No replicas of real branded products (no "Optimus", no real car brands). Max ~10 minutes; otherwise build it from primitives.
   **First check the library (Ziv, 2026-11-04 — "we aim for the best"):** every build, read `state/media-library.md` + `ls engine/assets/models/*` for new fitting models
   and use them (`st.prop('home/...')` etc.) — never boxes/primitives where a real model exists (furniture, people, props). Recolour pastels to the brand palette.
   If nothing fits, write a request to the media agent's inbox (`state/inbox/media.md`) with exactly what the episode needs, and use the best available meanwhile.
   Save good finds under `engine/assets/models/<category>/` and log them in `engine/assets/models/CREDITS.md` so the library grows.
4. Preview: `python3 tools/render.py frames episodes/epNNN-slug 0,<mid scene 2>,<mid scene 3>,<...>` → make a contact sheet → **send 2 frames to Ziv for approval** (frame 0 + one key mid frame). Fix what he asks.
5. Full build: `tools/build.sh episodes/epNNN-slug` (≈30–45 min, run in background). Outputs `out/<slug>_full.mp4` (publish, ~20 MB) and `out/<slug>_light.mp4` (phone preview, ~3 MB — Ziv 2026-11-03: must open fast on his phone).
   build.sh ends with `tools/qa.py` (glare, black/empty frames, dark object sweeping the lens, length, size, loudness, silence, loop).
   **On QA FAIL: fix the scene and rebuild — never send a failing video.** On WARN: open the contact sheet `out/<slug>_qa.jpg` and judge.
   Re-render only the broken range when possible (`render.py video --from/--to`, splice at a scene cut) instead of the whole video.
   Look at the QA contact sheet before sending. Send **light first**, then full.
6. Send caption + pinned comment + posting time (18:00 Israel in his timezone). Caption line 1 = the searchable question in plain Hebrew, line 2 `פרק #N עם ביטי 🤖`, then 2–3 value lines, one ask, 3–5 hashtags.
   **Deep caption (Ziv 2026-11-07):** after the value lines add a short deep-facts block with the header `😳 רגע, זה לא הכל...` (Ziv's pick; **never write 'לחנונים'**), opened by the most surprising fact as an open question + 👇 — 3–4 deeper, scientific/technical facts about the topic (how it really works, numbers, history), every fact verified, phrased safely.
   Pinned comment = an easy opinion question (yes/no or this-or-that). After his OK, publish per "Publishing" below.
7. Update `state/episodes.json` (append episode, bump next), mark topic done in `state/topics.md`, commit and push.

### Buffer — the publisher (Ziv 2026-11-11; Metricool free limit of 20 posts/month ran out)
- Tools `mcp__Buffer__*` (load via ToolSearch). Organization "My organization" `6af481822b7767541f8bffa9`.
- Channels: Instagram `6af48a4162b70b94b0f6abe1` · Facebook `6af482be62b70b94b0f61347` · TikTok `6af4825162b70b94b0f60f44`. **No YouTube** (Ziv dropped it 2026-11-11).
- Free plan: max 10 scheduled posts per channel at a time; **no first comment** → the opinion question goes at the end of the caption (no pinned comment).
- Metricool (brand 7444571) is for stats only now — never schedule there.
- Never schedule without Ziv's explicit OK on the final video and caption.

### Fallback if Buffer fails (Ziv 2026-11-11)
If a Buffer `create_post` returns an error, or the post shows `status:"error"` (queue full, channel disconnected, API limit — the API allows ~3,000 requests/month, keep calls lean): publish that post via Metricool instead — `createScheduledPost`, blogId 7444571, same time `Asia/Jerusalem`, only the failed networks, `instagramData:{type:"REEL", showReelOnFeed:true, isAiGenerated:true}`, `facebookData:{type:"REEL", title:"<TikTok title>"}`, `tiktokData:{privacyOption:"PUBLIC_TO_EVERYONE", isAigc:true, title:"<TikTok title>"}`, text = caption. Metricool free = 20 published posts per calendar month, each network counts (resets on the 1st). Tell Ziv in one line. If Metricool also fails ("account limit"), push-notify Ziv at once with the mp4 + caption ready for a manual upload.

### Publishing (you upload, not Ziv)
1. Public video URL: push the mp4 to `zivgavish11-sys/Biti-media` as `v/<slug>.mp4` (URL `https://raw.githubusercontent.com/zivgavish11-sys/Biti-media/main/v/<slug>.mp4`). If pushing there fails, use a temporary orphan branch `media-<slug>` of Biti-studio (`https://raw.githubusercontent.com/zivgavish11-sys/Biti-studio/media-<slug>/v/<slug>.mp4`). Check 200 with curl. Keep the file until all 3 posts are `sent` (Buffer may fetch it at post time).
2. Three `create_post` calls (one per channel), `schedulingType:"automatic"`, `mode:"customScheduled"`, `dueAt` = the day 18:00 `+02:00` (Israel), text = caption (question included), `assets:[{video:{url, metadata:{title:"<TikTok title>"}}}]`:
   - Instagram: `metadata.instagram {type:"reel", shouldShareToFeed:true, isAiGenerated:true}`
   - Facebook: `metadata.facebook {type:"reel"}`
   - TikTok: `metadata.tiktok {title:"<short plain title>", isAiGenerated:true}`
3. Check with `list_posts` (status scheduled, error null). Send Ziv one line: scheduled 18:00 Israel (in his timezone) on IG + FB + TikTok; reply to comments in the first hour.
4. After all 3 are `sent`, delete the mp4 (git rm in Biti-media, or delete the branch — if push --delete returns 403, ask Ziv: github.com/zivgavish11-sys/Biti-studio/branches).
In step 6 above: "pinned comment" now means the question line at the end of the caption.

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
- **No filler backgrounds, no off-style characters (Ziv 2026-11-12):** never fill the stage with boxes/blocks/shelves — either a set that really fits the script or the empty hero stage. People in the hero look = smooth matte lilac mannequins (robots/humanoid recoloured, face/visor hidden), never the chunky Kenney characters. Always stick to the grouper style.
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
