import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { THEME, FONT } from "../style";

export interface NarrationSegment {
  id: string;
  text: string;
  emotion: string;
  speed: number;
}

const emotionColors: Record<string, string> = {
  storytelling: THEME.accent2,
  neutral: THEME.muted,
  calm: THEME.info,
  serious: THEME.warn,
  happy: THEME.success,
  excited: "#f97316",
  sad: "#818cf8",
  whispery: "#a78bfa",
};

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export const SubtitleOverlay: React.FC<{
  segments: NarrationSegment[];
  totalFrames: number;
  headerTitle: string;
  headerSubtitle?: string;
}> = ({ segments, totalFrames, headerTitle, headerSubtitle }) => {
  const frame = useCurrentFrame();
  const SEGMENT_COUNT = segments.length;
  const FRAMES_PER_SEGMENT = totalFrames / SEGMENT_COUNT;

  const currentSegIdx = Math.min(
    Math.floor(frame / FRAMES_PER_SEGMENT),
    SEGMENT_COUNT - 1
  );

  return (
    <>
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
              background: THEME.accent,
            }}
          />
          <div>
            <div style={{ fontSize: 22, fontWeight: 700, color: THEME.text }}>
              {headerTitle}
            </div>
            {headerSubtitle && (
              <div style={{ fontSize: 13, color: THEME.muted }}>
                {headerSubtitle}
              </div>
            )}
          </div>
        </div>

        {/* Progress */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              fontFamily: "monospace",
              fontSize: 13,
              color: THEME.muted,
            }}
          >
            {formatTime(frame / 30)} / {formatTime(totalFrames / 30)}
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
                width: `${(frame / totalFrames) * 100}%`,
                background: `linear-gradient(90deg, ${THEME.accent}, ${THEME.accent2})`,
                borderRadius: 2,
              }}
            />
          </div>
        </div>
      </div>

      {/* Text display area */}
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
        {/* Previous segments (faded) */}
        <div style={{ maxHeight: 180, overflow: "hidden" }}>
          {segments.map((seg, i) => {
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
                {seg.text}
              </div>
            );
          })}
        </div>

        {/* Current segment - highlighted */}
        {segments.map((seg, i) => {
          if (i !== currentSegIdx) return null;
          const segFrame = frame - i * FRAMES_PER_SEGMENT;
          const textOpacity = interpolate(segFrame, [0, 20], [0, 1], {
            extrapolateLeft: "clamp",
          });
          const textY = interpolate(segFrame, [0, 20], [15, 0], {
            extrapolateLeft: "clamp",
          });
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
              {/* Emotion badge */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 8,
                }}
              >
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
              </div>

              {/* Main text */}
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

        {/* Next segment preview */}
        {currentSegIdx < SEGMENT_COUNT - 1 && (
          <div
            style={{
              padding: "6px 0",
              opacity: 0.1,
              fontSize: 16,
              color: THEME.muted,
            }}
          >
            {segments[currentSegIdx + 1].text}
          </div>
        )}
      </div>
    </>
  );
};
