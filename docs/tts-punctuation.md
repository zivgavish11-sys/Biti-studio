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

Sources (general TTS practice, matched by our measurements): docs.sestek.com/docs/tts-best-practices (pause per mark, avoid over-punctuation, spell out numbers/symbols),
docs.smallest.ai/models/text-to-speech/best-practices (max one `!`, no repeated punctuation, short chunks),
freetexttospeech.net/blog/control-pauses-pacing-text-to-speech (comma < period < dash/ellipsis < paragraph; fix rhythm with punctuation before speed).
