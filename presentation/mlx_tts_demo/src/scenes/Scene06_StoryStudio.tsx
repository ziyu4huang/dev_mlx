import React from "react";
import { AbsoluteFill, staticFile } from "remotion";
import { GradientBackground } from "../components/GradientBackground";
import { AnimatedTitle } from "../components/AnimatedTitle";
import { ScreenshotFrame } from "../components/ScreenshotFrame";
import { THEME, FONT } from "../style";

export const Scene06_StoryStudio: React.FC = () => {
  return (
    <AbsoluteFill>
      <GradientBackground glowColor="#4ade80">
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
            subtitle="Edit segments, assign voices and emotions visually"
            delay={5}
            align="left"
          />

          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ScreenshotFrame
              src={staticFile("screenshots/story-studio-initial.png")}
              url="localhost:7860/story — 煙火人間 Ch.1"
              delay={20}
              zoomFrom={1}
              zoomTo={1.03}
            />
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 30,
              paddingBottom: 20,
              opacity: 0.8,
            }}
          >
            {["Segment Editor", "Voice Preview", "Emotion Tags", "Audio Export"].map((feat) => (
              <div
                key={feat}
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
