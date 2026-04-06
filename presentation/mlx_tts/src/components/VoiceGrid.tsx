import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { THEME, FONT } from "../style";
import { voiceGroups } from "../data/voices";

export const VoiceGrid: React.FC<{ delay?: number }> = ({ delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  let cardIndex = 0;

  return (
    <div style={{ fontFamily: FONT }}>
      {voiceGroups.map((group, gi) => {
        const groupDelay = delay + gi * 20;

        return (
          <div key={gi} style={{ marginBottom: 24 }}>
            <div
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: group.color,
                marginBottom: 12,
                display: "flex",
                alignItems: "center",
                gap: 8,
                opacity: frame >= groupDelay ? 1 : 0,
              }}
            >
              <span
                style={{
                  background: group.color,
                  color: THEME.bg,
                  padding: "2px 10px",
                  borderRadius: 6,
                  fontSize: 14,
                  fontWeight: 800,
                }}
              >
                {group.prefix}_
              </span>
              {group.language}
              <span style={{ color: THEME.muted, fontWeight: 400, fontSize: 14 }}>
                ({group.voices.length} voices)
              </span>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {group.voices.map((voice, vi) => {
                const cardDelay = groupDelay + vi * 5 + 5;
                const progress = spring({
                  frame: Math.max(0, frame - cardDelay),
                  fps,
                  config: { damping: 14 },
                });
                const opacity = interpolate(progress, [0, 1], [0, 1]);
                const scale = interpolate(progress, [0, 1], [0.8, 1]);

                return (
                  <div
                    key={voice.id}
                    style={{
                      padding: "8px 14px",
                      background: THEME.surface,
                      border: `1px solid ${THEME.border}`,
                      borderRadius: 10,
                      opacity,
                      transform: `scale(${scale})`,
                      display: "flex",
                      flexDirection: "column",
                      minWidth: 130,
                    }}
                  >
                    <div style={{ fontSize: 14, fontWeight: 700, color: THEME.text }}>
                      {voice.gender === "female" ? "♀" : "♂"} {voice.id}
                    </div>
                    <div style={{ fontSize: 12, color: THEME.muted, marginTop: 2 }}>
                      {voice.description}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};
