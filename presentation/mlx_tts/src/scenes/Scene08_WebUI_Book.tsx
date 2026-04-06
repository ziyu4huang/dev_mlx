import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, staticFile } from "remotion";
import { GradientBackground } from "../components/GradientBackground";
import { AnimatedTitle } from "../components/AnimatedTitle";
import { ScreenshotFrame } from "../components/ScreenshotFrame";
import { THEME, FONT } from "../style";

export const Scene08_WebUI_Book: React.FC = () => {
  const frame = useCurrentFrame();

  const screenshot1Opacity = interpolate(frame, [20, 50], [0, 1], { extrapolateLeft: "clamp" });
  const showSecond = frame >= 240;
  const screenshot2Opacity = interpolate(frame, [240, 270], [0, 1], { extrapolateLeft: "clamp" });

  return (
    <AbsoluteFill>
      <GradientBackground glowColor="#60a5fa">
        <AbsoluteFill
          style={{
            display: "flex",
            flexDirection: "column",
            padding: "50px 100px",
            fontFamily: FONT,
          }}
        >
          <AnimatedTitle
            title="Book Browser"
            subtitle="Multi-chapter book management with consistent character voices"
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
                position: showSecond ? "absolute" : "relative",
              }}
            >
              <ScreenshotFrame
                src={staticFile("screenshots/book-browser-initial.png")}
                url="localhost:7860/books — Book Browser"
                delay={20}
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
                src={staticFile("screenshots/book-browser-yanhuo.png")}
                url="localhost:7860/books — 煙火人間"
                delay={240}
                zoomFrom={1}
                zoomTo={1.04}
              />
            </div>
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
            {[
              "Character Registry",
              "Chapter Status",
              "Voice Pool",
              "Bulk Production",
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
