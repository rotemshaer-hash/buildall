#!/bin/bash
# Adds an original (no licensing risk) ambient audio bed to a silent Reel.
# Usage: marketing/instagram/add-ambient-bed.sh <in.mp4> <out.mp4>
set -euo pipefail
IN="$1"; OUT="$2"
DUR=$(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "$IN")
TMP=$(mktemp --suffix=.wav)
FADE_OUT_START=$(echo "$DUR - 2" | bc)
ffmpeg -y \
  -f lavfi -i "sine=frequency=110:duration=${DUR}" \
  -f lavfi -i "sine=frequency=164.81:duration=${DUR}" \
  -f lavfi -i "sine=frequency=220:duration=${DUR}" \
  -filter_complex "[0]volume=0.16[a];[1]volume=0.11[b];[2]volume=0.09[c];[a][b][c]amix=inputs=3:duration=longest,lowpass=f=1600,afade=t=in:d=2,afade=t=out:st=${FADE_OUT_START}:d=2[aout]" \
  -map "[aout]" -ac 2 "$TMP"
ffmpeg -y -i "$IN" -i "$TMP" -c:v copy -c:a aac -b:a 160k -shortest "$OUT"
rm -f "$TMP"
echo "wrote $OUT"
