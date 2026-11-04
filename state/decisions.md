# Decisions log (rule changes approved by Ziv)
Every change to the brain/rules (CLAUDE.md, docs/playbook.md, state/topics.md) that came out of an analytics review, with date and what changed.

- 2026-11-03: Work split into three chats — video, news carousel, analytics (every 4 days). Chats recommend to each other via state/inbox/*.md. Rule changes only after Ziv's OK.
- 2026-11-03: Three more agents: הסוכן הבוס (weekly), סוכן מקצוען המדיה (every 4 days), סוכן בקרת התפתחות (weekly). All under project 'קהילת הרובוטיקה של ישראל'.
- 2026-11-03: Added fact-checker (daily), efficiency (weekly), community (dormant until 5 comments on a post), collaborations (dormant until 200 followers IG+TikTok), milestone watcher. Every new agent interviews Ziv first. One Biti episode per day for now.
- 2026-11-03 (boss): One owner per check: the 100-followers privacy reminder is the milestone watcher's job only (removed from analytics and growth). One-off ep1/ep2 stats tasks deleted; analytics logs every episode 48 h+ old at each review.
- 2026-11-03 (boss): One open episode at a time: the video agent sends no new ideas while an episode is waiting for Ziv (CLAUDE.md §1 + video task prompt).
- 2026-11-03 (boss): Efficiency agent merged into the Boss agent (boss task prompt updated). Old disabled task 'תדריך תוכן יומי' deleted. Branch media-ep002 to be deleted (session push --delete failed).
- 2026-11-03 (boss): Control board artifact (live tree + 'waiting for Ziv' + team chat of inter-agent recommendations). Pilot with the fact-checker (prompt step 5, docs/dashboard.md); extend to all agents after Ziv's OK.
- 2026-11-03 (boss): state/goals.md filled from Ziv's interview (income long play, 5K followers by Feb 2027, ≤1 h/week, red line = factual errors). Audience chosen by boss at Ziv's request: future consumer-robot buyers. Relevant goals sent to each agent's inbox.
- 2026-11-04 (boss): 3-month target lowered by Ziv from 5,000 to 1,000 followers (Feb 2027).
- 2026-11-04 (boss): Community agent milestone raised by Ziv from 5 to 25 comments on a single post (milestone watcher prompt + milestones.md reopened).
- 2026-11-04 (media): Ziv approved all 3 visual proposals: (1) real furniture models instead of boxes in home scenes, (2) people in scenes, (3) real night sky light (HDRI) as classic default. core.js: `sky` option + `st.prop()` helper; CLAUDE.md Visual rules updated; video + news inboxes told.
- 2026-11-04 (boss): Tasks renamed by Ziv: 'Biti Studio morning ideas' → 'סוכן רילסים', 'Robotics Israel daily news carousel' → 'סוכן קרוסלות'.
- 2026-11-04 (video, Ziv): TTS text = full niqqud + punctuation; greeting 'אֲלַמֵּד' with niqqud (no more 'אלאמד'). Plan: finish 6 Biti episodes (#4 vacuum, #5 surgeon, #6 drone), then analyse all 6; next make the same Biti format but shorter, then analyse + compare to decide how to continue.
- 2026-11-04 (video, Ziv): no sound effects in episodes; only a soft, quiet, pleasant background track (build.sh + music.py changed, CLAUDE.md Visual rules).
- 2026-11-04 (media): Ziv approved proposal 'prop discs' — spinning propellers drawn as a soft see-through disc + thin cyan rim (no glow) instead of frozen blades. Built into drone/quadcopter (disc0..3 on, blades0..3 off); CLAUDE.md Visual rules; video inbox told.
