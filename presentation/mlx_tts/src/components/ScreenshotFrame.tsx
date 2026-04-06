import React from "react";
import { Img, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { THEME, FONT } from "../style";

export const ScreenshotFrame: React.FC<{
  src: string;
  url?: string;
  delay?: number;
  zoomFrom?: number;
  zoomTo?: number;
}> = ({ src, url, delay = 0, zoomFrom = 1, zoomTo = 1.05 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame: Math.max(0, frame - delay),
    fps,
    config: { damping: 18 },
  });

  const opacity = interpolate(progress, [0, 1], [0, 1]);
  const scale = interpolate(progress, [0, 1], [0.95, 1]);

  const zoom = interpolate(
    Math.max(0, frame - delay),
    [0, 300],
    [zoomFrom, zoomTo],
    { extrapolateRight: "clamp" }
  );

  return (
    <div
      style={{
        opacity,
        transform: `scale(${scale})`,
        fontFamily: FONT,
        borderRadius: 12,
        overflow: "hidden",
        border: `1px solid ${THEME.border}`,
        boxShadow: `0 20px 60px ${THEME.bg}80, 0 0 40px ${THEME.accent}15`,
        background: THEME.surface,
      }}
    >
      {/* Browser chrome */}
      <div
        style={{
          height: 36,
          background: THEME.surface2,
          display: "flex",
          alignItems: "center",
          padding: "0 14px",
          gap: 8,
          borderBottom: `1px solid ${THEME.border}`,
        }}
      >
        <div style={{ display: "flex", gap: 6 }}>
          <div style={{ width: 10, height: 10, borderRadius: 5, background: "#f87171" }} />
          <div style={{ width: 10, height: 10, borderRadius: 5, background: "#fbbf24" }} />
          <div style={{ width: 10, height: 10, borderRadius: 5, background: "#4ade80" }} />
        </div>
        <div
          style={{
            flex: 1,
            background: THEME.bg,
            borderRadius: 6,
            padding: "4px 12px",
            fontSize: 12,
            color: THEME.muted,
            marginLeft: 8,
          }}
        >
          {url || "localhost"}
        </div>
      </div>
      {/* Screenshot */}
      <div style={{ overflow: "hidden", height: 500 }}>
        <Img
          src={src}
          style={{
            width: "100%",
            transform: `scale(${zoom})`,
            transformOrigin: "center top",
          }}
        />
      </div>
    </div>
  );
};
