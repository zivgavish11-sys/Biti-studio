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
