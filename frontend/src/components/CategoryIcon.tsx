import { Cable, CircleGauge, Factory, GitBranch, PanelsTopLeft, ShieldCheck, Waves, Zap } from 'lucide-react';

const icons = { cable: Cable, shield: ShieldCheck, ground: GitBranch, motor: CircleGauge, transformer: Waves, generator: Zap, panel: PanelsTopLeft, factory: Factory };

export function CategoryIcon({ name, size = 22 }: { name: string; size?: number }) {
  const Icon = icons[name as keyof typeof icons] ?? Zap;
  return <Icon size={size} strokeWidth={1.8} />;
}
