import React from "react";
import { AbsoluteFill, Audio, useCurrentFrame, interpolate } from "remotion";
import { staticFile } from "remotion";
import { GradientBackground } from "../components/GradientBackground";
import { THEME, FONT } from "../style";
import { chapter2Segments, emotionColors, characterColors } from "../data/chapters";

const TOTAL_FRAMES = 2700; // 90 seconds
const SEGMENT_COUNT = chapter2Segments.length;
const FRAMES_PER_SEGMENT = TOTAL_FRAMES / SEGMENT_COUNT;

export const Scene07_Chapter2: React.FC = () => {
  const frame = useCurrentFrame();

  const currentSegIdx = Math.min(
    Math.floor(frame / FRAMES_PER_SEGMENT),
    SEGMENT_COUNT - 1
  );

  return (
    <AbsoluteFill>
      <GradientBackground glowColor="#60a5fa">
        <Audio src={staticFile("audio/chapter-002.flac")} />

        <AbsoluteFill
          style={{
            display: "flex",
            flexDirection: "column",
            fontFamily: FONT,
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "30px 60px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderBottom: `1px solid ${THEME.border}40`,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div
                style={{
                  width: 8,
                  height: 36,
                  borderRadius: 4,
                  background: THEME.info,
                }}
              />
              <div>
                <div style={{ fontSize: 22, fontWeight: 700, color: THEME.text }}>
                  第二章　歸人
                </div>
                <div style={{ fontSize: 13, color: THEME.muted }}>
                  煙火人間 — Chapter 2 · Live Audio Demo
                </div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ fontFamily: "monospace", fontSize: 13, color: THEME.muted }}>
                {formatTime(frame / 30)} / {formatTime(TOTAL_FRAMES / 30)}
              </div>
              <div
                style={{
                  width: 120,
                  height: 4,
                  borderRadius: 2,
                  background: THEME.surface2,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${(frame / TOTAL_FRAMES) * 100}%`,
                    background: `linear-gradient(90deg, ${THEME.info}, ${THEME.accent2})`,
                    borderRadius: 2,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Text display */}
          <div
            style={{
              flex: 1,
              padding: "20px 60px 40px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              gap: 0,
              overflow: "hidden",
            }}
          >
            {/* Previous segments */}
            <div style={{ maxHeight: 180, overflow: "hidden" }}>
              {chapter2Segments.map((seg, i) => {
                if (i >= currentSegIdx) return null;
                const distance = currentSegIdx - i;
                return (
                  <div
                    key={seg.id}
                    style={{
                      padding: "6px 0",
                      opacity: Math.max(0.15, 0.5 - distance * 0.08),
                      fontSize: 16,
                      lineHeight: 1.6,
                      color: THEME.textDim,
                      transform: `translateY(${-distance * 4}px)`,
                    }}
                  >
                    <span style={{ color: characterColors[seg.character] || THEME.muted, fontWeight: 600, fontSize: 13, marginRight: 8 }}>
                      {seg.character}
                    </span>
                    {seg.text}
                  </div>
                );
              })}
            </div>

            {/* Current segment */}
            {chapter2Segments.map((seg, i) => {
              if (i !== currentSegIdx) return null;
              const segFrame = frame - i * FRAMES_PER_SEGMENT;
              const textOpacity = interpolate(segFrame, [0, 20], [0, 1], { extrapolateLeft: "clamp" });
              const textY = interpolate(segFrame, [0, 20], [15, 0], { extrapolateLeft: "clamp" });
              const emotionColor = emotionColors[seg.emotion] || THEME.accent;

              return (
                <div
                  key={seg.id}
                  style={{
                    opacity: textOpacity,
                    transform: `translateY(${textY}px)`,
                    padding: "16px 0",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                    <span
                      style={{
                        fontSize: 15,
                        fontWeight: 700,
                        color: characterColors[seg.character] || THEME.text,
                      }}
                    >
                      {seg.character}
                    </span>
                    <span
                      style={{
                        fontSize: 11,
                        padding: "2px 8px",
                        borderRadius: 10,
                        background: `${emotionColor}20`,
                        color: emotionColor,
                        border: `1px solid ${emotionColor}40`,
                      }}
                    >
                      {seg.emotion}
                    </span>
                    <span
                      style={{
                        fontFamily: "monospace",
                        fontSize: 11,
                        padding: "2px 8px",
                        borderRadius: 10,
                        background: THEME.surface2,
                        color: THEME.muted,
                      }}
                    >
                      {seg.voice}
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: 28,
                      fontWeight: 500,
                      color: THEME.text,
                      lineHeight: 1.8,
                      letterSpacing: 0.5,
                    }}
                  >
                    {seg.text}
                  </div>
                </div>
              );
            })}

            {/* Next preview */}
            {currentSegIdx < SEGMENT_COUNT - 1 && (
              <div
                style={{
                  padding: "6px 0",
                  opacity: 0.1,
                  fontSize: 16,
                  color: THEME.muted,
                }}
              >
                {chapter2Segments[currentSegIdx + 1].text}
              </div>
            )}
          </div>
        </AbsoluteFill>
      </GradientBackground>
    </AbsoluteFill>
  );
};

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}
