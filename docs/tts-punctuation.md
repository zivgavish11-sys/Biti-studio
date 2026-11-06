# TTS punctuation guide (TTSMaker, Hebrew female voice)
Ziv 2026-11-06: "invest more in punctuation, become a pro at it". Read this before writing every script. Applies from ep008 on.

## 1. What each mark does in OUR voice (measured, not guessed)
Measured from the word timings of ep002–ep007 (Ziv's TTSMaker recordings, 134 marks). Pause = silence after the mark in the
raw recording; the final video is 1.25× faster, so divide by 1.25.

| Mark | Pause raw | In the video | Intonation | Use for |
|---|---|---|---|---|
| none | 0 s (0 of 396 words) | 0 s | flows on | words that belong together |
| `,` | ~0.38 s | ~0.3 s | stays up, "more is coming" | a breath between thought units |
| `.` | ~0.6 s | ~0.5 s | falls, closes | end of a fact |
| `:` | ~0.7 s | ~0.55 s | sets up | right before a reveal (`אבל הנה החלק המטורף:`) |
| `!` | ~1.0 s | ~0.8 s | strong, energetic | the hook fact / the wow fact only |
| `?` | ~1.06 s | ~0.85 s | rises | the hook question, rhetorical questions |
| `...` | ~1.07 s | ~0.85 s | trails off, suspense | one suspense beat before a reveal |

Key finding: **no mark = no pause at all**. The voice never breathes on its own, so every pause must be written.
`?`, `!` and `...` are "expensive" (almost a second each); `,` is cheap.

## 2. Rules
1. **Hook (first 2 s)**: short fact, **no comma inside**, ends with `.` or `!`. Then the curiosity question on its own line ending with `?`
   (`רַחְפָן לֹא יוֹדֵעַ לְרַחֵף לְבַד.` / `אָז אֵיךְ הוּא לֹא נוֹפֵל?`). The `?` pause is the suspense — keep it.
2. **Comma every 3–6 words**, at the natural breath point. Never a comma every 1–2 words (sounds choppy/robotic), never 8+ words without a mark (rushed, flat).
3. **Sentences ≤ 10 words.** Split long ones with `.` rather than chaining commas.
4. **Budget the expensive marks** in a 30–45 s episode: `?` ×2–3 (hook question + 1–2 rhetorical), `!` ×2 (hook/wow), `...` ×1, `:` ×1 (re-hook). More than that = too much dead air and a "manic" read.
   Never doubled (`!!`, `?!`, `....`).
5. **Rhetorical question = free suspense** inside the body: `רוּחַ דּוֹחֶפֶת אוֹתוֹ?` then the answer. Use one per episode in the middle third (helps hold the middle).
6. **Reveal pattern**: `:` or `...` right before the biggest fact, then the fact ending with `!`. Use one of them, not both in a row.
7. **Lists**: comma between items, `.` after the last (`קְצָת כְּמוֹ מֶלְצַר, עִם מַגָּשׁ מָלֵא, בַּחֲתֻנָּה.`).
8. **Key word last**: put the word you want stressed at the end of its clause, right before the mark — the voice lands on it.
9. **Forbidden in TTS text**: digits, `%`, `/`, `-`, `—`, parentheses, quote marks, abbreviations, Latin letters unless meant to be spelled.
   Write numbers as words with niqqud (`מֵאוֹת`, `אַרְבָּעָה`). Captions can still show digits via `{tts|caption}`.
10. **Niqqud**: full niqqud on every word (TTSMaker reads ambiguous unvowelled words wrong). Check shva/dagesh on verbs (`אֲלַמֵּד`, `מְתַקֵּן`).
11. **Closing line**: `תַּעַקְבוּ אַחֲרַי, לְעוֹד תּוֹכֶן וַחֲדָשׁוֹת עַל רוֹבּוֹטִים.` (one comma, period).

## 3. Checklist before sending the TTS text to Ziv
- [ ] Hook: no comma, ends `.`/`!`; question line ends `?`.
- [ ] No run of 8+ words without a mark; no 1–2-word comma chains.
- [ ] Count: `?` ≤3, `!` ≤2, `...` ≤1, `:` ≤1.
- [ ] Estimated silence: commas×0.3 + periods×0.5 + (`?`,`!`,`...`)×0.85 + `:`×0.55 ≈ 4–7 s of a 30–45 s video.
- [ ] No digits/symbols/abbreviations; full niqqud.

## 4. After every recording (keep learning)
After `align.py`, re-measure: `python3 tools/punct_stats.py` (pause per mark over all episodes). If a mark behaves differently, update the table above.
Compare retention (analytics) of episodes that used `...` vs `:` before the reveal, and with/without a mid-body rhetorical question.

## 5. Deeper research (2026-11-06, round 2)
- **TTSMaker has two exact-pause tools** (ttsmaker.com/blog/ttsmaker-user-guide; API field `text_paragraph_pause_time`, default 0):
  (a) "Pause Time" under More Settings = silence after every new line; (b) an "insert pause" button that puts a pause marker into the text.
  Asked Ziv (2026-11-06) for the marker syntax + his current paragraph-pause setting. Until known: write the whole script with **no stray line breaks inside a sentence**
  (a new line may add silence). Once the marker is known, use it for exact beats instead of spending a `?`/`...`.
- Engine is undocumented; our measured pauses fit Azure's break ladder (250/500/750/1000 ms), so it is probably Azure he-IL (Hila). Azure also pauses on `;` (between `,` and `.`) — **test `;` in a coming script**; untested: maqaf `־`, ` – `, geresh/gershayim → don't use until measured.
- **Hebrew intonation** (degruyter opli-2024-0028; Mixdorff & Amir 2002): yes/no questions are marked ONLY by a rising end (word order doesn't change) → a yes/no line without `?` sounds like a statement. Unfinished phrases rise on their last stressed word (= `,`), statements fall (= `.`).
  Focus: the focused word gets the strongest accent and stresses after it drop → **put the key word last, then `.` to make it land** (or `,` to keep it rising/suspenseful).
- **Wh-questions (איך/למה/מה)** naturally fall in Hebrew, but TTS raises the pitch on any `?`. Keep `?` on the hook question (the rise = curiosity); if a mid-body wh-question sounds sing-song, swap the `?` for `.` or `...`.
- **Stress**: niqqud fixes vowels, not stress. If a word gets wrong stress, rephrase or move it — niqqud won't fix it. Dagesh matters for ב/כ/פ.
- **Pace**: our 70–95 words in 30–45 s ≈ 2.1–2.3 words/s after 1.25× — inside short-form ranges; Hebrew words are long, don't push more words. Energy arc: calm-curious hook, faster middle (shorter clauses, fewer commas), slower payoff (more commas).

Sources (general TTS practice, matched by our measurements): docs.sestek.com/docs/tts-best-practices (pause per mark, avoid over-punctuation, spell out numbers/symbols),
docs.smallest.ai/models/text-to-speech/best-practices (max one `!`, no repeated punctuation, short chunks),
freetexttospeech.net/blog/control-pauses-pacing-text-to-speech (comma < period < dash/ellipsis < paragraph; fix rhythm with punctuation before speed).
