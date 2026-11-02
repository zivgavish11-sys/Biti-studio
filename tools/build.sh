#!/usr/bin/env bash
# Full episode build: audio mix + parallel video render + final exports.
# Usage: tools/build.sh episodes/epNNN-slug [SEED]
#   needs EPDIR/index.html, timeline.json, voice.mp3   (run tools/align.py first)
# Outputs: EPDIR/out/<slug>_full.mp4 (publish) and <slug>_light.mp4 (phone preview)
set -euo pipefail
EP=${1%/}; SEED=${2:-$RANDOM}
ROOT=$(cd "$(dirname "$0")/.." && pwd); cd "$ROOT"
SLUG=$(basename "$EP")${STYLE:+-$STYLE}; OUT="$EP/out${STYLE:+-$STYLE}"; mkdir -p "$OUT"   # STYLE=classic -> out-classic/<slug>-classic_*.mp4
END=$(python3 -c "import json;print(json.load(open('$EP/timeline.json'))['end'])")
HALF=$(python3 -c "print(round(int($END*30/2)/30,4))")

echo "== sfx cues + audio"
python3 tools/render.py sfx "$EP" --port 8770
python3 tools/music.py "$EP/music.wav" "$(python3 -c "print($END+0.5)")" --seed "$SEED"
python3 tools/sfx.py "$EP" "$(python3 -c "print($END+0.5)")"
ffmpeg -v error -y -i "$EP/voice.mp3" -i "$EP/music.wav" -i "$EP/sfx.wav" -filter_complex \
 "[0:a]aresample=44100,pan=stereo|c0=c0|c1=c0,asplit=2[v][sc];[1:a]volume=0.25[m];[m][sc]sidechaincompress=threshold=0.03:ratio=5:attack=40:release=600[md];[2:a]volume=0.55[fx];[v]apad=whole_dur=$END[vp];[vp][md][fx]amix=inputs=3:duration=longest:normalize=0,atrim=0:$END,alimiter=limit=0.95,loudnorm=I=-15:TP=-1.5:LRA=11" \
 -ar 44100 -c:a aac -b:a 192k "$OUT/mix.m4a"

echo "== video render (2 parallel halves)"
python3 tools/render.py video "$EP" "$OUT/a.mp4" --from 0 --to "$HALF" --port 8771 > "$OUT/a.log" 2>&1 & PA=$!
python3 tools/render.py video "$EP" "$OUT/b.mp4" --from "$HALF" --port 8772 > "$OUT/b.log" 2>&1 & PB=$!
wait $PA; wait $PB
tail -qn1 "$OUT/a.log" "$OUT/b.log"
test -f "$OUT/a.mp4" && test -f "$OUT/b.mp4"

echo "== final exports"
printf "file a.mp4\nfile b.mp4\n" > "$OUT/list.txt"
ffmpeg -v error -y -f concat -safe 0 -i "$OUT/list.txt" -i "$OUT/mix.m4a" -map 0:v -map 1:a \
 -c:v libx264 -preset slow -b:v 2800k -maxrate 3500k -bufsize 7000k -profile:v high -level 4.1 -pix_fmt yuv420p -r 30 \
 -c:a aac -b:a 160k -shortest -movflags +faststart "$OUT/${SLUG}_full.tmp.mp4" && mv "$OUT/${SLUG}_full.tmp.mp4" "$OUT/${SLUG}_full.mp4"
ffmpeg -v error -y -i "$OUT/${SLUG}_full.mp4" -vf scale=720:1280 -c:v libx264 -preset slow -b:v 1300k -maxrate 1800k -bufsize 3600k \
 -profile:v main -level 3.1 -pix_fmt yuv420p -c:a aac -b:a 128k -movflags +faststart "$OUT/${SLUG}_light.tmp.mp4" && mv "$OUT/${SLUG}_light.tmp.mp4" "$OUT/${SLUG}_light.mp4"
ls -la "$OUT"/*_full.mp4 "$OUT"/*_light.mp4

echo "== QA"
if python3 tools/qa.py "$OUT/${SLUG}_full.mp4" --light "$OUT/${SLUG}_light.mp4" --sheet "$OUT/${SLUG}_qa.jpg"; then
  echo "QA PASS"
else
  echo "QA FAILED — fix the scene and rebuild before sending (see $OUT/${SLUG}_qa.jpg)"; exit 2
fi
