import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { THEME, FONT } from "../style";
import { emotions } from "../data/emotions";

export const EmotionBar: React.FC<{ delay?: number }> = ({ delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <div
      style={{
        display: "flex",
        gap: 10,
        flexWrap: "wrap",
        fontFamily: FONT,
      }}
    >
      {emotions.map((emotion, i) => {
        const emDelay = delay + i * 6;
        const progress = spring({
          frame: Math.max(0, frame - emDelay),
          fps,
          config: { damping: 14 },
        });
        const opacity = interpolate(progress, [0, 1], [0, 1]);
        const scale = interpolate(progress, [0, 1], [0.85, 1]);
        const isActive = frame >= emDelay && frame < emDelay + 60;

        return (
          <div
            key={emotion.id}
            style={{
              padding: "10px 16px",
              background: isActive ? `${emotion.color}20` : THEME.surface,
              border: `1px solid ${isActive ? emotion.color : THEME.border}`,
              borderRadius: 12,
              opacity,
              transform: `scale(${scale})`,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span style={{ fontSize: 20 }}>{emotion.emoji}</span>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: THEME.text }}>
                {emotion.label}
              </div>
              <div style={{ fontSize: 11, color: THEME.muted }}>
                {emotion.speed}x
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
