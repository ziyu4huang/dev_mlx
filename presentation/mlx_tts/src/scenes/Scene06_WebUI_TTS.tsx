import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, staticFile } from "remotion";
import { GradientBackground } from "../components/GradientBackground";
import { AnimatedTitle } from "../components/AnimatedTitle";
import { ScreenshotFrame } from "../components/ScreenshotFrame";
import { THEME, FONT } from "../style";

export const Scene06_WebUI_TTS: React.FC = () => {
  const frame = useCurrentFrame();

  const screenshot1Opacity = interpolate(frame, [30, 60], [0, 1], { extrapolateLeft: "clamp" });
  const screenshot2Opacity = interpolate(frame, [280, 310], [0, 1], { extrapolateLeft: "clamp" });

  const showSecond = frame >= 280;

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
            subtitle="Simple text-to-speech with AI content generation"
            delay={5}
            align="left"
          />

          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
            }}
          >
            <div
              style={{
                opacity: showSecond ? 0 : screenshot1Opacity,
                transform: `scale(${showSecond ? 0.95 : 1})`,
                transition: "opacity 0.5s, transform 0.5s",
                position: showSecond ? "absolute" : "relative",
              }}
            >
              <ScreenshotFrame
                src={staticFile("screenshots/tts-studio-initial.png")}
                url="localhost:7860 — TTS Studio"
                delay={30}
                zoomFrom={1}
                zoomTo={1.02}
              />
            </div>
            <div
              style={{
                opacity: showSecond ? screenshot2Opacity : 0,
                position: showSecond ? "relative" : "absolute",
              }}
            >
              <ScreenshotFrame
                src={staticFile("screenshots/tts-studio-initial.png")}
                url="localhost:7860 — Generating..."
                delay={280}
                zoomFrom={1.02}
                zoomTo={1.05}
              />
            </div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 30,
              paddingBottom: 20,
              opacity: interpolate(frame, [400, 440], [0, 1], { extrapolateLeft: "clamp" }),
            }}
          >
            {[
              "15+ Voice Selection",
              "9 Languages",
              "AI Content Gen",
              "Audio Playback",
              "History Sidebar",
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
