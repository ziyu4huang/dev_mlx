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

export const Scene03_Transformer: React.FC = () => {
  const { segments, title, subtitle } = scenes[3];

  const steps = [
    { label: "輸入文字", icon: "📝" },
    { label: "Tokenizer", icon: "🔢", detail: "分詞" },
    { label: "Embedding", icon: "📊", detail: "向量化" },
    { label: "Attention", icon: "🔍", detail: "注意力" },
    { label: "Feed Forward", icon: "⚡", detail: "前饋網路" },
    { label: "輸出預測", icon: "🎯" },
  ];

  return (
    <AbsoluteFill>
      <GradientBackground glowColor="#a78bfa">
        <Audio src={staticFile("audio/scene-03.flac")} />

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

export { TOTAL_FRAMES as SCENE03_FRAMES };
