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
      <div className="hero__eyebrow"><Sparkles size={15} /> PEC HANDBOOK · SOURCE TRACED</div>
      <h1>Philippine electrical practice,<br /><span>made usable.</span></h1>
      <p>Work through PEC requirements with formulas, engineering tables, original diagrams, examples, and traceable source locations.</p>
      <form className="hero-search" onSubmit={(event) => { event.preventDefault(); onSearch(new FormData(event.currentTarget).get('query') as string); }}>
        <Search size={22} /><input name="query" aria-label="Search electrical topics" placeholder="Search topics, equipment, article numbers…" /><button>Search <ArrowRight size={17} /></button>
      </form>
      <div className="hero__examples"><span>Popular:</span>{['motor breaker', 'cable derating', 'generator neutral'].map((term) => <button key={term} onClick={() => onSearch(term)}>{term}</button>)}</div>
    </section>

    <section className="stats-strip">
      <div><strong>{stats.topicCount}</strong><span>Curated topics</span></div>
      <div><strong>{stats.categoryCount}</strong><span>Engineering areas</span></div>
      <div><strong>{stats.standardCount}</strong><span>Source families</span></div>
      <div><strong>{stats.reviewedCount}/{stats.topicCount}</strong><span>Edition-verified</span></div>
    </section>

    <section className="phase-progress" aria-label="First development phase progress">
      <div><span>PEC HANDBOOK BUILD</span><strong>{stats.topicCount} handbook chapters structured</strong><p>Every published chapter contains formulas, engineering tables, original figures, worked examples, workflows, exceptions, and traceable PEC source locations.</p></div>
      <div className="phase-progress__status"><b>CONTENT MODEL <em>COMPLETE</em></b><b>CLAUSE LOCATIONS <em>CHECKED</em></b><b>PEC EDITION IDENTITY <em className="pending">NEEDS VERIFICATION</em></b></div>
    </section>

    <section className="section">
      <div className="section-heading"><div><span>EXPLORE THE LIBRARY</span><h2>Browse by engineering area</h2></div><button onClick={() => onCategory('all')}>View all topics <ArrowRight size={16} /></button></div>
      <div className="category-grid">{categories.map((category) => <button className="category-card" key={category.id} onClick={() => onCategory(category.id)} style={{ '--accent': category.accent } as React.CSSProperties}>
        <span className="category-card__icon"><CategoryIcon name={category.icon} /></span><span className="category-card__count">PEC AREA</span>
        <strong>{category.name}</strong><small>{category.description}</small><ArrowRight className="category-card__arrow" size={18} />
      </button>)}</div>
    </section>

    <section className="section section--soft">
      <div className="section-heading"><div><span>PEC HANDBOOK SET</span><h2>PEC engineering chapters</h2><p className="section-heading__note">The first 12 targets and the next equipment batch are structured as engineering toolkit pages. “Toolkit complete” describes content depth; “edition check” remains visible until the supplied PEC edition identity is independently confirmed.</p></div></div>
      <div className="topic-grid">{topics.map((topic) => <TopicCard key={topic.id} topic={topic} category={categories.find((c) => c.id === topic.categoryId)} onOpen={() => onTopic(topic.id)} featured />)}</div>
    </section>

    <section className="standards-callout">
      <div><span className="kicker">THREE DISTINCT SOURCE FAMILIES</span><h2>PEC active. Distribution and Grid planned.</h2><p>Installation, distribution-interface, and transmission/grid requirements govern different parts of a project. This phase develops PEC only.</p><div className="checks"><span><CheckCircle2 /> Original summaries</span><span><CheckCircle2 /> Requirement vs recommendation</span><span><CheckCircle2 /> Source traced</span></div></div>
      <div className="standard-stack">{standards.map((standard, index) => <article key={standard.id} style={{ '--shift': `${index * 8}px` } as React.CSSProperties}><b>{standard.name}</b><div><strong>{standard.fullName}</strong><span>{standard.status.toUpperCase()}</span></div><ArrowRight size={18} /></article>)}</div>
    </section>
  </>;
}
