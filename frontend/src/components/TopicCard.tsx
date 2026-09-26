import { ArrowUpRight } from 'lucide-react';
import type { Category, Topic } from '../types';

export function TopicCard({ topic, category, onOpen, featured = false }: { topic: Topic; category?: Category; onOpen: () => void; featured?: boolean }) {
  return <button className={`topic-card ${featured ? 'topic-card--featured' : ''}`} onClick={onOpen}>
    <span className="topic-card__meta"><i style={{ background: category?.accent }} />{category?.shortName}</span>
    <span className="topic-card__title">{topic.title}</span>
    <span className="topic-card__description">{topic.description}</span>
    <span className="topic-card__footer">
      <span className="standard-chips">{Object.keys(topic.standards).map((id) => <em key={id}>{id.toUpperCase()}</em>)}</span>
      <ArrowUpRight size={17} />
    </span>
  </button>;
}
