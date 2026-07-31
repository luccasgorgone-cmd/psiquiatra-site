import {
  Brain,
  Wind,
  CloudRain,
  Activity,
  Moon,
  HeartPulse,
  Zap,
  BatteryLow,
  Leaf,
  Sparkles,
  type LucideProps,
} from "lucide-react";

const MAP: Record<string, React.ComponentType<LucideProps>> = {
  brain: Brain,
  wind: Wind,
  "cloud-rain": CloudRain,
  activity: Activity,
  moon: Moon,
  "heart-pulse": HeartPulse,
  zap: Zap,
  "battery-low": BatteryLow,
  leaf: Leaf,
};

export default function Icon({ name, ...props }: { name: string } & LucideProps) {
  const Cmp = MAP[name] || Sparkles;
  return <Cmp {...props} />;
}
