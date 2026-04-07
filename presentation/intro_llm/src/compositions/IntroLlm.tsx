import React from "react";
import { AbsoluteFill, Series } from "remotion";
import { Scene01_Intro } from "../scenes/Scene01_Intro";
import { Scene02_WhatIsLlm } from "../scenes/Scene02_WhatIsLlm";
import { Scene03_Transformer } from "../scenes/Scene03_Transformer";
import { Scene04_Training } from "../scenes/Scene04_Training";
import { Scene05_KeyConcepts } from "../scenes/Scene05_KeyConcepts";
import { Scene06_Applications } from "../scenes/Scene06_Applications";
import { Scene07_PromptEngineering } from "../scenes/Scene07_PromptEngineering";
import { Scene08_FutureOutlook } from "../scenes/Scene08_FutureOutlook";
import { Scene09_Outro } from "../scenes/Scene09_Outro";
import { ProgressBar } from "../components/ProgressBar";

// Scene durations at 30fps — matched to actual audio durations
const S01 = 540;    // 18s - Intro (audio 15.75s)
const S02 = 990;    // 33s - What is LLM (audio 29.80s)
const S03 = 990;    // 33s - Transformer (audio 30.33s)
const S04 = 990;    // 33s - Training (audio 30.28s)
const S05 = 900;    // 30s - Key Concepts (audio 27.65s)
const S06 = 1020;   // 34s - Applications (audio 31.63s)
const S07 = 1050;   // 35s - Prompt Engineering (audio 32.45s)
const S08 = 810;    // 27s - Future (audio 24.68s)
const S09 = 570;    // 19s - Outro (audio 16.80s)

export const TOTAL_FRAMES =
  S01 + S02 + S03 + S04 + S05 + S06 + S07 + S08 + S09;

export const IntroLlm: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: "#0f1117" }}>
      <Series>
        <Series.Sequence durationInFrames={S01}>
          <Scene01_Intro />
        </Series.Sequence>
        <Series.Sequence durationInFrames={S02}>
          <Scene02_WhatIsLlm />
        </Series.Sequence>
        <Series.Sequence durationInFrames={S03}>
          <Scene03_Transformer />
        </Series.Sequence>
        <Series.Sequence durationInFrames={S04}>
          <Scene04_Training />
        </Series.Sequence>
        <Series.Sequence durationInFrames={S05}>
          <Scene05_KeyConcepts />
        </Series.Sequence>
        <Series.Sequence durationInFrames={S06}>
          <Scene06_Applications />
        </Series.Sequence>
        <Series.Sequence durationInFrames={S07}>
          <Scene07_PromptEngineering />
        </Series.Sequence>
        <Series.Sequence durationInFrames={S08}>
          <Scene08_FutureOutlook />
        </Series.Sequence>
        <Series.Sequence durationInFrames={S09}>
          <Scene09_Outro />
        </Series.Sequence>
      </Series>
      <ProgressBar totalFrames={TOTAL_FRAMES} />
    </AbsoluteFill>
  );
};
