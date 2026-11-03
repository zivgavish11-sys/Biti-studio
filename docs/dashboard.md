# Control board (לוח הבקרה של הסוכנים)

Ziv's live board of all agents: https://claude.ai/artifact/Eu6orTZrZGEstqmcRGL6Cp
Owned by the Boss agent (tree layout, new/retired agents). Every agent that has the "control board" step in its prompt reports here.
Write with the `ArtifactData` tool (load via ToolSearch `select:ArtifactData`), `url` = the board URL above. All text in **Hebrew**, short.

## 1. Your status — collection `agents`, doc id = your agent id
Agent ids: boss · video · news · factcheck · media · analytics · growth · milestone · community · collab
First `get` your doc (to get its `version`), then `update` with `if_version` (or `set` without it if the doc does not exist):
- `status`: active | waiting (something waits for Ziv) | dormant | error
- `statusText` (optional): short custom pill text, e.g. "2 פרקים מחכים"
- `lastRun`: now, ISO UTC (e.g. 2026-11-04T07:41:00Z)
- `summary`: one line, what this run did
- `waiting`: what Ziv needs to do, one line — or "" when nothing (this fills the "מחכה לך" box at the top)

## 2. The team chat — collection `feed`, one new doc per message
doc id: `<YYYYMMDD>-<agent>-<HHMMSS>` (e.g. `20261104-factcheck-074100`). Use `set` (new doc, no if_version). Use `batch` for several.
- `ts`: ISO UTC
- `from`: your agent id
- `to`: target agent id, or `all`, or `ziv`
- `kind`: rec (recommendation to another agent) | reply (answer to one) | run (run summary) | decision (rule change Ziv approved)
- `state`: open | done | ziv (waiting for Ziv's answer). Omit for `run`.
- `text`: the message in Hebrew, 1–2 short sentences (the claim, what's wrong, the safe wording). No links needed.

Post: every line you write to another agent's inbox (kind rec), one run summary per run (kind run).
When you handle a recommendation from your inbox, post a `reply` with state done (and, if you find its feed doc, `update` its state to done).

## 3. If it fails
Write `- YYYY-MM-DD [from <agent>] dashboard write failed: <reason>` to `state/inbox/boss.md`, commit and push. Don't push-notify Ziv for this.
