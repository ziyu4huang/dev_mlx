import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { THEME } from "../style";

export const GradientBackground: React.FC<{
  children: React.ReactNode;
  glowColor?: string;
}> = ({ children, glowColor = THEME.accent }) => {
  const frame = useCurrentFrame();
  const glowX = interpolate(frame % 600, [0, 600], [0.2, 0.8]);
  const glowY = interpolate(frame % 800, [0, 800], [0.15, 0.4]);

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse at ${glowX * 100}% ${glowY * 100}%, ${glowColor}12 0%, transparent 50%), radial-gradient(ellipse at 20% 20%, ${THEME.surface} 0%, ${THEME.bg} 100%)`,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};
