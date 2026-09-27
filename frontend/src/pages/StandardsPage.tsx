import { ArrowRight, BookOpen, Building2, MapPin, Network } from 'lucide-react';
import type { Standard, StandardId } from '../types';

const icons: Record<StandardId, typeof MapPin> = { pec: Building2, pdc: Network, pgc: MapPin };

export function StandardsPage({ standards, onOpen }: { standards: Standard[]; onOpen: (id: string) => void }) {
  return <section className="page">
    <div className="page-title"><div><span>PHILIPPINE SOURCE FAMILIES</span><h1>One toolkit, three distinct roles</h1><p>PEC governs facility and installation work. PDC and PGC are future modules for distribution and transmission/grid interfaces; they are not comparison columns.</p></div></div>
    <div className="standards-grid">{standards.map((standard) => { const Icon = icons[standard.id]; const active = standard.status === 'active'; return <button key={standard.id} onClick={() => active && onOpen(standard.id)} disabled={!active} className={`source-card source-card--${standard.status}`}>
      <span><Icon /></span><em>{standard.status.toUpperCase()}</em><h2>{standard.name}</h2><h3>{standard.fullName}</h3><p>{standard.description}</p><footer><small>{active ? standard.edition : 'Future module - no technical placeholders'}</small>{active && <ArrowRight />}</footer>
    </button>; })}</div>
    <aside className="legal-note"><BookOpen /><div><strong>Use the official publication for final decisions.</strong><p>This toolkit provides original summaries, calculations, and navigation assistance. It does not replace the official PEC, local rules, the authority having jurisdiction, or professional engineering judgment.</p></div></aside>
  </section>;
}
