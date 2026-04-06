import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { GradientBackground } from "../components/GradientBackground";
import { AnimatedTitle } from "../components/AnimatedTitle";
import { VoiceGrid } from "../components/VoiceGrid";
import { EmotionBar } from "../components/EmotionBar";
import { THEME, FONT } from "../style";

export const Scene03_VoiceSystem: React.FC = () => {
  const frame = useCurrentFrame();
  const emotionSectionOpacity = interpolate(frame, [400, 430], [0, 1], {
    extrapolateLeft: "clamp",
  });

  return (
    <AbsoluteFill>
      <GradientBackground glowColor="#a78bfa">
        <AbsoluteFill
          style={{
            display: "flex",
            flexDirection: "column",
            padding: "60px 100px",
            fontFamily: FONT,
            overflow: "hidden",
          }}
        >
          <AnimatedTitle
            title="28 Voices Across 4 Languages"
            subtitle="Prefix naming: a=American, b=British, z=Chinese, j=Japanese · f=female, m=male"
            delay={5}
            align="left"
          />

          <div style={{ marginTop: 30, overflow: "hidden" }}>
            <VoiceGrid delay={15} />
          </div>

          <div
            style={{
              marginTop: 30,
              opacity: emotionSectionOpacity,
              transform: `translateY(${interpolate(frame, [400, 430], [20, 0], { extrapolateLeft: "clamp" })}px)`,
            }}
          >
            <div
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: THEME.accent2,
                marginBottom: 12,
              }}
            >
              8 Emotion Presets
            </div>
            <EmotionBar delay={420} />
          </div>
        </AbsoluteFill>
      </GradientBackground>
    </AbsoluteFill>
  );
};
