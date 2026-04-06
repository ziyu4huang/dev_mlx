import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { GradientBackground } from "../components/GradientBackground";
import { AnimatedTitle } from "../components/AnimatedTitle";
import { THEME, FONT, MONO } from "../style";

const commands = [
  { prompt: "$ ", cmd: "# 1. Fetch or write a story", delay: 20 },
  { prompt: "$ ", cmd: "cat books/yanhuo/chapters/chapter-001.txt | head -5", delay: 50 },
  { prompt: "", cmd: "清晨五點半，基隆港的霧還沒散盡...", delay: 80 },
  { prompt: "", cmd: "", delay: 100 },
  { prompt: "$ ", cmd: "# 2. Parse text → story.json (LLM-powered)", delay: 120 },
  { prompt: "$ ", cmd: "/story-to-voice books/yanhuo/", delay: 150 },
  { prompt: "", cmd: "  → Parsed 5 chapters, 7 characters detected", delay: 180 },
  { prompt: "", cmd: "", delay: 200 },
  { prompt: "$ ", cmd: "# 3. Open Story Studio to produce", delay: 220 },
  { prompt: "$ ", cmd: "/story-to-voice open browser studio", delay: 250 },
  { prompt: "", cmd: "  → Story Studio running at http://localhost:7861", delay: 280 },
  { prompt: "", cmd: "", delay: 300 },
  { prompt: "$ ", cmd: "# 4. Result: multi-voice FLAC audiobook", delay: 330 },
  { prompt: "$ ", cmd: "ls books/yanhuo/chapters/*.flac", delay: 360 },
  { prompt: "", cmd: "  chapter-001.flac  chapter-002.flac  chapter-003.flac ...", delay: 390 },
];

export const Scene10_Workflow: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill>
      <GradientBackground glowColor="#4ade80">
        <AbsoluteFill
          style={{
            display: "flex",
            flexDirection: "column",
            padding: "60px 100px",
            fontFamily: FONT,
          }}
        >
          <AnimatedTitle
            title="Complete Workflow"
            subtitle="From text to audiobook in 4 steps"
            delay={5}
            align="left"
          />

          <div
            style={{
              marginTop: 40,
              background: THEME.bg,
              border: `1px solid ${THEME.border}`,
              borderRadius: 12,
              padding: "24px 28px",
              fontFamily: MONO,
              fontSize: 15,
              lineHeight: 1.9,
              flex: 1,
              maxHeight: 600,
              overflow: "hidden",
            }}
          >
            {/* Terminal chrome */}
            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
              <div style={{ width: 10, height: 10, borderRadius: 5, background: "#f87171" }} />
              <div style={{ width: 10, height: 10, borderRadius: 5, background: "#fbbf24" }} />
              <div style={{ width: 10, height: 10, borderRadius: 5, background: "#4ade80" }} />
            </div>

            {commands.map((line, i) => {
              const opacity = interpolate(
                frame,
                [line.delay, line.delay + 15],
                [0, 1],
                { extrapolateLeft: "clamp" }
              );

              if (!line.cmd) return <div key={i} style={{ height: 8, opacity }} />;

              const isComment = line.cmd.startsWith("#");
              const isOutput = !line.prompt && line.cmd;

              return (
                <div key={i} style={{ opacity }}>
                  {line.prompt && (
                    <span style={{ color: THEME.success }}>{line.prompt}</span>
                  )}
                  <span
                    style={{
                      color: isComment
                        ? THEME.muted
                        : isOutput
                          ? THEME.textDim
                          : THEME.text,
                    }}
                  >
                    {line.cmd}
                  </span>
                </div>
              );
            })}
          </div>
        </AbsoluteFill>
      </GradientBackground>
    </AbsoluteFill>
  );
};
