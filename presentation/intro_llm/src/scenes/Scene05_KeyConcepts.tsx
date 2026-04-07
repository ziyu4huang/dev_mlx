import React from "react";
import { AbsoluteFill, Audio } from "remotion";
import { staticFile } from "remotion";
import { GradientBackground } from "../components/GradientBackground";
import { AnimatedTitle } from "../components/AnimatedTitle";
import { FeatureCard } from "../components/FeatureCard";
import { SubtitleOverlay } from "../components/SubtitleOverlay";
import { scenes } from "../data/scenes";
import { THEME, FONT } from "../style";

const TOTAL_FRAMES = 900;

export const Scene05_KeyConcepts: React.FC = () => {
  const { segments, title, subtitle } = scenes[5];

  const concepts = [
    {
      icon: "🧩",
      title: "Token",
      desc: "模型處理文字的基本單位，約對應一個詞或半個詞",
    },
    {
      icon: "📐",
      title: "Embedding",
      desc: "將文字轉換為數字向量，捕捉語意關係",
    },
    {
      icon: "📄",
      title: "Context Window",
      desc: "模型一次能處理的最大文字長度",
    },
  ];

  return (
    <AbsoluteFill>
      <GradientBackground glowColor="#fbbf24">
        <Audio src={staticFile("audio/scene-05.flac")} />

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

            <div
              style={{
                marginTop: 30,
                display: "flex",
                gap: 20,
              }}
            >
              {concepts.map((c, i) => (
                <FeatureCard
                  key={c.title}
                  icon={c.icon}
                  title={c.title}
                  description={c.desc}
                  delay={20 + i * 15}
                  width={360}
                  color={THEME.warn}
                />
              ))}
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

export { TOTAL_FRAMES as SCENE05_FRAMES };
