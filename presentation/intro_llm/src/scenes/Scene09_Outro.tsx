import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  spring,
  useVideoConfig,
} from "remotion";
import { GradientBackground } from "../components/GradientBackground";
import { AnimatedTitle } from "../components/AnimatedTitle";
import { THEME, FONT } from "../style";

export const Scene09_Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const fadeOutOpacity = interpolate(frame, [500, 570], [1, 0], {
    extrapolateLeft: "clamp",
  });

  const concepts = [
    { icon: "🏗️", label: "Transformer" },
    { icon: "🏋️", label: "訓練三階段" },
    { icon: "🧩", label: "Token" },
    { icon: "📐", label: "Embedding" },
    { icon: "📄", label: "Context Window" },
    { icon: "💬", label: "Prompt Engineering" },
  ];

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
          <AnimatedTitle
            title="謝謝收看"
            subtitle="大語言模型入門"
            delay={5}
          />

          <div
            style={{
              marginTop: 50,
              display: "flex",
              gap: 16,
              flexWrap: "wrap",
              justifyContent: "center",
              maxWidth: 800,
            }}
          >
            {concepts.map((concept, i) => {
              const progress = spring({
                frame: Math.max(0, frame - 30 + i * 6),
                fps,
                config: { damping: 14 },
              });
              const opacity = interpolate(progress, [0, 1], [0, 1]);
              const scale = interpolate(progress, [0, 1], [0.8, 1]);

              return (
                <div
                  key={concept.label}
                  style={{
                    padding: "10px 20px",
                    background: THEME.surface,
                    border: `1px solid ${THEME.border}`,
                    borderRadius: 20,
                    opacity,
                    transform: `scale(${scale})`,
                    fontSize: 15,
                    color: THEME.textDim,
                  }}
                >
                  {concept.icon} {concept.label}
                </div>
              );
            })}
          </div>

          <div
            style={{
              marginTop: 40,
              fontSize: 14,
              color: THEME.muted,
              opacity: interpolate(frame, [80, 120], [0, 0.6], {
                extrapolateLeft: "clamp",
              }),
            }}
          >
            理解 AI，是參與未來的第一步
          </div>
        </AbsoluteFill>
      </GradientBackground>
    </AbsoluteFill>
  );
};
