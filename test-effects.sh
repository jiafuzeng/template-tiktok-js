#!/bin/bash

set -euo pipefail

INPUT="videos/output_final.mp4"
BASENAME="$(basename "$INPUT")"

# 确保输入视频在 public 下
mkdir -p public/videos
cp -f "$INPUT" "public/videos/$BASENAME"

# 全量特效列表（与 StyleRegistry 对齐）
EFFECTS=(
  AudioWave BouncyBall CartoonBubble CosmicGalaxy CyberpunkHacker DiamondCrystal
  ElasticZoom ElectricLightning ElegantShadow Embossed3D FireFlame FluidGradient
  Glassmorphism Glitch GradientRainbow Hologram LiquidMetal MagicSpell Metallic
  Minimal NeonBorder NeonGlow PixelArt QuantumTeleport RainbowAurora RetroWave
  ShakeImpact SmokeMist SpaceTimeWarp SpinSpiral StarryParticle SwayBeat
  TechWireframe WaterRipple
)

# 逐个渲染
for eff in "${EFFECTS[@]}"; do
  echo "==> Rendering effect: $eff"
  npx remotion render src/index.ts CaptionedVideo "out_${BASENAME%.*}_${eff}.mp4" \
    --props='{"src":"/videos/'"$BASENAME"'","styleName":"'"$eff"'"}'
done

echo "All effects rendered."


