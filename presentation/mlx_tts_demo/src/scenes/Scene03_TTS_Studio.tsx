import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, staticFile } from "remotion";
import { GradientBackground } from "../components/GradientBackground";
import { AnimatedTitle } from "../components/AnimatedTitle";
import { ScreenshotFrame } from "../components/ScreenshotFrame";
import { THEME, FONT } from "../style";

export const Scene03_TTS_Studio: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill>
      <GradientBackground glowColor="#7c6af7">
        <AbsoluteFill
          style={{
            display: "flex",
            flexDirection: "column",
            padding: "50px 100px",
            fontFamily: FONT,
          }}
        >
          <AnimatedTitle
            title="TTS Studio"
            subtitle="Input text, select voice & emotion, generate audio"
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
              src={staticFile("screenshots/tts-studio-initial.png")}
              url="localhost:7860 — TTS Studio"
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
              opacity: interpolate(frame, [350, 390], [0, 1], { extrapolateLeft: "clamp" }),
            }}
          >
            {["15+ Voices", "9 Languages", "Emotion Tags", "Audio Playback"].map((feat) => (
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
