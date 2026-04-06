import React from "react";
import { AbsoluteFill } from "remotion";
import { GradientBackground } from "../components/GradientBackground";
import { AnimatedTitle } from "../components/AnimatedTitle";
import { FeatureCard } from "../components/FeatureCard";
import { THEME, FONT } from "../style";

export const Scene02_MLXFramework: React.FC = () => {
  return (
    <AbsoluteFill>
      <GradientBackground glowColor="#4ade80">
        <AbsoluteFill
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "80px 120px",
            fontFamily: FONT,
          }}
        >
          <AnimatedTitle
            title="Apple MLX Framework"
            subtitle="GPU-accelerated machine learning on Apple Silicon"
            delay={5}
          />

          {/* Architecture layers */}
          <div
            style={{
              marginTop: 60,
              display: "flex",
              flexDirection: "column",
              gap: 16,
              width: "100%",
              maxWidth: 1000,
            }}
          >
            {[
              {
                icon: "🍎",
                title: "Apple Silicon M1/M2/M3/M4",
                desc: "Unified memory architecture — CPU, GPU, Neural Engine share the same memory pool",
                color: "#7c8098",
              },
              {
                icon: "⚡",
                title: "MLX Framework",
                desc: "Apple's open-source ML framework — familiar NumPy/PyTorch-like API, lazy computation, unified memory",
                color: "#60a5fa",
              },
              {
                icon: "🗣️",
                title: "Kokoro-82M Model",
                desc: "~400MB model, 82M parameters — fits comfortably on 8GB M1 MacBook Air",
                color: THEME.accent,
              },
              {
                icon: "🎵",
                title: "24kHz Audio Output",
                desc: "High-quality speech synthesis with real-time factor >1x — faster than real-time on M1+",
                color: THEME.success,
              },
            ].map((item, i) => (
              <FeatureCard
                key={i}
                icon={item.icon}
                title={item.title}
                description={item.desc}
                delay={20 + i * 12}
                width={1000}
                color={item.color}
              />
            ))}
          </div>
        </AbsoluteFill>
      </GradientBackground>
    </AbsoluteFill>
  );
};
