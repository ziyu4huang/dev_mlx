import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { GradientBackground } from "../components/GradientBackground";
import { AnimatedTitle } from "../components/AnimatedTitle";
import { THEME, FONT, MONO } from "../style";

const jsonSnippet = `{
  "id": "seg_7",
  "character": "全叔",
  "text": "不夠。昨天多賣了三十碗，蛋不夠了。",
  "voice": "zm_yunxi",
  "emotion": "neutral",
  "speed": 0.95
}`;

const voiceList = [
  { voice: "zm_yunjian", desc: "Narrator — deep storytelling voice" },
  { voice: "zm_yunxi", desc: "全叔 — calm older male" },
  { voice: "zf_xiaobei", desc: "阿娥 — friendly female" },
];

export const Scene02_StoryJson: React.FC = () => {
  const frame = useCurrentFrame();

  const codeOpacity = interpolate(frame, [30, 70], [0, 1], { extrapolateLeft: "clamp" });
  const voiceOpacity = interpolate(frame, [250, 300], [0, 1], { extrapolateLeft: "clamp" });

  return (
    <AbsoluteFill>
      <GradientBackground glowColor="#7c6af7">
        <AbsoluteFill
          style={{
            display: "flex",
            flexDirection: "column",
            padding: "50px 100px",
            fontFamily: FONT,
          }}
        >
          <AnimatedTitle
            title="Story JSON"
            subtitle="Each segment defines character, voice, emotion, and speed"
            delay={5}
            align="left"
          />

          <div style={{ flex: 1, display: "flex", gap: 60, paddingTop: 30 }}>
            {/* JSON code block */}
            <div
              style={{
                flex: 1,
                opacity: codeOpacity,
                background: THEME.bg,
                borderRadius: 12,
                border: `1px solid ${THEME.border}`,
                padding: "24px 28px",
                fontFamily: MONO,
                fontSize: 18,
                lineHeight: 1.8,
                color: THEME.textDim,
                overflow: "hidden",
              }}
            >
              <div style={{ color: THEME.muted, fontSize: 13, marginBottom: 12 }}>
                chapter-001.story.json
              </div>
              {jsonSnippet.split("\n").map((line, i) => (
                <div key={i} style={{ whiteSpace: "pre" }}>
                  {colorJsonLine(line)}
                </div>
              ))}
            </div>

            {/* Voice list */}
            <div
              style={{
                width: 360,
                opacity: voiceOpacity,
                display: "flex",
                flexDirection: "column",
                gap: 16,
                justifyContent: "center",
              }}
            >
              <div style={{ fontSize: 16, color: THEME.muted, fontWeight: 600, marginBottom: 8 }}>
                Character Voices
              </div>
              {voiceList.map((v, i) => (
                <div
                  key={i}
                  style={{
                    background: THEME.surface,
                    border: `1px solid ${THEME.border}`,
                    borderRadius: 10,
                    padding: "14px 18px",
                    opacity: interpolate(
                      Math.max(0, frame - 300 - i * 30),
                      [0, 25],
                      [0, 1],
                      { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
                    ),
                    transform: `translateX(${interpolate(
                      Math.max(0, frame - 300 - i * 30),
                      [0, 25],
                      [20, 0],
                      { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
                    )}px)`,
                  }}
                >
                  <div
                    style={{
                      fontFamily: MONO,
                      fontSize: 15,
                      color: THEME.accent2,
                      fontWeight: 700,
                    }}
                  >
                    {v.voice}
                  </div>
                  <div style={{ fontSize: 14, color: THEME.muted, marginTop: 4 }}>{v.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </AbsoluteFill>
      </GradientBackground>
    </AbsoluteFill>
  );
};

function colorJsonLine(line: string): React.ReactNode {
  const colored = line
    .replace(/"(\w+)":/g, `<KEY>"$1"</KEY>:`)
    .replace(/: "(.*?)"/g, `: <STR>"$1"</STR>`)
    .replace(/: (0\.\d+)/g, `: <NUM>$1</NUM>`);

  const parts = colored.split(/<(KEY|STR|NUM)>(.*?)<\/\1>/g);
  const colorMap: Record<string, string> = {
    KEY: "#60a5fa",
    STR: "#4ade80",
    NUM: "#fbbf24",
  };

  return parts.map((part, i) => {
    if (i % 3 === 1) {
      const tag = part;
      const text = parts[i + 1];
      return (
        <span key={i} style={{ color: colorMap[tag] }}>
          {text}
        </span>
      );
    }
    if (i % 3 === 2) return null;
    return <span key={i}>{part}</span>;
  });
}
