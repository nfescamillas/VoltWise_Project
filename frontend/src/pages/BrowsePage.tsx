import { ChevronRight, Search, SlidersHorizontal } from 'lucide-react';
import { CategoryIcon } from '../components/CategoryIcon';
import { TopicCard } from '../components/TopicCard';
import type { Category, Topic } from '../types';

export function BrowsePage({ categories, topics, selectedCategory, query, onQuery, onCategory, onTopic }: { categories: Category[]; topics: Topic[]; selectedCategory: string; query: string; onQuery: (v: string) => void; onCategory: (id: string) => void; onTopic: (id: string) => void }) {
  const label = selectedCategory === 'all' ? 'All topics' : categories.find((c) => c.id === selectedCategory)?.name;
  return <section className="page">
    <div className="breadcrumbs"><span>Library</span><ChevronRight size={14} /><strong>{label}</strong></div>
    <div className="page-title"><div><span>REFERENCE LIBRARY</span><h1>{query ? `Results for “${query}”` : label}</h1><p>{query ? `${topics.length} relevant records across the standards library.` : 'Browse curated guidance organized around practical engineering work.'}</p></div><div className="page-title__count"><strong>{topics.length}</strong><span>topics</span></div></div>
    <div className="browse-tools"><label><Search size={18} /><input value={query} onChange={(e) => onQuery(e.target.value)} placeholder="Filter this library…" /></label><button><SlidersHorizontal size={17} /> Filters</button></div>
    <div className="browse-layout"><aside className="category-filter"><button className={selectedCategory === 'all' ? 'active' : ''} onClick={() => onCategory('all')}>All engineering areas <span>63</span></button>{categories.map((category) => <button key={category.id} className={selectedCategory === category.id ? 'active' : ''} onClick={() => onCategory(category.id)}><CategoryIcon name={category.icon} size={17} />{category.shortName}</button>)}</aside>
      <div>{topics.length ? <div className="topic-grid topic-grid--browse">{topics.map((topic) => <TopicCard key={topic.id} topic={topic} category={categories.find((c) => c.id === topic.categoryId)} onOpen={() => onTopic(topic.id)} />)}</div> : <div className="empty-state"><Search size={30} /><h3>No matching topics</h3><p>Try a broader engineering term or clear the category filter.</p><button onClick={() => onQuery('')}>Clear search</button></div>}</div>
    </div>
  </section>;
}
