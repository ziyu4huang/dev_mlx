import React from "react";
import { AbsoluteFill, Audio } from "remotion";
import { staticFile } from "remotion";
import { GradientBackground } from "../components/GradientBackground";
import { AnimatedTitle } from "../components/AnimatedTitle";
import { FeatureCard } from "../components/FeatureCard";
import { SubtitleOverlay } from "../components/SubtitleOverlay";
import { scenes } from "../data/scenes";
import { THEME, FONT } from "../style";

const TOTAL_FRAMES = 810;

export const Scene08_FutureOutlook: React.FC = () => {
  const { segments, title, subtitle } = scenes[8];

  const trends = [
    {
      icon: "📱",
      title: "邊緣運算",
      desc: "更小模型在手机和筆電上本地運行",
    },
    {
      icon: "🖼️",
      title: "多模態",
      desc: "同時理解文字、圖片、聲音和影片",
    },
    {
      icon: "🤖",
      title: "AI Agent",
      desc: "自主完成複雜的多步驟任務",
    },
    {
      icon: "🌐",
      title: "開源社群",
      desc: "讓更多人能參與和貢獻",
    },
  ];

  return (
    <AbsoluteFill>
      <GradientBackground glowColor="#c4b5fd">
        <Audio src={staticFile("audio/scene-08.flac")} />

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
                flexWrap: "wrap",
                gap: 20,
              }}
            >
              {trends.map((t, i) => (
                <FeatureCard
                  key={t.title}
                  icon={t.icon}
                  title={t.title}
                  description={t.desc}
                  delay={20 + i * 12}
                  width={340}
                  color={THEME.success}
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

export { TOTAL_FRAMES as SCENE08_FRAMES };
