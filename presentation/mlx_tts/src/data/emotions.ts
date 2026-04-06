export interface Emotion {
  id: string;
  label: string;
  labelZh: string;
  emoji: string;
  speed: number;
  color: string;
}

export const emotions: Emotion[] = [
  { id: "neutral", label: "Neutral", labelZh: "中性", emoji: "😐", speed: 1.0, color: "#7c8098" },
  { id: "happy", label: "Happy", labelZh: "開心", emoji: "😊", speed: 1.05, color: "#4ade80" },
  { id: "excited", label: "Excited", labelZh: "興奮", emoji: "🤩", speed: 1.1, color: "#fbbf24" },
  { id: "sad", label: "Sad", labelZh: "悲傷", emoji: "😢", speed: 0.9, color: "#60a5fa" },
  { id: "calm", label: "Calm", labelZh: "平靜", emoji: "😌", speed: 0.95, color: "#a78bfa" },
  { id: "serious", label: "Serious", labelZh: "嚴肅", emoji: "😐", speed: 0.92, color: "#f87171" },
  { id: "whispery", label: "Whispery", labelZh: "輕聲", emoji: "🤫", speed: 0.85, color: "#c4b5fd" },
  { id: "storytelling", label: "Storytelling", labelZh: "說書", emoji: "📖", speed: 0.98, color: "#7c6af7" },
];
