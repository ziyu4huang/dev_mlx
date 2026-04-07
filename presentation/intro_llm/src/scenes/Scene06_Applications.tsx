import React from "react";
import { AbsoluteFill, Audio } from "remotion";
import { staticFile } from "remotion";
import { GradientBackground } from "../components/GradientBackground";
import { AnimatedTitle } from "../components/AnimatedTitle";
import { FeatureCard } from "../components/FeatureCard";
import { SubtitleOverlay } from "../components/SubtitleOverlay";
import { scenes } from "../data/scenes";
import { THEME, FONT } from "../style";

const TOTAL_FRAMES = 1020;

export const Scene06_Applications: React.FC = () => {
  const { segments, title, subtitle } = scenes[6];

  const apps = [
    {
      icon: "✍️",
      title: "寫作助手",
      desc: "起草文章、翻譯文件、總結重點",
    },
    {
      icon: "💻",
      title: "程式開發",
      desc: "自動完成程式碼、解釋錯誤、協助除錯",
    },
    {
      icon: "🎓",
      title: "教育醫療",
      desc: "個人化學習建議、初步健康諮詢",
    },
    {
      icon: "🏢",
      title: "客服商業",
      desc: "24 小時即時回應、資料分析",
    },
  ];

  return (
    <AbsoluteFill>
      <GradientBackground glowColor="#f97316">
        <Audio src={staticFile("audio/scene-06.flac")} />

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
              {apps.map((app, i) => (
                <FeatureCard
                  key={app.title}
                  icon={app.icon}
                  title={app.title}
                  description={app.desc}
                  delay={20 + i * 12}
                  width={340}
                  color={THEME.info}
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

export { TOTAL_FRAMES as SCENE06_FRAMES };
