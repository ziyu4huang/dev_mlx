import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { GradientBackground } from "../components/GradientBackground";
import { AnimatedTitle } from "../components/AnimatedTitle";
import { CodeBlock } from "../components/CodeBlock";
import { THEME, FONT } from "../style";
import { sampleStoryJson } from "../data/sample-story";

const storyCode = JSON.stringify(
  {
    version: "1.0",
    title: "煙火人間 — 第一章",
    silence_ms: 500,
    output_format: "flac",
    segments: [
      {
        id: "seg_1",
        character: "Narrator",
        text: "清晨五點半，基隆港的霧還沒散盡...",
        voice: "zm_yunjian",
        emotion: "calm",
        speed: 0.95,
      },
      {
        id: "seg_2",
        character: "全叔",
        text: "今天魚一定多！",
        voice: "zm_yunxi",
        emotion: "happy",
        speed: 1.0,
      },
      {
        id: "seg_3",
        character: "阿娥",
        text: "你呀，每次都說大網！",
        voice: "zf_xiaobei",
        emotion: "excited",
        speed: 1.05,
      },
    ],
  },
  null,
  2
);

export const Scene05_StoryJson: React.FC = () => {
  const frame = useCurrentFrame();

  // Annotation callouts that appear at different times
  const annotations = [
    { line: "character", label: "Who speaks", time: 200, color: THEME.accent2 },
    { line: "voice", label: "Which voice", time: 280, color: THEME.success },
    { line: "emotion", label: "Emotion preset", time: 360, color: THEME.warn },
    { line: "speed", label: "Speed factor", time: 440, color: THEME.info },
  ];

  return (
    <AbsoluteFill>
      <GradientBackground glowColor="#fbbf24">
        <AbsoluteFill
          style={{
            display: "flex",
            flexDirection: "column",
            padding: "60px 100px",
            fontFamily: FONT,
          }}
        >
          <AnimatedTitle
            title="story.json — The Heart of It"
            subtitle="Structured format for multi-voice audio production"
            delay={5}
            align="left"
          />

          <div style={{ marginTop: 30, display: "flex", gap: 40 }}>
            <div style={{ flex: 1 }}>
              <CodeBlock
                code={storyCode}
                delay={15}
                speed={3}
                maxWidth={700}
                highlightLines={[7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19]}
              />
            </div>
            <div
              style={{
                width: 280,
                display: "flex",
                flexDirection: "column",
                gap: 16,
                paddingTop: 20,
              }}
            >
              {annotations.map((ann, i) => {
                const opacity = interpolate(
                  frame,
                  [ann.time, ann.time + 20],
                  [0, 1],
                  { extrapolateLeft: "clamp" }
                );
                return (
                  <div
                    key={i}
                    style={{
                      padding: "12px 16px",
                      background: `${ann.color}10`,
                      border: `1px solid ${ann.color}40`,
                      borderLeft: `3px solid ${ann.color}`,
                      borderRadius: 8,
                      opacity,
                    }}
                  >
                    <div style={{ fontSize: 14, fontWeight: 700, color: ann.color }}>
                      {ann.line}
                    </div>
                    <div style={{ fontSize: 13, color: THEME.muted, marginTop: 4 }}>
                      {ann.label}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </AbsoluteFill>
      </GradientBackground>
    </AbsoluteFill>
  );
};
