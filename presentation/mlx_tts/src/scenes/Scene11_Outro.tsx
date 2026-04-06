import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { GradientBackground } from "../components/GradientBackground";
import { AnimatedTitle } from "../components/AnimatedTitle";
import { THEME, FONT } from "../style";

export const Scene11_Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const stats = [
    { icon: "🗣️", value: "28", label: "Voices" },
    { icon: "🌍", value: "4+", label: "Languages" },
    { icon: "😊", value: "8", label: "Emotions" },
    { icon: "🍎", value: "M1+", label: "Apple Silicon" },
  ];

  const fadeOutOpacity = interpolate(frame, [250, 300], [1, 0], { extrapolateLeft: "clamp" });

  return (
    <AbsoluteFill>
      <GradientBackground>
        <AbsoluteFill
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: FONT,
            opacity: fadeOutOpacity,
          }}
        >
          <AnimatedTitle title="MLX TTS" subtitle="Text-to-Speech on Apple Silicon" delay={5} />

          <div
            style={{
              marginTop: 50,
              display: "flex",
              gap: 30,
            }}
          >
            {stats.map((stat, i) => {
              const progress = spring({
                frame: Math.max(0, frame - 30 + i * 8),
                fps,
                config: { damping: 14 },
              });
              const opacity = interpolate(progress, [0, 1], [0, 1]);
              const scale = interpolate(progress, [0, 1], [0.8, 1]);

              return (
                <div
                  key={i}
                  style={{
                    width: 160,
                    padding: "24px 16px",
                    background: THEME.surface,
                    border: `1px solid ${THEME.border}`,
                    borderRadius: 16,
                    textAlign: "center",
                    opacity,
                    transform: `scale(${scale})`,
                  }}
                >
                  <div style={{ fontSize: 32, marginBottom: 8 }}>{stat.icon}</div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: THEME.accent2 }}>
                    {stat.value}
                  </div>
                  <div style={{ fontSize: 14, color: THEME.muted, marginTop: 4 }}>
                    {stat.label}
                  </div>
                </div>
              );
            })}
          </div>

          <div
            style={{
              marginTop: 50,
              fontSize: 16,
              color: THEME.muted,
              opacity: interpolate(frame, [80, 120], [0, 1], { extrapolateLeft: "clamp" }),
            }}
          >
            Kokoro-82M · MLX Framework · Multi-Voice Storytelling
          </div>
        </AbsoluteFill>
      </GradientBackground>
    </AbsoluteFill>
  );
};
