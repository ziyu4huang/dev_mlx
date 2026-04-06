import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { THEME, FONT, MONO } from "../style";

export const CodeBlock: React.FC<{
  code: string;
  delay?: number;
  speed?: number;
  maxWidth?: number;
  highlightLines?: number[];
}> = ({ code, delay = 0, speed = 2, maxWidth = 900, highlightLines = [] }) => {
  const frame = useCurrentFrame();
  const lines = code.split("\n");
  const visibleLines = Math.min(
    lines.length,
    Math.max(0, Math.floor((frame - delay) * speed / 3))
  );

  if (frame < delay) return null;

  return (
    <div
      style={{
        maxWidth,
        background: THEME.surface,
        border: `1px solid ${THEME.border}`,
        borderRadius: 12,
        padding: "20px 24px",
        fontFamily: MONO,
        fontSize: 15,
        lineHeight: 1.7,
        overflow: "hidden",
      }}
    >
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <div style={{ width: 12, height: 12, borderRadius: 6, background: "#f87171" }} />
        <div style={{ width: 12, height: 12, borderRadius: 6, background: "#fbbf24" }} />
        <div style={{ width: 12, height: 12, borderRadius: 6, background: "#4ade80" }} />
      </div>
      {lines.slice(0, visibleLines).map((line, i) => (
        <div
          key={i}
          style={{
            color: highlightLines.includes(i) ? THEME.accent2 : getLineColor(line),
            whiteSpace: "pre",
          }}
        >
          <span style={{ color: THEME.muted, marginRight: 16, userSelect: "none" }}>
            {String(i + 1).padStart(2, " ")}
          </span>
          {line}
        </div>
      ))}
    </div>
  );
};

function getLineColor(line: string): string {
  const trimmed = line.trim();
  if (trimmed.startsWith('"') || trimmed.startsWith("'")) return THEME.success;
  if (/^\d/.test(trimmed) || /^-\d/.test(trimmed)) return THEME.warn;
  if (trimmed.endsWith(":")) return THEME.accent2;
  if (trimmed === "{" || trimmed === "}" || trimmed === "[" || trimmed === "]" || trimmed === ",") return THEME.muted;
  return THEME.textDim || THEME.text;
}
