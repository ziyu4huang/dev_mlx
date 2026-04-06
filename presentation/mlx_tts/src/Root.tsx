import React from "react";
import { Composition } from "remotion";
import { MlxTtsPresentation } from "./compositions/MlxTtsPresentation";

export const Root: React.FC = () => {
  return (
    <>
      <Composition
        id="MlxTtsPresentation"
        component={MlxTtsPresentation}
        durationInFrames={6300}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
