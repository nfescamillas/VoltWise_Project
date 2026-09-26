import { ArrowRight, BookOpen, Globe2, MapPin } from 'lucide-react';
import type { Standard } from '../types';

const icons = { iec: Globe2, nec: BookOpen, pec: MapPin };
export function StandardsPage({ standards, onOpen }: { standards: Standard[]; onOpen: (id: string) => void }) {
  return <section className="page"><div className="page-title"><div><span>PRIMARY REFERENCES</span><h1>Standards library</h1><p>Browse the standards framework behind every curated topic.</p></div></div><div className="standards-grid">{standards.map((standard) => { const Icon = icons[standard.id]; return <button key={standard.id} onClick={() => onOpen(standard.id)}><span><Icon /></span><em>STANDARD</em><h2>{standard.name}</h2><h3>{standard.fullName}</h3><p>{standard.description}</p><footer><small>Supported: {standard.edition}</small><ArrowRight /></footer></button>; })}</div><aside className="legal-note"><BookOpen /><div><strong>Use the official publication for final decisions.</strong><p>Voltwise provides original summaries and navigation assistance. It does not replace an official standard, local regulation, authority having jurisdiction, or professional engineering judgment.</p></div></aside></section>;
}
