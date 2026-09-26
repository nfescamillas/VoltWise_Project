import { Bookmark, Compass, LayoutGrid, Library, Search, Settings } from 'lucide-react';
import { Brand } from './Brand';

export type Page = 'home' | 'browse' | 'standards' | 'saved';

export function Sidebar({ page, onNavigate }: { page: Page; onNavigate: (page: Page) => void }) {
  const links = [
    { id: 'home' as const, label: 'Overview', icon: Compass },
    { id: 'browse' as const, label: 'Browse topics', icon: LayoutGrid },
    { id: 'standards' as const, label: 'Standards', icon: Library },
    { id: 'saved' as const, label: 'Saved references', icon: Bookmark },
  ];
  return <aside className="sidebar">
    <Brand />
    <nav aria-label="Main navigation">
      <p>WORKSPACE</p>
      {links.map(({ id, label, icon: Icon }) => <button key={id} className={page === id ? 'active' : ''} onClick={() => onNavigate(id)}><Icon size={18} />{label}</button>)}
    </nav>
    <div className="sidebar__tip"><Search size={18} /><div><strong>Search tip</strong><span>Try “motor breaker” or “panel clearance”</span></div></div>
    <button className="sidebar__settings"><Settings size={18} />Settings</button>
    <div className="sidebar__profile"><span>NE</span><div><strong>N. Engineer</strong><small>Offline workspace</small></div></div>
  </aside>;
}
