import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { GradientBackground } from "../components/GradientBackground";
import { THEME, FONT } from "../style";

export const Scene08_Outro: React.FC = () => {
  const frame = useCurrentFrame();

  const titleOpacity = interpolate(frame, [20, 60], [0, 1], { extrapolateLeft: "clamp" });
  const titleY = interpolate(frame, [20, 60], [30, 0], { extrapolateLeft: "clamp" });
  const subOpacity = interpolate(frame, [60, 100], [0, 1], { extrapolateLeft: "clamp" });
  const tagOpacity = interpolate(frame, [100, 140], [0, 1], { extrapolateLeft: "clamp" });

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
              fontSize: 64,
              fontWeight: 800,
              color: THEME.text,
              opacity: titleOpacity,
              transform: `translateY(${titleY}px)`,
            }}
          >
            MLX TTS
          </div>

          <div
            style={{
              fontSize: 28,
              color: THEME.muted,
              marginTop: 20,
              opacity: subOpacity,
            }}
          >
            AI-Powered Audiobook on Apple Silicon
          </div>

          <div
            style={{
              marginTop: 40,
              display: "flex",
              gap: 24,
              opacity: tagOpacity,
            }}
          >
            {[
              "Kokoro-82M",
              "28 Voices",
              "Emotion Tags",
              "Multi-Chapter",
              "FLAC Output",
            ].map((tag) => (
              <div
                key={tag}
                style={{
                  padding: "8px 18px",
                  background: `${THEME.accent}15`,
                  border: `1px solid ${THEME.accent}40`,
                  borderRadius: 20,
                  color: THEME.accent2,
                  fontSize: 14,
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
              opacity: interpolate(frame, [140, 180], [0, 0.5], { extrapolateLeft: "clamp" }),
            }}
          >
            github.com/user/mlx_tts
          </div>
        </AbsoluteFill>
      </GradientBackground>
    </AbsoluteFill>
  );
};
