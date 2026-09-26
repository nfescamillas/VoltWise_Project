import { ArrowRight, CheckCircle2, Search, Sparkles } from 'lucide-react';
import { CategoryIcon } from '../components/CategoryIcon';
import { TopicCard } from '../components/TopicCard';
import type { Category, DashboardStats, Standard, Topic } from '../types';

interface Props {
  categories: Category[]; standards: Standard[]; topics: Topic[]; stats: DashboardStats;
  onSearch: (query: string) => void; onCategory: (id: string) => void; onTopic: (id: string) => void;
}

export function HomePage({ categories, standards, topics, stats, onSearch, onCategory, onTopic }: Props) {
  return <>
    <section className="hero">
      <div className="hero__eyebrow"><Sparkles size={15} /> QUICK REFERENCE · OFFLINE READY</div>
      <h1>Electrical standards,<br /><span>without the friction.</span></h1>
      <p>Navigate curated IEC, NEC, and PEC guidance using the language engineers actually use in the field.</p>
      <form className="hero-search" onSubmit={(event) => { event.preventDefault(); onSearch(new FormData(event.currentTarget).get('query') as string); }}>
        <Search size={22} /><input name="query" aria-label="Search electrical topics" placeholder="Search topics, equipment, article numbers…" /><button>Search <ArrowRight size={17} /></button>
      </form>
      <div className="hero__examples"><span>Popular:</span>{['motor breaker', 'cable derating', 'generator neutral'].map((term) => <button key={term} onClick={() => onSearch(term)}>{term}</button>)}</div>
    </section>

    <section className="stats-strip">
      <div><strong>{stats.topicCount}</strong><span>Curated topics</span></div>
      <div><strong>{stats.categoryCount}</strong><span>Engineering areas</span></div>
      <div><strong>{stats.standardCount}</strong><span>Standards mapped</span></div>
      <div><strong>{stats.reviewedCount}</strong><span>Reviewed records</span></div>
    </section>

    <section className="section">
      <div className="section-heading"><div><span>EXPLORE THE LIBRARY</span><h2>Browse by engineering area</h2></div><button onClick={() => onCategory('all')}>View all topics <ArrowRight size={16} /></button></div>
      <div className="category-grid">{categories.map((category) => <button className="category-card" key={category.id} onClick={() => onCategory(category.id)} style={{ '--accent': category.accent } as React.CSSProperties}>
        <span className="category-card__icon"><CategoryIcon name={category.icon} /></span><span className="category-card__count">{category.id === 'motors' ? 10 : category.id === 'grounding' || category.id === 'conductors' ? 9 : category.id === 'industrial' ? 8 : category.id === 'transformers' ? 6 : 7} topics</span>
        <strong>{category.name}</strong><small>{category.description}</small><ArrowRight className="category-card__arrow" size={18} />
      </button>)}</div>
    </section>

    <section className="section section--soft">
      <div className="section-heading"><div><span>START HERE</span><h2>Frequently referenced</h2></div></div>
      <div className="topic-grid">{topics.map((topic) => <TopicCard key={topic.id} topic={topic} category={categories.find((c) => c.id === topic.categoryId)} onOpen={() => onTopic(topic.id)} featured />)}</div>
    </section>

    <section className="standards-callout">
      <div><span className="kicker">ONE TOPIC · THREE PERSPECTIVES</span><h2>Compare the standards that shape your work.</h2><p>See the reference, terminology, and general approach side by side—without confusing guidance for a mandatory rule.</p><div className="checks"><span><CheckCircle2 /> Edition-aware</span><span><CheckCircle2 /> Clearly classified</span><span><CheckCircle2 /> Source referenced</span></div></div>
      <div className="standard-stack">{standards.map((standard, index) => <article key={standard.id} style={{ '--shift': `${index * 8}px` } as React.CSSProperties}><b>{standard.name}</b><div><strong>{standard.fullName}</strong><span>{standard.edition}</span></div><ArrowRight size={18} /></article>)}</div>
    </section>
  </>;
}
