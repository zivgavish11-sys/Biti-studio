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

## Fact-check (Ziv 2026-11-08)
The fact-checker has no schedule — you call it. Right after you commit `news/YYYYMMDD/spec.json` (before rendering), fire it:
`fire_trigger` (Claude Code Remote tools, load via ToolSearch) on the task named "סוכן בודק עובדות" (id via list_triggers) with text `news: news/YYYYMMDD/spec.json + caption`.
Before scheduling, `git pull` and apply any new lines for today from `state/inbox/news.md` (it usually finishes during your render). If nothing arrived yet, schedule anyway and fix later with updateScheduledPost if it reports a problem.

### Metricool
- Brand/blogId **7444571**. Tools: `mcp__Metricool_Social_Media_Management__*` (load via ToolSearch).

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
4. **Real photos (optional, tested 2026-11-02: works)**: Metricool downloads any public image URL itself. For a story, take the `og:image` of the **official** press release / company newsroom
   (ask WebFetch for the verbatim og:image URL). Insert it into `media` right after that story's slide and credit it in the caption. Skip URLs that look AI-generated (e.g. "-gen"), logos, or tiny images.
5. **Upload**: `python3 tools/news.py upload news/YYYYMMDD <Biti-media clone>` → prints the public slide URLs.
6. **No approval needed (Ziv, 2026-11-06: "מעכשיו אני לא צריך לאשר לך יותר")**: after the sheet check, schedule right away and send Ziv the slides (SendUserFile) + caption + plannerUrl for his information. He can still ask for changes (update via updateScheduledPost before 12:00).
7. **Schedule**: one `createScheduledPost`, blogId 7444571, date today 12:00 `Asia/Jerusalem`, providers instagram + tiktok, media = slide URLs (+ photos),
   `instagramData:{type:"POST"}`, `tiktokData:{privacyOption:"PUBLIC_TO_EVERYONE", photoCoverIndex:0, title:"<cover title, plain text>"}`, text = caption, `firstCommentText` = the question.
   If 12:00 Israel already passed, ask Ziv for a new time. Send him the plannerUrl.
8. Commit `news/YYYYMMDD/spec.json` (not out/). Next day: `news.py clean <prev day> <media repo>`.
Caption format: hook line → one short line per story (emoji + fact) → question → `🤖 חדשות רובוטים בעברית כל יום, עקבו @robotics.israel` → sources → 3–5 hashtags.
