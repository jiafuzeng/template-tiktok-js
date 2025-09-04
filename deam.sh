#!/bin/bash
INPUT="videos/output_final.mp4"
BASENAME="$(basename "$INPUT")"
mkdir -p public/videos 
cp "$INPUT" "public/videos/$BASENAME"
node sub-whisperx.mjs "public/videos/$BASENAME"
npx remotion render src/index.ts CaptionedVideo "out_${BASENAME%.*}_sub.mp4" --props="{\"src\":\"/videos/$BASENAME\"}"