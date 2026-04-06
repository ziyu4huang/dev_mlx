import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, staticFile } from "remotion";
import { GradientBackground } from "../components/GradientBackground";
import { AnimatedTitle } from "../components/AnimatedTitle";
import { ScreenshotFrame } from "../components/ScreenshotFrame";
import { THEME, FONT } from "../style";

export const Scene07_WebUI_Story: React.FC = () => {
  const frame = useCurrentFrame();

  const screenshotOpacity = interpolate(frame, [30, 60], [0, 1], { extrapolateLeft: "clamp" });
  const featureOpacity = interpolate(frame, [400, 440], [0, 1], { extrapolateLeft: "clamp" });

  return (
    <AbsoluteFill>
      <GradientBackground glowColor="#a78bfa">
        <AbsoluteFill
          style={{
            display: "flex",
            flexDirection: "column",
            padding: "50px 100px",
            fontFamily: FONT,
          }}
        >
          <AnimatedTitle
            title="Story Studio"
            subtitle="Advanced multi-segment story production with real-time SSE streaming"
            delay={5}
            align="left"
          />

          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              opacity: screenshotOpacity,
            }}
          >
            <ScreenshotFrame
              src={staticFile("screenshots/story-studio-initial.png")}
              url="localhost:7861 — Story Studio"
              delay={30}
              zoomFrom={1}
              zoomTo={1.03}
            />
          </div>

          {/* Feature highlights */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 30,
              paddingBottom: 20,
              opacity: featureOpacity,
            }}
          >
            {[
              "Segment Editor",
              "Character Colors",
              "SSE Progress",
              "Drag & Reorder",
              "Import / Export",
            ].map((feat, i) => (
              <div
                key={i}
                style={{
                  padding: "6px 14px",
                  background: THEME.surface,
                  border: `1px solid ${THEME.border}`,
                  borderRadius: 8,
                  color: THEME.accent2,
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                {feat}
              </div>
            ))}
          </div>
        </AbsoluteFill>
      </GradientBackground>
    </AbsoluteFill>
  );
};
