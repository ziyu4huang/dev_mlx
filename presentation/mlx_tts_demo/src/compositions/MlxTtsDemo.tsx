import React from "react";
import { Series } from "remotion";
import { Scene01_Intro } from "../scenes/Scene01_Intro";
import { Scene02_StoryJson } from "../scenes/Scene02_StoryJson";
import { Scene03_TTS_Studio } from "../scenes/Scene03_TTS_Studio";
import { Scene04_Chapter1 } from "../scenes/Scene04_Chapter1";
import { Scene05_BookBrowser } from "../scenes/Scene05_BookBrowser";
import { Scene06_StoryStudio } from "../scenes/Scene06_StoryStudio";
import { Scene07_Chapter2 } from "../scenes/Scene07_Chapter2";
import { Scene08_Outro } from "../scenes/Scene08_Outro";
import { ProgressBar } from "../components/ProgressBar";

// Scene durations at 30fps:
// Intro: 300 (10s)
// Story JSON: 450 (15s)
// TTS Studio: 450 (15s)
// Chapter 1 Demo: 2700 (90s) — audio playback with synced text
// Book Browser: 450 (15s)
// Story Studio: 450 (15s)
// Chapter 2 Demo: 2700 (90s) — audio playback with synced text
// Outro: 300 (10s)
// Total: 7800 frames (260s = 4:20)

const INTRO = 300;
const STORY_JSON = 450;
const TTS_STUDIO = 450;
const CHAPTER1 = 2700;
const BOOK_BROWSER = 450;
const STORY_STUDIO = 450;
const CHAPTER2 = 2700;
const OUTRO = 300;

export const TOTAL_FRAMES = INTRO + STORY_JSON + TTS_STUDIO + CHAPTER1 + BOOK_BROWSER + STORY_STUDIO + CHAPTER2 + OUTRO;

export const MlxTtsDemo: React.FC = () => {
  return (
    <>
      <Series>
        <Series.Sequence durationInFrames={INTRO}>
          <Scene01_Intro />
        </Series.Sequence>
        <Series.Sequence durationInFrames={STORY_JSON}>
          <Scene02_StoryJson />
        </Series.Sequence>
        <Series.Sequence durationInFrames={TTS_STUDIO}>
          <Scene03_TTS_Studio />
        </Series.Sequence>
        <Series.Sequence durationInFrames={CHAPTER1}>
          <Scene04_Chapter1 />
        </Series.Sequence>
        <Series.Sequence durationInFrames={BOOK_BROWSER}>
          <Scene05_BookBrowser />
        </Series.Sequence>
        <Series.Sequence durationInFrames={STORY_STUDIO}>
          <Scene06_StoryStudio />
        </Series.Sequence>
        <Series.Sequence durationInFrames={CHAPTER2}>
          <Scene07_Chapter2 />
        </Series.Sequence>
        <Series.Sequence durationInFrames={OUTRO}>
          <Scene08_Outro />
        </Series.Sequence>
      </Series>
      <ProgressBar totalFrames={TOTAL_FRAMES} />
    </>
  );
};
