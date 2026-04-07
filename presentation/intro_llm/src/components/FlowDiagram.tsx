import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { THEME, FONT } from "../style";

export interface FlowStep {
  label: string;
  icon: string;
  detail?: string;
}

export const FlowDiagram: React.FC<{
  steps: FlowStep[];
  delay?: number;
}> = ({ steps, delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 0,
        fontFamily: FONT,
      }}
    >
      {steps.map((step, i) => {
        const stepDelay = delay + i * 15;
        const progress = spring({
          frame: Math.max(0, frame - stepDelay),
          fps,
          config: { damping: 16 },
        });

        const opacity = interpolate(progress, [0, 1], [0, 1]);
        const scale = interpolate(progress, [0, 1], [0.85, 1]);
        const isActive = frame >= stepDelay && frame < stepDelay + 90;

        return (
          <React.Fragment key={i}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                opacity,
                transform: `scale(${scale})`,
                transition: "box-shadow 0.3s",
              }}
            >
              <div
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: 20,
                  background: isActive
                    ? `linear-gradient(135deg, ${THEME.accent}, ${THEME.accent2})`
                    : THEME.surface2,
                  border: `2px solid ${isActive ? THEME.accent : THEME.border}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 40,
                  boxShadow: isActive ? `0 0 30px ${THEME.accent}40` : "none",
                }}
              >
                {step.icon}
              </div>
              <div
                style={{
                  marginTop: 12,
                  fontSize: 16,
                  fontWeight: 700,
                  color: isActive ? THEME.text : THEME.muted,
                  textAlign: "center",
                }}
              >
                {step.label}
              </div>
              {step.detail && (
                <div
                  style={{
                    marginTop: 4,
                    fontSize: 13,
                    color: THEME.muted,
                    textAlign: "center",
                  }}
                >
                  {step.detail}
                </div>
              )}
            </div>
            {i < steps.length - 1 && (
              <div
                style={{
                  width: 60,
                  height: 3,
                  background: frame >= stepDelay + 10
                    ? `linear-gradient(90deg, ${THEME.accent}, ${THEME.accent2})`
                    : THEME.border,
                  margin: "0 8px",
                  marginBottom: 24,
                  borderRadius: 2,
                }}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};
