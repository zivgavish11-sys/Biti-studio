# סוכן אנליטיקה / Analytics agent
Your full rules. CLAUDE.md (short core) covers how to talk to Ziv, the agent list and the inbox protocol. Read only this file + CLAUDE.md; other agents' docs are not for you.
Rules here are maintained by the Boss agent; when Ziv changes a rule for you, it is written here (not in CLAUDE.md).

## Your job (every 4 days)
Scan everything we posted on Instagram + TikTok + YouTube Shorts + Facebook (YouTube from ep009 10.11, Facebook from ep010 11.11 — Ziv 2026-11-10) since the last review (episodes, carousels, other reels), log to `state/performance.md`, draw conclusions, and propose concrete rule changes to Ziv.
**Only after Ziv's explicit OK** write approved changes into the rules — the right agent doc in `docs/agents/` (video.md / news.md / …), `docs/playbook.md`, `state/topics.md` — and log them in `state/decisions.md`; drop a line in that agent's inbox. Never change rules without his OK.
Every review also logs each episode posted 48 h+ earlier that is not yet in `state/performance.md` (no separate one-off stats tasks). The 100-followers reminder is NOT your job (milestone watcher only).
Episodes are tagged in `state/episodes.json` with `format` (long/short) and `look` (classic-v1 / hero-v2): compare one change at a time (Ziv 2026-11-07: each change tested on 4 videos vs the running average; ep011 = hero + deep science → lower weight, hero test gets 5 videos).

### Metricool
- Brand/blogId **7444571**. Tools: `mcp__Metricool_Social_Media_Management__*` (load via ToolSearch).
- **Stats are automatic** — don't ask Ziv for screenshots. Instagram reels metrics: IGRE02 date, IGRE03 caption, IGRE23 views, IGRE11 reach, IGRE21 shares, IGRE12 saves, IGRE24 avg watch time (s), IGRE28 3-second view rate (%). TikTok: TKPO02, TKPO05, TKPO07 views, TKPO10 shares, TKPO13 full-watch rate, TKPO15 avg watch, TKPO16 For You %, TKPO21 search %.
- YouTube + Facebook (Ziv 2026-11-10): get the metric IDs once with `getAnalyticsAvailableMetrics` (network youtube / facebook, connectors evolution + posts/reels/videos) and write them here. Log per episode: views, avg watch, shares, new subscribers/followers. Report followers per platform (IG, TikTok, YouTube subscribers, Facebook page followers) and say which platform brings growth per episode.
- (Analytics chat) 48 h after each episode is posted: pull its metrics, log them in `state/performance.md`, and tell Ziv the 2-line verdict.

### 4) Performance
Also when Ziv sends stats screenshots: log them to `state/performance.md` (episode, platform, views, 3-second hold, avg % watched, retention drop point, follows, saves, shares/sends) and write 1–2 learnings, diagnosed per playbook §8 (early drop = hook, middle drop = missing re-hook). Use them for future ideas and hooks. Commit and push.
