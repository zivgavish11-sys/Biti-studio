# Handoff → next Boss chat (written 2026-11-08 by the previous Boss session)

You are "הסוכן הבוס" of Robotics Israel (@robotics.israel), Ziv's anonymous Hebrew robotics page (IG + TikTok).
Read first: CLAUDE.md (short core) → docs/agents/boss.md (your rules) → this file → state/goals.md → state/decisions.md (last ~15 lines).
Talk to Ziv in Hebrew only, short, one step at a time, plain RTL text. He is token-conscious: no long reports, no unnecessary images.

## Update 2026-11-11 (Ziv approved)
- Metricool free = 20 published posts/month (per network, resets on the 1st) → ran out 11.11. Publisher is now **Buffer free** (IG+FB+TikTok, no monthly cap, ≤10 queued per channel, ~3,000 API requests/month, no first comment). Fallback: Metricool, then push Ziv. YouTube dropped; goal = IG+TikTok+FB.
- Followers 11.11: 30. Open with Ziv: release ep012-pushback on 13.11 (no episode scheduled after ep011)?

## Where things stand (2026-11-08)
- Followers ~26 (IG 7, TikTok 19). Goal: 1,000 by Feb 2027 (lowered from 5,000). Long play: community now, income when consumer robots sell.
- Audience: future buyers of home robots (Israeli adults/families). Red line: zero factual errors. Ziv ≤1 h/week. Anonymous to the public.
- TikTok gets ~2.5–3× IG reach. Open idea (not yet approved): A/B test manual IG upload vs Metricool + IG Trial Reels.
- Content: one Biti episode/day 18:00; short format test ep007–010; HERO look from ep011 (12.11; ep011 = hero + deep science, hero test gets 5 videos); deep-science every 3rd episode. Series "המעבדה של העוקבים" (docs/series/lab.md).
- Voice: Ziv wants a more real voice. Recommended ElevenLabs (Hebrew, paste text on the site, no API). Not decided; it would be tested after the running format/look tests (one change at a time).
- Groq: blocked by the cloud network; recommended to drop. Ziv hasn't confirmed.

## What changed on 2026-11-08 (token saving, approved by Ziv)
1. CLAUDE.md cut from ~30 KB to a ~3.7 KB core. Every agent's rules now live only in docs/agents/<agent>.md; task prompts read CLAUDE.md + their own doc. Frozen full copy: docs/archive/CLAUDE-full-2026-11-08.md. Your job: keep it lean, no duplicates; new agent → build its doc from the relevant rules.
2. Cadence: carousels stay daily (Ziv insists). Fact-checker has no schedule — the reels/carousel agents fire it (fire_trigger on "סוכן בודק עובדות") after committing script/spec. Milestone watcher: days 1, 11, 21. Media: every 4 days (unchanged). Growth agent paused, role merged into you (don't delete it).
3. Reels preview = 2 frames.
4. Models (approved and applied 2026-11-08): Opus — boss, reels, carousels, media, fact-checker; Sonnet — analytics, community, collab, growth; Haiku — milestone watcher.

## Agents & task ids (list_triggers to confirm)
Boss trig_01KSN8WCEQckFMMNHprgndFG (weekly Sun) · Reels trig_012GFv3Sz2Uf43rmutqaZ1St (daily) · Carousels trig_0121rb7YsYdBU9dxrr8f7bXK (daily) · Analytics trig_01KJwXeJmPHL3zmWD5EHUq9U (every 4 days) · Media trig_01Szgi1iUnbsqFTPtpYW3Dbk (every 4 days) · Fact-checker trig_017YQqgPdq1RdQ6ygiCZMeSu (on demand) · Milestone trig_01F9KjHbmpoT84Q5Z214JSUW (1/11/21) · Community trig_018KJjS4Bpfr86YedbjLWuCe (paused) · Collab trig_01VU7a37pPgDSRKp7DgDHkVD (dormant) · Growth trig_01UdG75BRXqPe8c4HDRNBmVw (paused) · Efficiency trig_01VFsHimXYww1iwhkPGJZbs4 (off).

## Tools & gotchas
- Control board artifact https://claude.ai/artifact/Eu6orTZrZGEstqmcRGL6Cp (source docs/dashboard.html; db via ArtifactData; only factcheck reports so far). Update the tree when agents change.
- Can't delete GitHub branches from the session (push --delete fails) → ask Ziv with the branches link.
- Disabling a trigger was once blocked by the auto-mode classifier; it worked when Ziv asked explicitly.
- Never commit secrets; repo is public.
