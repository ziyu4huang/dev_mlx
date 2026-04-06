import React from "react";
import { Series } from "remotion";
import { Scene01_Intro } from "../scenes/Scene01_Intro";
import { Scene02_MLXFramework } from "../scenes/Scene02_MLXFramework";
import { Scene03_VoiceSystem } from "../scenes/Scene03_VoiceSystem";
import { Scene04_Pipeline } from "../scenes/Scene04_Pipeline";
import { Scene05_StoryJson } from "../scenes/Scene05_StoryJson";
import { Scene06_WebUI_TTS } from "../scenes/Scene06_WebUI_TTS";
import { Scene07_WebUI_Story } from "../scenes/Scene07_WebUI_Story";
import { Scene08_WebUI_Book } from "../scenes/Scene08_WebUI_Book";
import { Scene09_GAI } from "../scenes/Scene09_GAI";
import { Scene10_Workflow } from "../scenes/Scene10_Workflow";
import { Scene11_Outro } from "../scenes/Scene11_Outro";
import { ProgressBar } from "../components/ProgressBar";

const TOTAL_FRAMES = 6300;

export const MlxTtsPresentation: React.FC = () => {
  return (
    <>
      <Series>
        <Series.Sequence durationInFrames={450}>
          <Scene01_Intro />
        </Series.Sequence>
        <Series.Sequence durationInFrames={750}>
          <Scene02_MLXFramework />
        </Series.Sequence>
        <Series.Sequence durationInFrames={900}>
          <Scene03_VoiceSystem />
        </Series.Sequence>
        <Series.Sequence durationInFrames={600}>
          <Scene04_Pipeline />
        </Series.Sequence>
        <Series.Sequence durationInFrames={750}>
          <Scene05_StoryJson />
        </Series.Sequence>
        <Series.Sequence durationInFrames={600}>
          <Scene06_WebUI_TTS />
        </Series.Sequence>
        <Series.Sequence durationInFrames={600}>
          <Scene07_WebUI_Story />
        </Series.Sequence>
        <Series.Sequence durationInFrames={450}>
          <Scene08_WebUI_Book />
        </Series.Sequence>
        <Series.Sequence durationInFrames={600}>
          <Scene09_GAI />
        </Series.Sequence>
        <Series.Sequence durationInFrames={450}>
          <Scene10_Workflow />
        </Series.Sequence>
        <Series.Sequence durationInFrames={300}>
          <Scene11_Outro />
        </Series.Sequence>
      </Series>
      <ProgressBar totalFrames={TOTAL_FRAMES} />
    </>
  );
};
