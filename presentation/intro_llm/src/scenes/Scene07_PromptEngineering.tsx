import React from "react";
import { AbsoluteFill, Audio } from "remotion";
import { staticFile } from "remotion";
import { GradientBackground } from "../components/GradientBackground";
import { AnimatedTitle } from "../components/AnimatedTitle";
import { CodeBlock } from "../components/CodeBlock";
import { SubtitleOverlay } from "../components/SubtitleOverlay";
import { scenes } from "../data/scenes";
import { THEME, FONT } from "../style";

const TOTAL_FRAMES = 1050;

const promptExample = `你是一位經驗豐富的 Python 工程師。

請幫我寫一個函數，接收一個整數列表，
回傳其中所有偶數的平方和。

請一步一步思考：
1. 先過濾出偶數
2. 將每個偶數平方
3. 加總所有平方值`;

export const Scene07_PromptEngineering: React.FC = () => {
  const { segments, title, subtitle } = scenes[7];

  return (
    <AbsoluteFill>
      <GradientBackground glowColor="#7c6af7">
        <Audio src={staticFile("audio/scene-07.flac")} />

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

            <div style={{ marginTop: 20 }}>
              <CodeBlock
                code={promptExample}
                delay={30}
                speed={1.5}
                maxWidth={800}
              />
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

export { TOTAL_FRAMES as SCENE07_FRAMES };
