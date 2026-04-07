import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { THEME, FONT } from "../style";

export const AnimatedTitle: React.FC<{
  title: string;
  subtitle?: string;
  delay?: number;
  align?: "left" | "center";
}> = ({ title, subtitle, delay = 0, align = "center" }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleProgress = spring({
    frame: Math.max(0, frame - delay),
    fps,
    config: { damping: 18, mass: 0.8 },
  });

  const titleY = interpolate(titleProgress, [0, 1], [40, 0]);
  const titleOpacity = interpolate(titleProgress, [0, 1], [0, 1]);

  const subtitleProgress = spring({
    frame: Math.max(0, frame - delay - 10),
    fps,
    config: { damping: 20 },
  });
  const subtitleOpacity = interpolate(subtitleProgress, [0, 1], [0, 1]);
  const subtitleY = interpolate(subtitleProgress, [0, 1], [20, 0]);

  const underlineWidth = interpolate(
    Math.max(0, frame - delay - 15),
    [0, 20],
    [0, 100],
    { extrapolateRight: "clamp" }
  );

  return (
    <div
      style={{
        textAlign: align,
        fontFamily: FONT,
      }}
    >
      <div
        style={{
          fontSize: 72,
          fontWeight: 800,
          color: THEME.text,
          opacity: titleOpacity,
          transform: `translateY(${titleY}px)`,
          lineHeight: 1.1,
        }}
      >
        {title}
        <div
          style={{
            width: `${underlineWidth}%`,
            height: 4,
            background: `linear-gradient(90deg, ${THEME.accent}, ${THEME.accent2})`,
            borderRadius: 2,
            margin: align === "center" ? "12px auto 0" : "12px 0 0",
          }}
        />
      </div>
      {subtitle && (
        <div
          style={{
            fontSize: 28,
            color: THEME.muted,
            marginTop: 16,
            opacity: subtitleOpacity,
            transform: `translateY(${subtitleY}px)`,
            fontWeight: 400,
          }}
        >
          {subtitle}
        </div>
      )}
    </div>
  );
};
