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
          {/* Animated glow orb */}
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
            title="大語言模型入門"
            subtitle="Introduction to Large Language Models"
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
            {["Transformer", "GPT", "AI Agent", "Prompt Engineering"].map(
              (tag) => (
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
              )
            )}
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
            從基礎概念到實際應用，一次搞懂 LLM
          </div>
        </AbsoluteFill>
      </GradientBackground>
    </AbsoluteFill>
  );
};
