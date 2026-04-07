import React from "react";
import { Composition, registerRoot } from "remotion";
import { MlxTtsDemo, TOTAL_FRAMES } from "./compositions/MlxTtsDemo";

export const Root: React.FC = () => {
  return (
    <>
      <Composition
        id="MlxTtsDemo"
        component={MlxTtsDemo}
        durationInFrames={TOTAL_FRAMES}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};

registerRoot(Root);
