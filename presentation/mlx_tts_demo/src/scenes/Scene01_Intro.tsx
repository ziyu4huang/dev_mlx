import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { GradientBackground } from "../components/GradientBackground";
import { AnimatedTitle } from "../components/AnimatedTitle";
import { THEME, FONT } from "../style";

export const Scene01_Intro: React.FC = () => {
  const frame = useCurrentFrame();

  const glowSize = interpolate(frame % 300, [0, 150, 300], [300, 400, 300]);
  const glowOpacity = interpolate(frame % 200, [0, 100, 200], [0.08, 0.15, 0.08]);

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
          }}
        >
          <div
            style={{
              position: "absolute",
              width: glowSize,
              height: glowSize,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${THEME.accent}${Math.round(glowOpacity * 255).toString(16).padStart(2, "0")} 0%, transparent 70%)`,
              filter: "blur(60px)",
            }}
          />

          <AnimatedTitle
            title="MLX TTS Demo"
            subtitle="煙火人間 — Audiobook Generated with Apple Silicon"
            delay={10}
          />

          <div
            style={{
              marginTop: 40,
              display: "flex",
              gap: 20,
              opacity: interpolate(frame, [30, 60], [0, 1], { extrapolateLeft: "clamp" }),
              transform: `translateY(${interpolate(frame, [30, 60], [20, 0], { extrapolateLeft: "clamp" })}px)`,
            }}
          >
            {["Multi-Voice TTS", "Emotion-Aware", "Chapter 1 & 2"].map((tag) => (
              <div
                key={tag}
                style={{
                  padding: "8px 20px",
                  background: `${THEME.accent}15`,
                  border: `1px solid ${THEME.accent}40`,
                  borderRadius: 20,
                  color: THEME.accent2,
                  fontSize: 16,
                  fontWeight: 600,
                }}
              >
                {tag}
              </div>
            ))}
          </div>

          <div
            style={{
              position: "absolute",
              bottom: 80,
              fontSize: 14,
              color: THEME.muted,
              opacity: interpolate(frame, [80, 120], [0, 0.6], { extrapolateLeft: "clamp" }),
            }}
          >
            Kokoro-82M · zm_yunjian · zm_yunxi · zf_xiaobei
          </div>
        </AbsoluteFill>
      </GradientBackground>
    </AbsoluteFill>
  );
};
