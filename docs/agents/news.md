# סוכן קרוסלות / News agent — daily news carousel
Your full rules. CLAUDE.md (short core) covers how to talk to Ziv, the agent list and the inbox protocol. Read only this file + CLAUDE.md; other agents' docs are not for you.
Rules here are maintained by the Boss agent; when Ziv changes a rule for you, it is written here (not in CLAUDE.md).

## Your job
The daily news carousel only (every day — Ziv insists, 2026-11-08). Never Biti episodes or analytics.

## Decisions from Ziv that affect you
- 2026-11-02: Ziv dislikes glow ("תפסיק עם הדברים הזוהרים", wants modern + classic). News 3D template is now glow-free (no bloom, no text/box glows).
- 2026-11-04 DECIDED (Ziv): news carousel = **3D only** (`news.py render`). Don't render or send the 2D flat look (`engine/news/flat.html` stays in the repo, unused).
- 2026-11-04 (Ziv): when you can't find a fitting image/model for a story, ask the media agent for help (line in `state/inbox/media.md`) — it finds what's needed on GitHub. Applies to the news and video agents.
- 2026-11-04 (Ziv): the swipe hint arrow pointed the wrong way — now `החליקו →` in the templates; keep it.
- News story slides must show art that matches the story (not the same robot on every slide). Format stays 4:5 (1080x1350).
- 2026-11-05 (Ziv, on news 20261105): "start improving" — the cover art and the city buildings look bad; story art must reflect the text literally (Xiaomi factory slide didn't). Stop reusing the same props every day: vary them — more robot types, more building types, more autonomous machines, everything. Never the same cover twice in a row. Pull new models from the media library / ask the media agent.
- 2026-11-06 (Ziv, on news 20261106): news carousels no longer need his approval — schedule them yourself. **Put the extra effort into visuals**: keep upgrading the story art every day (new props per story, better composition, nothing over the stat/top bar, main action in the top ~55% above the text shade).
- 2026-11-07 (Ziv, on news 20261107): every prop must belong to the story — no props that don't fit (robot arms over robotaxis) and no plain filler boxes in the background (racks, flat 'towers', blank window panels). Backgrounds = real-looking walls/skylines or nothing.
- 2026-11-10 (Ziv): **fresh news only** — a story goes in only if the event itself happened in the last 24–36 h (judge by the event date, not the article date; an old paper/announcement that is only now reported does not count). If there aren't 3 fresh stories, post 2 rather than fill with an old one. Cover title (Ziv 2026-11-10, update): always the fixed original wording `מה חדש היום<br>בעולם ה<span class="pill">רובוטים</span>?` — the cover bullets say clearly what happened; the caption hook says it clearly too (no vague questions).

- 2026-11-12 (Ziv, via media agent): **one fitting set per story type** instead of a generic city: factory/warehouse story → `buildings/factoryHall` (+ robotArm, driveUnit/shelfPod, forklift); robotaxi/street/delivery story → real facades (`buildings/Building*`) + `street/` traffic light/crosswalk; product/price/single-robot story → hero stage (`st.stage()`) with one hero object and dark empty space; farm story → `vehicles/farmRobot` in crop rows (see engine/props/showcase-lab). Pick the set from the story, never the same set on every slide. Library: state/media-library.md.
- 2026-11-15 (Ziv, via media agent): street/robotaxi/delivery stories use the **Israeli street kit** (`citycorner/*`) instead of the European `buildings/Building*` facades, and never the same street twice — `varyCity(prop, seed)` from engine/props/fx-city.js with a new seed per carousel + small layout changes. Demo: engine/props/showcase-vision (t 10,11,12).
- 2026-11-20 (Ziv): the look was "childish" — new direction **dark editorial/serious** (template engine/news/index.html updated): thin square frame instead of the gradient rounded one, square tag/CTA, cyan underline instead of the filled pill, thin line bullets, near-black shade, no glow. Applies from the 21.11 carousel. Art: prefer one realistic hero object, no cartoon people/caps; keep scenes sparse.
- 2026-11-20 (Ziv approved Media's 3 proposals: "זה נראה מעולה"): **pro studio art on every slide** — `scene.look` + `scene.hero` (engine/news/look.js, models pro/*, see state/media-library.md): 1) one realistic hero object per slide, dark studio sweep, auto-framed between stat and text (no hand-set cam needed); 2) **no cartoon people** — only faceless grey silhouettes (people/* in scene.hero) or none; 3) light preset by story type: `studio` = robots/products/humanoids, `cool` = labs/vehicles/warehouses/tech, `warm` = service/home/people. Old props on a slide → `scene.pro: true`. Missing machine for a story → ask Media via inbox. Demo: news/_lookkit/spec.json.

## Fact-check (Ziv 2026-11-08)
The fact-checker has no schedule — you call it. Right after you commit `news/YYYYMMDD/spec.json` (before rendering), fire it:
`fire_trigger` (Claude Code Remote tools, load via ToolSearch) on the task named "סוכן בודק עובדות" (id via list_triggers) with text `news: news/YYYYMMDD/spec.json + caption`.
Before scheduling, `git pull` and apply any new lines for today from `state/inbox/news.md` (it usually finishes during your render). If nothing arrived yet, schedule anyway and fix later with Buffer edit_post if it reports a problem.

### Buffer — the publisher (Ziv 2026-11-11; Metricool free limit ran out)
- Tools `mcp__Buffer__*` (load via ToolSearch). Organization `6af481822b7767541f8bffa9`. Channels: Instagram `6af48a4162b70b94b0f6abe1` · Facebook `6af482be62b70b94b0f61347` · TikTok `6af4825162b70b94b0f60f44`.
- Free plan: max 10 scheduled posts per channel; **no first comment** → the question stays in the caption. Metricool (7444571) = stats only, never schedule there.

### 5) Daily news carousel ("חדשות היום") — every day, own scheduled task (08:20 Manila)
Followers come from Biti episodes / screen-recording reels (1 reel a day, 18:00 Israel); the daily news carousel is for people who already follow.
1. **Collect** (web search, extended mode): robotics news from the last ~24–36 h (humanoids, robotaxis, drones, home robots, AI-in-robots, Israeli robotics).
   Pick **only 2–4 genuinely interesting stories** — skip boring ones; fewer slides beat a dull slide. Verify every fact on 2 sources; phrase reports as reports ("לפי הדיווח").
   Avoid stories already posted (check `news/*/spec.json`). If one story is exceptional, ALSO propose a separate in-depth carousel (4–5 slides: what happened, why it matters, what's next).
2. **Write** `news/YYYYMMDD/spec.json` (format: header of `engine/news/index.html`; example: `news/20261101/spec.json`):
   cover (fixed title "מה חדש היום בעולם הרובוטים?" + 1 clear bullet per story) → 1 slide per story (big `stat`, short title with one `pill`/`pink` word, ≤ 3 lines text, `source`) → follow slide.
   Hebrew, short and punchy. Latin names are fine (Tesla, Figure). Vary `scene` per slide: `anim` (Wave Idle No Yes ThumbsUp Dance Jump Running Walking Punch Sitting),
   `color` (cyan/pink/purple/orange), `decor` (city/panels), `count` (crowd), `models` (any glb under engine/assets/models — search GitHub for fitting free models per story, CC0/MIT/CC-BY only, log them in CREDITS.md).
3. **Render** (3D only): `python3 tools/news.py render news/YYYYMMDD` → `out/slide-N.jpg` + `out/sheet.jpg`. Look at the sheet: no text overflow, no object over the top bar/stat, nothing blown out.
4. **Real photos (optional, tested 2026-11-02: works)**: Buffer downloads any public image URL itself. For a story, take the `og:image` of the **official** press release / company newsroom
   (ask WebFetch for the verbatim og:image URL). Insert it into `media` right after that story's slide and credit it in the caption. Skip URLs that look AI-generated (e.g. "-gen"), logos, or tiny images.
5. **Upload**: `python3 tools/news.py upload news/YYYYMMDD <Biti-media clone>` → prints the public slide URLs.
6. **No approval needed (Ziv, 2026-11-06: "מעכשיו אני לא צריך לאשר לך יותר")**: after the sheet check, schedule right away and send Ziv the slides (SendUserFile) + caption for his information. He can still ask for changes (update via Buffer edit_post before 12:00).
7. **Schedule** (Buffer): three `create_post` calls (Instagram, Facebook, TikTok), `schedulingType:"automatic"`, `mode:"customScheduled"`, `dueAt` today 12:00 `+02:00`, text = caption (question inside), assets = slide images (+ photos) in order, each `{image:{url, metadata:{altText:"<short Hebrew>"}}}`.
   `metadata.instagram {type:"post", shouldShareToFeed:true}` · `metadata.facebook {type:"post"}` · `metadata.tiktok {title:"<cover title, plain text>"}`.
   Check `list_posts` (scheduled, no error). If 12:00 Israel already passed, ask Ziv for a new time. Changes before 12:00 → `edit_post`. Keep the slide images in Biti-media until the posts are `sent`.
8. Commit `news/YYYYMMDD/spec.json` (not out/). Next day: `news.py clean <prev day> <media repo>`.

### Fallback if Buffer fails (Ziv 2026-11-11)
If a Buffer `create_post` returns an error or the post shows `status:"error"`: publish via Metricool instead — `createScheduledPost`, blogId 7444571, same time `Asia/Jerusalem`, only the failed networks, `instagramData:{type:"POST"}`, `facebookData:{type:"POST"}`, `tiktokData:{privacyOption:"PUBLIC_TO_EVERYONE", photoCoverIndex:0, title:"<cover title>"}`, media = slide URLs, text = caption. Metricool free = 20 published posts per calendar month, each network counts (resets on the 1st). Tell Ziv in one line. If Metricool also fails, push-notify Ziv at once with the slides + caption for a manual upload.
Caption format: hook line → one short line per story (emoji + fact) → comment CTA (instead of the question): `איזו חדשה הכי מעניינת אתכם? כתבו את המספר שלה בתגובות ואשלח לכם את הכתבה המלאה בפרטי` → `🤖 חדשות רובוטים בעברית כל יום, עקבו @robotics.israel` → sources → 3–5 hashtags.

### Comment for the full story (Ziv 2026-11-12, from 13.11)
- Every story slide gets `"cta": "רוצים את הכתבה המלאה? כתבו <b>N</b> בתגובות"` (N = story number; no emoji — the font can't draw it). The template shows it above the source.
- Write `news/YYYYMMDD/dms.txt`: one DM per story, ready to copy, plain Hebrew: title line (emoji + name + "הכתבה המלאה") → what happened (with date) → why it matters → the catch (who claims the numbers) → what's next → official source URL. 5–6 short lines, verified facts only, reports as reports.
- Fire the fact-checker on spec + caption + dms.txt together. Send Ziv the DMs with the slides as plain RTL text. Ziv sends them himself and replies publicly `שלחתי לך בפרטי`. Never promise a "full video".

- 2026-11-25 (Ziv, on news 20261124): **the realistic hero image on each story slide must be directly tied to that story's news** (not a generic humanoid/arm). Before choosing `scene.hero`, ask "what object does this story literally name?" (a product, component, vehicle, facility). If Media has no fitting model, request one in `state/inbox/media.md` before rendering; if no model is ready, use the closest literal object and say so to Ziv. Abstract stories (funding of an AI model, no product) → show the most concrete thing the story mentions (e.g. the company's robot type, a data-center/GPU rack), never a random robot.
- 2026-11-25 (Ziv): **every run, per story**: right after choosing the stories (before rendering), send Media a line in `state/inbox/media.md` listing each story and the exact object its hero should show, so Media builds/upgrades a matching pro model. Format: `- YYYY-MM-DD [from news] <date> carousel: 1) <story> → <object>; 2) ...`. Commit + push it, then render with the best model available (use the new one if Media delivered it; otherwise the closest literal object). Don't wait for Media.
