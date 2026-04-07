import React from "react";
import { AbsoluteFill, Audio, useCurrentFrame, interpolate } from "remotion";
import { staticFile } from "remotion";
import { GradientBackground } from "../components/GradientBackground";
import { AnimatedTitle } from "../components/AnimatedTitle";
import { FeatureCard } from "../components/FeatureCard";
import { SubtitleOverlay } from "../components/SubtitleOverlay";
import { scenes } from "../data/scenes";
import { THEME, FONT } from "../style";

const TOTAL_FRAMES = 990;

export const Scene02_WhatIsLlm: React.FC = () => {
  const frame = useCurrentFrame();
  const { segments, title, subtitle } = scenes[2];

  return (
    <AbsoluteFill>
      <GradientBackground glowColor="#60a5fa">
        <Audio src={staticFile("audio/scene-02.flac")} />

        <AbsoluteFill
          style={{
            display: "flex",
            flexDirection: "column",
            fontFamily: FONT,
          }}
        >
          {/* Top section: title + cards */}
          <div
            style={{
              padding: "40px 60px 0",
              display: "flex",
              gap: 40,
            }}
          >
            <div style={{ flex: 1 }}>
              <AnimatedTitle
                title={title}
                subtitle={subtitle}
                delay={5}
                align="left"
              />

              {/* Feature cards */}
              <div
                style={{
                  marginTop: 30,
                  display: "flex",
                  gap: 20,
                }}
              >
                {[
                  {
                    icon: "📖",
                    title: "理解語言",
                    desc: "閱讀並理解人類語言的語意和上下文",
                  },
                  {
                    icon: "✍️",
                    title: "生成內容",
                    desc: "自動產生文章、程式碼、翻譯等多種文本",
                  },
                ].map((card, i) => (
                  <FeatureCard
                    key={card.title}
                    icon={card.icon}
                    title={card.title}
                    description={card.desc}
                    delay={30 + i * 15}
                    width={320}
                    color={THEME.info}
                  />
                ))}
              </div>
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

export { TOTAL_FRAMES as SCENE02_FRAMES };
