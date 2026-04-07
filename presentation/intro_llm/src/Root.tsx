import React from "react";
import { Composition, registerRoot } from "remotion";
import { IntroLlm, TOTAL_FRAMES } from "./compositions/IntroLlm";

export const Root: React.FC = () => {
  return (
    <>
      <Composition
        id="IntroLlm"
        component={IntroLlm}
        durationInFrames={TOTAL_FRAMES}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};

registerRoot(Root);
