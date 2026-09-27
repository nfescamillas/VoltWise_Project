import { Menu, Search, TriangleAlert, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Brand } from './components/Brand';
import { Sidebar, type Page } from './components/Sidebar';
import { useService } from './hooks/useService';
import { BrowsePage } from './pages/BrowsePage';
import { CalculationRecordsPage } from './pages/CalculationRecordsPage';
import { HomePage } from './pages/HomePage';
import { StandardsPage } from './pages/StandardsPage';
import { TopicPage } from './pages/TopicPage';
import { VerificationPage } from './pages/VerificationPage';
import { toolkitService } from './services';
import type { StandardId, Topic } from './types';

export default function App() {
  const [page, setPage] = useState<Page>('home');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [standardFilter, setStandardFilter] = useState<StandardId | undefined>();
  const [query, setQuery] = useState('');
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [topic, setTopic] = useState<Topic | null>(null);
  const [related, setRelated] = useState<Topic[]>([]);
  const [mobileOpen, setMobileOpen] = useState(false);

  const { data: categories, error: categoriesError } = useService(useCallback(() => toolkitService.getCategories(), []));
  const { data: standards, error: standardsError } = useService(useCallback(() => toolkitService.getStandards(), []));
  const { data: stats, error: statsError } = useService(useCallback(() => toolkitService.getStats(), []));
  const { data: featured, error: featuredError } = useService(useCallback(() => toolkitService.getFeaturedTopics(), []));
  const { data: allTopics, error: allTopicsError } = useService(useCallback(() => toolkitService.searchTopics(''), []));
  const [browseTopics, setBrowseTopics] = useState<Topic[]>([]);
  const [browseLoading, setBrowseLoading] = useState(false);

  useEffect(() => {
    if (page !== 'browse') return;
    let active = true;
    setBrowseLoading(true);
    const timer = setTimeout(() => {
      toolkitService.searchTopics(query, {
        categoryId: selectedCategory === 'all' ? undefined : selectedCategory,
        standardId: standardFilter,
      }).then((value) => { if (active) { setBrowseTopics(value); setBrowseLoading(false); } });
    }, query ? 120 : 0);
    return () => { active = false; clearTimeout(timer); };
  }, [page, query, selectedCategory, standardFilter]);

  useEffect(() => {
    if (!selectedTopicId) { setTopic(null); setRelated([]); return; }
    let active = true;
    Promise.all([toolkitService.getTopic(selectedTopicId), toolkitService.getRelatedTopics(selectedTopicId)]).then(([nextTopic, nextRelated]) => {
      if (active) { setTopic(nextTopic); setRelated(nextRelated); window.scrollTo(0, 0); }
    });
    return () => { active = false; };
  }, [selectedTopicId]);

  const navigate = (next: Page) => {
    setPage(next); setSelectedTopicId(null); setQuery(''); setSelectedCategory('all'); setStandardFilter(undefined); setMobileOpen(false); window.scrollTo(0, 0);
  };
  const openBrowse = (categoryId = 'all') => { setPage('browse'); setSelectedTopicId(null); setSelectedCategory(categoryId); setQuery(''); setStandardFilter(undefined); window.scrollTo(0, 0); };
  const search = (value: string) => { setPage('browse'); setSelectedTopicId(null); setSelectedCategory('all'); setStandardFilter(undefined); setQuery(value.trim()); window.scrollTo(0, 0); };
  const openStandard = (id: string) => { setPage('browse'); setSelectedTopicId(null); setSelectedCategory('all'); setStandardFilter(id as StandardId); setQuery(''); window.scrollTo(0, 0); };

  const ready = categories && standards && stats && featured && allTopics;
  const startupError = categoriesError ?? standardsError ?? statsError ?? featuredError ?? allTopicsError;
  return <div className="app-shell">
    <div className={mobileOpen ? 'sidebar-wrap open' : 'sidebar-wrap'}><Sidebar page={page} onNavigate={navigate} /></div>
    {mobileOpen && <button className="mobile-scrim" aria-label="Close menu" onClick={() => setMobileOpen(false)} />}
    <header className="mobile-header"><Brand compact /><button onClick={() => setMobileOpen((v) => !v)}>{mobileOpen ? <X /> : <Menu />}</button></header>
    <div className="main-shell">
      <header className="topbar"><div className="topbar__status"><i /> PEC MODULE ACTIVE <span>·</span> SOURCE REVIEW SEP 2026</div><button onClick={() => search('')}><Search size={17} /> PEC search <kbd>⌘ K</kbd></button></header>
      <main>
        {startupError ? <ServiceError error={startupError} /> : !ready ? <Loading /> : selectedTopicId && topic ? <TopicPage key={topic.id} topic={topic} category={categories.find((c) => c.id === topic.categoryId)} related={related} onBack={() => setSelectedTopicId(null)} onTopic={setSelectedTopicId} />
          : page === 'home' ? <HomePage categories={categories} standards={standards} topics={featured} stats={stats} onSearch={search} onCategory={openBrowse} onTopic={setSelectedTopicId} />
          : page === 'browse' ? browseLoading && browseTopics.length === 0 ? <Loading /> : <BrowsePage categories={categories} topics={browseTopics} selectedCategory={selectedCategory} query={query} onQuery={setQuery} onCategory={(id) => { setSelectedCategory(id); setStandardFilter(undefined); }} onTopic={setSelectedTopicId} />
          : page === 'standards' ? <StandardsPage standards={standards} onOpen={openStandard} />
          : page === 'verification' ? <VerificationPage topics={allTopics} onTopic={setSelectedTopicId} />
          : <CalculationRecordsPage onOpen={(topicId) => { setSelectedTopicId(topicId); window.scrollTo(0, 0); }} />}
      </main>
      <footer className="app-footer"><span>© 2026 Philippine Electrical Engineering Toolkit</span><span>Original summaries only. Verify the official PEC, local rules, AHJ requirements, and professional engineering judgment.</span></footer>
    </div>
  </div>;
}

function Loading() { return <div className="loading"><span /><p>Loading the PEC toolkit…</p></div>; }

function ServiceError({ error }: { error: Error }) {
  return <section className="service-error" role="alert">
    <TriangleAlert aria-hidden="true" />
    <h2>Unable to load the PEC toolkit</h2>
    <p>Make sure the Voltwise API is running, then try again.</p>
    <code>{error.message}</code>
    <button onClick={() => window.location.reload()}>Try again</button>
  </section>;
}
