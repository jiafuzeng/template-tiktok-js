import React from "react";

import { AudioWaveStyle } from "./AudioWaveStyle";
import { BouncyBallStyle } from "./BouncyBallStyle";
import { CartoonBubbleStyle } from "./CartoonBubbleStyle";
import { CosmicGalaxyStyle } from "./CosmicGalaxyStyle";
import { CyberpunkHackerStyle } from "./CyberpunkHackerStyle";
import { DiamondCrystalStyle } from "./DiamondCrystalStyle";
import { ElasticZoomStyle } from "./ElasticZoomStyle";
import { ElectricLightningStyle } from "./ElectricLightningStyle";
import { ElegantShadowStyle } from "./ElegantShadowStyle";
import { Embossed3DStyle } from "./Embossed3DStyle";
import { FireFlameStyle } from "./FireFlameStyle";
import { FluidGradientStyle } from "./FluidGradientStyle";
import { GlassmorphismStyle } from "./GlassmorphismStyle";
import { GlitchStyle } from "./GlitchStyle";
import { GradientRainbowStyle } from "./GradientRainbowStyle";
import { HologramStyle } from "./HologramStyle";
import { LiquidMetalStyle } from "./LiquidMetalStyle";
import { MagicSpellStyle } from "./MagicSpellStyle";
import { MetallicStyle } from "./MetallicStyle";
import { MinimalStyle } from "./MinimalStyle";
import { NeonBorderStyle } from "./NeonBorderStyle";
import { NeonGlowStyle } from "./NeonGlowStyle";
import { PixelArtStyle } from "./PixelArtStyle";
import { QuantumTeleportStyle } from "./QuantumTeleportStyle";
import { RainbowAuroraStyle } from "./RainbowAuroraStyle";
import { RetroWaveStyle } from "./RetroWaveStyle";
import { ShakeImpactStyle } from "./ShakeImpactStyle";
import { SmokeMistStyle } from "./SmokeMistStyle";
import { SpaceTimeWarpStyle } from "./SpaceTimeWarpStyle";
import { SpinSpiralStyle } from "./SpinSpiralStyle";
import { StarryParticleStyle } from "./StarryParticleStyle";
import { SwayBeatStyle } from "./SwayBeatStyle";
import { TechWireframeStyle } from "./TechWireframeStyle";
import { WaterRippleStyle } from "./WaterRippleStyle";

export type StyleComponentType = React.ComponentType<{
  page: any;
  enterProgress: number;
}>;

export const styleRegistry: Record<string, StyleComponentType> = {
  AudioWave: AudioWaveStyle,
  BouncyBall: BouncyBallStyle,
  CartoonBubble: CartoonBubbleStyle,
  CosmicGalaxy: CosmicGalaxyStyle,
  CyberpunkHacker: CyberpunkHackerStyle,
  DiamondCrystal: DiamondCrystalStyle,
  ElasticZoom: ElasticZoomStyle,
  ElectricLightning: ElectricLightningStyle,
  ElegantShadow: ElegantShadowStyle,
  Embossed3D: Embossed3DStyle,
  FireFlame: FireFlameStyle,
  FluidGradient: FluidGradientStyle,
  Glassmorphism: GlassmorphismStyle,
  Glitch: GlitchStyle,
  GradientRainbow: GradientRainbowStyle,
  Hologram: HologramStyle,
  LiquidMetal: LiquidMetalStyle,
  MagicSpell: MagicSpellStyle,
  Metallic: MetallicStyle,
  Minimal: MinimalStyle,
  NeonBorder: NeonBorderStyle,
  NeonGlow: NeonGlowStyle,
  PixelArt: PixelArtStyle,
  QuantumTeleport: QuantumTeleportStyle,
  RainbowAurora: RainbowAuroraStyle,
  RetroWave: RetroWaveStyle,
  ShakeImpact: ShakeImpactStyle,
  SmokeMist: SmokeMistStyle,
  SpaceTimeWarp: SpaceTimeWarpStyle,
  SpinSpiral: SpinSpiralStyle,
  StarryParticle: StarryParticleStyle,
  SwayBeat: SwayBeatStyle,
  TechWireframe: TechWireframeStyle,
  WaterRipple: WaterRippleStyle,
};


