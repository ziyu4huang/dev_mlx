import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { THEME, FONT } from "../style";

export const FeatureCard: React.FC<{
  icon: string;
  title: string;
  description: string;
  delay?: number;
  width?: number;
  color?: string;
}> = ({ icon, title, description, delay = 0, width = 360, color = THEME.accent }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame: Math.max(0, frame - delay),
    fps,
    config: { damping: 16, mass: 0.7 },
  });

  const scale = interpolate(progress, [0, 1], [0.9, 1]);
  const opacity = interpolate(progress, [0, 1], [0, 1]);

  return (
    <div
      style={{
        width,
        padding: "28px 24px",
        background: THEME.surface,
        border: `1px solid ${THEME.border}`,
        borderRadius: 16,
        opacity,
        transform: `scale(${scale})`,
        fontFamily: FONT,
      }}
    >
      <div style={{ fontSize: 36, marginBottom: 12 }}>{icon}</div>
      <div
        style={{
          fontSize: 20,
          fontWeight: 700,
          color: THEME.text,
          marginBottom: 8,
        }}
      >
        {title}
      </div>
      <div
        style={{
          fontSize: 15,
          color: THEME.muted,
          lineHeight: 1.5,
        }}
      >
        {description}
      </div>
      <div
        style={{
          width: 40,
          height: 3,
          background: color,
          borderRadius: 2,
          marginTop: 16,
        }}
      />
    </div>
  );
};
