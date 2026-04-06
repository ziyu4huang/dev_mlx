import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { GradientBackground } from "../components/GradientBackground";
import { AnimatedTitle } from "../components/AnimatedTitle";
import { CodeBlock } from "../components/CodeBlock";
import { THEME, FONT } from "../style";
import { sampleBookJson } from "../data/sample-story";

const bookCode = JSON.stringify(sampleBookJson, null, 2);

export const Scene09_GAI: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const steps = [
    { icon: "📝", label: "LLM reads raw text", desc: "Parses dialogue, narration, scene descriptions" },
    { icon: "👤", label: "Character Detection", desc: "Identifies speakers and their gender/role" },
    { icon: "🎭", label: "Voice Assignment", desc: "Maps characters to voice pool (gender-aware)" },
    { icon: "😊", label: "Emotion Heuristics", desc: "Analyzes tone: dialogue style, punctuation, context" },
    { icon: "📋", label: "story.json Output", desc: "Structured multi-segment audio script" },
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
            title="GAI-Powered Storytelling"
            subtitle="How Generative AI enables multi-voice audiobook creation"
            delay={5}
            align="left"
          />

          <div style={{ marginTop: 30, display: "flex", gap: 50 }}>
            {/* Left: Steps */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
              {steps.map((step, i) => {
                const stepDelay = 15 + i * 18;
                const progress = spring({
                  frame: Math.max(0, frame - stepDelay),
                  fps,
                  config: { damping: 16 },
                });
                const opacity = interpolate(progress, [0, 1], [0, 1]);
                const x = interpolate(progress, [0, 1], [-30, 0]);
                const isActive = frame >= stepDelay && frame < stepDelay + 90;

                return (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 16,
                      padding: "12px 16px",
                      background: isActive ? `${THEME.accent}15` : THEME.surface,
                      border: `1px solid ${isActive ? THEME.accent : THEME.border}`,
                      borderRadius: 12,
                      opacity,
                      transform: `translateX(${x}px)`,
                    }}
                  >
                    <div style={{ fontSize: 28 }}>{step.icon}</div>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: THEME.text }}>
                        {step.label}
                      </div>
                      <div style={{ fontSize: 13, color: THEME.muted }}>{step.desc}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right: Book JSON preview */}
            <div
              style={{
                flex: 1,
                opacity: interpolate(frame, [200, 240], [0, 1], { extrapolateLeft: "clamp" }),
              }}
            >
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: THEME.accent2,
                  marginBottom: 8,
                }}
              >
                Book.json — Character Voice Registry
              </div>
              <CodeBlock code={bookCode} delay={200} speed={2} maxWidth={600} />
            </div>
          </div>
        </AbsoluteFill>
      </GradientBackground>
    </AbsoluteFill>
  );
};
