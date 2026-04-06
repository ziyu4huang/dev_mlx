import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { GradientBackground } from "../components/GradientBackground";
import { AnimatedTitle } from "../components/AnimatedTitle";
import { FlowDiagram } from "../components/FlowDiagram";
import { THEME, FONT } from "../style";

export const Scene04_Pipeline: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const steps = [
    { label: "Plain Text", icon: "📄", detail: ".txt file" },
    { label: "Parse", icon: "🔍", detail: "Character detect" },
    { label: "Voice Assign", icon: "🎭", detail: "Auto mapping" },
    { label: "Story JSON", icon: "📋", detail: ".story.json" },
    { label: "Produce", icon: "🎙️", detail: "MLX TTS" },
    { label: "Audio", icon: "🔊", detail: ".flac / .wav" },
  ];

  // Description text that fades in
  const descOpacity = interpolate(frame, [80, 120], [0, 1], { extrapolateLeft: "clamp" });

  return (
    <AbsoluteFill>
      <GradientBackground glowColor="#4ade80">
        <AbsoluteFill
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "80px 120px",
            fontFamily: FONT,
          }}
        >
          <AnimatedTitle
            title="The Pipeline"
            subtitle="From plain text to multi-voice audiobook"
            delay={5}
          />

          <div style={{ marginTop: 60 }}>
            <FlowDiagram steps={steps} delay={20} />
          </div>

          <div
            style={{
              marginTop: 60,
              display: "flex",
              gap: 40,
              opacity: descOpacity,
            }}
          >
            {[
              { label: "Input", value: "Plain text (.txt)", color: THEME.muted },
              { label: "Process", value: "Character → Voice → Emotion", color: THEME.accent },
              { label: "Output", value: "Multi-voice FLAC audio", color: THEME.success },
            ].map((item, i) => (
              <div key={i} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 14, color: THEME.muted, marginBottom: 4 }}>
                  {item.label}
                </div>
                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 600,
                    color: item.color,
                    padding: "8px 16px",
                    background: THEME.surface,
                    borderRadius: 8,
                    border: `1px solid ${THEME.border}`,
                  }}
                >
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        </AbsoluteFill>
      </GradientBackground>
    </AbsoluteFill>
  );
};
