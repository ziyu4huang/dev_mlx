import React from "react";
import { AbsoluteFill, Audio } from "remotion";
import { staticFile } from "remotion";
import { GradientBackground } from "../components/GradientBackground";
import { AnimatedTitle } from "../components/AnimatedTitle";
import { FlowDiagram } from "../components/FlowDiagram";
import { SubtitleOverlay } from "../components/SubtitleOverlay";
import { scenes } from "../data/scenes";
import { THEME, FONT } from "../style";

const TOTAL_FRAMES = 990;

export const Scene04_Training: React.FC = () => {
  const { segments, title, subtitle } = scenes[4];

  const steps = [
    { label: "預訓練", icon: "📚", detail: "Pre-training" },
    { label: "微調", icon: "🔧", detail: "Fine-tuning" },
    { label: "RLHF", icon: "👍", detail: "人類回饋強化學習" },
  ];

  return (
    <AbsoluteFill>
      <GradientBackground glowColor="#4ade80">
        <Audio src={staticFile("audio/scene-04.flac")} />

        <AbsoluteFill
          style={{
            display: "flex",
            flexDirection: "column",
            fontFamily: FONT,
          }}
        >
          {/* Top section */}
          <div style={{ padding: "40px 60px 0" }}>
            <AnimatedTitle
              title={title}
              subtitle={subtitle}
              delay={5}
              align="left"
            />

            <div style={{ marginTop: 30 }}>
              <FlowDiagram steps={steps} delay={20} />
            </div>
          </div>

          {/* Bottom section: subtitle overlay */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <SubtitleOverlay
              segments={segments}
              totalFrames={TOTAL_FRAMES}
              headerTitle={title}
              headerSubtitle={subtitle}
            />
          </div>
        </AbsoluteFill>
      </GradientBackground>
    </AbsoluteFill>
  );
};

export { TOTAL_FRAMES as SCENE04_FRAMES };
