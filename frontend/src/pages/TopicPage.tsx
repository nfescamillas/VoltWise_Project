import { ArrowLeft, ArrowRight, Bookmark, CalendarDays, CheckCircle2, Info, TriangleAlert } from 'lucide-react';
import { useState } from 'react';
import type { Category, StandardId, Topic } from '../types';

export function TopicPage({ topic, category, related, onBack, onTopic }: { topic: Topic; category?: Category; related: Topic[]; onBack: () => void; onTopic: (id: string) => void }) {
  const available = Object.keys(topic.standards) as StandardId[];
  const [active, setActive] = useState<StandardId>(available.includes('nec') ? 'nec' : available[0]);
  const content = topic.standards[active]!;
  return <section className="topic-page">
    <button className="back-link" onClick={onBack}><ArrowLeft size={16} /> Back to library</button>
    <header className="topic-header"><div><span className="topic-header__category"><i style={{ background: category?.accent }} />{category?.name}</span><h1>{topic.title}</h1><p>{topic.description}</p></div><button className="save-button"><Bookmark size={18} /> Save reference</button></header>
    <div className="topic-meta"><span><CheckCircle2 /> {topic.reviewStatus}</span><span><CalendarDays /> Reviewed {new Date(topic.lastReviewed + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span><span>{topic.sourceStatus}</span></div>
    <div className="standard-tabs" role="tablist">{available.map((id) => <button key={id} className={active === id ? 'active' : ''} onClick={() => setActive(id)}><strong>{id.toUpperCase()}</strong><small>{topic.standards[id]?.edition}</small></button>)}</div>
    <div className="topic-layout"><main>
      <article className="reference-banner"><span>OFFICIAL REFERENCE</span><strong>{content.reference}</strong><small>{active.toUpperCase()} · {content.edition}</small></article>
      <ContentSection label="REQUIREMENT" title="What the standard generally requires" className="requirement"><p>{content.summary}</p><ul>{content.requirements.map((item) => <li key={item}><CheckCircle2 />{item}</li>)}</ul></ContentSection>
      <ContentSection label="ENGINEERING EXPLANATION" title="How to interpret this in practice" className="explanation"><p>{topic.engineeringExplanation}</p></ContentSection>
      <ContentSection label="ENGINEERING NOTES" title="Practical design context" className="notes"><ul>{topic.engineeringNotes.map((item) => <li key={item}><Info />{item}</li>)}</ul></ContentSection>
      <ContentSection label="COMMON MISTAKES" title="Watch for these pitfalls" className="mistakes"><ul>{topic.commonMistakes.map((item) => <li key={item}><TriangleAlert />{item}</li>)}</ul></ContentSection>
    </main><aside className="topic-aside"><div><span>ON THIS PAGE</span>{['Official reference', 'Requirement summary', 'Engineering explanation', 'Engineering notes', 'Common mistakes'].map((item) => <a key={item}>{item}</a>)}</div><div><span>RELATED TOPICS</span>{related.map((item) => <button key={item.id} onClick={() => onTopic(item.id)}>{item.title}<ArrowRight /></button>)}</div></aside></div>
  </section>;
}

function ContentSection({ label, title, className, children }: { label: string; title: string; className: string; children: React.ReactNode }) {
  return <article className={`content-section ${className}`}><span>{label}</span><h2>{title}</h2>{children}</article>;
}
