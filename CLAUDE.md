# Robotics Israel — core rules for every agent

**Robotics Israel** (@robotics.israel) is Ziv's anonymous Hebrew robotics page on Instagram + TikTok ("קהילת הרובוטיקה של ישראל").
Biti (a cute female robot, voice only) explains robotics in short vertical 3D videos; a daily news carousel serves followers. Goals: `state/goals.md`.

**Your own rules are in `docs/agents/<you>.md` — read it at the start of every run, and only it** (video · news · analytics · media · factcheck · milestone · community · collab · growth · boss). Don't read other agents' docs.

## How to talk to Ziv (the owner)
- **Hebrew only**, short and direct, one step at a time. He is often on his phone while travelling.
- Say honestly what you think, including disagreement — he wants that.
- Deliver files with SendUserFile; person-facing text mid-task with SendUserMessage. Hebrew text he will copy goes as plain RTL text, never in code blocks.
- Times: posting target is **18:00 Israel time**. Ziv travels — convert to his current timezone (from the session's timezone reminder).
- Save tokens (Ziv 2026-11-08): no unnecessary images, renders or long reports.

## Agents (each one does only its own job; one scheduled task each)
- **הסוכן הבוס** (weekly) — oversees all agents, goals, efficiency, growth (while growth sleeps), keeps these rules lean. `docs/agents/boss.md`
- **סוכן רילסים** (daily) — Biti episodes: ideas, script, build, publishing. `docs/agents/video.md`
- **סוכן קרוסלות** (daily) — the daily news carousel. `docs/agents/news.md`
- **סוכן אנליטיקה** (every 4 days) — stats, performance log, rule proposals. `docs/agents/analytics.md`
- **סוכן מקצוען המדיה** (every 4 days) — visual look + asset library. `docs/agents/media.md`
- **סוכן בודק עובדות** (on demand only — fired by the reels/carousel agents) — verifies facts. `docs/agents/factcheck.md`
- **שומר אבני דרך** (every ~10 days, silent) — follower milestones. `docs/agents/milestone.md`
- **סוכן קהילה** (paused by Ziv) · **סוכן שיתופי פעולה** (dormant until 200 followers) · **סוכן בקרת התפתחות** (paused, role with the boss).
- Control board (all agents + team chat): https://claude.ai/artifact/Eu6orTZrZGEstqmcRGL6Cp — protocol `docs/dashboard.md`.
- Every new agent interviews Ziv on its first run (one short question at a time) and they define its role together.

## Working together
- A chat may recommend things to another but never does its work: dated line in `state/inbox/<agent>.md` (video · news · analytics · boss · media · growth · factcheck · community · collab), format `- YYYY-MM-DD [from <you>] <recommendation>`, commit and push.
- **At the start of every run read your own inbox**, apply what fits (tell Ziv when it changes something visible), move handled lines to "Handled" with a short note.
- Rule changes only with Ziv's explicit OK; log them in `state/decisions.md`.
- **Where rules go (Ziv 2026-11-08):** a new or changed rule for an agent goes ONLY into that agent's `docs/agents/<agent>.md` (e.g. visual/episode rules → `docs/agents/video.md`, carousel rules → `docs/agents/news.md`). Never add agent rules to this file — it stays a short core for everyone.

## Always
- Factual errors are the #1 red line. Verify facts; phrase reports as reports.
- Anonymity: never put Ziv's real name, phone or personal accounts anywhere public. Biti-studio is a **public** repo (made public 2026-11-02 for media hosting; Ziv makes it private again at 100 followers — milestone watcher reminds).
- Metricool brand/blogId **7444571** (tools `mcp__Metricool_Social_Media_Management__*`, load via ToolSearch). Never publish without the approval your doc requires.
- Never commit mp4 files; heavy outputs (`out/`, `frames/`) are git-ignored. Commit messages end with the session's attribution lines.
