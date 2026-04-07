import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { THEME } from "../style";

export const ProgressBar: React.FC<{ totalFrames: number }> = ({ totalFrames }) => {
  const frame = useCurrentFrame();
  const progress = interpolate(frame, [0, totalFrames], [0, 1]);

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 3,
          background: `${THEME.border}40`,
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${progress * 100}%`,
            background: `linear-gradient(90deg, ${THEME.accent}, ${THEME.accent2})`,
          }}
        />
      </div>
    </AbsoluteFill>
  );
};
