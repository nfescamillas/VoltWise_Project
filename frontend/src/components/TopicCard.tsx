import { ArrowUpRight } from 'lucide-react';
import type { Category, Topic } from '../types';

export function TopicCard({ topic, category, onOpen, featured = false }: { topic: Topic; category?: Category; onOpen: () => void; featured?: boolean }) {
  const pec = topic.standards.pec;
  const fullToolkit = Boolean(pec?.formulas?.length && pec?.tables?.length && pec?.figures?.length && pec?.examples?.length);
  return <button className={`topic-card ${featured ? 'topic-card--featured' : ''}`} onClick={onOpen}>
    <span className="topic-card__meta"><i style={{ background: category?.accent }} />{category?.shortName}<b className={fullToolkit ? 'content-badge content-badge--full' : 'content-badge'}>{fullToolkit ? 'TOOLKIT COMPLETE' : 'CONTENT INCOMPLETE'}</b></span>
    <span className="topic-card__title">{topic.title}</span>
    <span className="topic-card__description">{topic.description}</span>
    <span className="topic-card__footer">
      <span className="standard-chips">{Object.keys(topic.standards).map((id) => <em key={id}>{id.toUpperCase()}</em>)}{fullToolkit && <em>FORMULAS</em>}{fullToolkit && <em>TABLES</em>}{topic.reviewStatus === 'Needs verification' && <em className="standard-chip--pending">EDITION CHECK</em>}</span>
      <ArrowUpRight size={17} />
    </span>
  </button>;
}
