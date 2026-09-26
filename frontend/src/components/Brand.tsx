import { Zap } from 'lucide-react';

export function Brand({ compact = false }: { compact?: boolean }) {
  return <div className={`brand ${compact ? 'brand--compact' : ''}`}>
    <span className="brand__mark"><Zap size={21} strokeWidth={2.6} /></span>
    <span><strong>VOLTWISE</strong>{!compact && <small>Electrical standards toolkit</small>}</span>
  </div>;
}
