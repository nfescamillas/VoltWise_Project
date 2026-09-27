import { ClipboardList, Compass, LayoutGrid, Library, Search, Settings, ShieldCheck } from 'lucide-react';
import { Brand } from './Brand';

export type Page = 'home' | 'browse' | 'standards' | 'verification' | 'saved';

export function Sidebar({ page, onNavigate }: { page: Page; onNavigate: (page: Page) => void }) {
  const links = [
    { id: 'home' as const, label: 'Overview', icon: Compass },
    { id: 'browse' as const, label: 'Browse topics', icon: LayoutGrid },
    { id: 'standards' as const, label: 'Source families', icon: Library },
    { id: 'verification' as const, label: 'Verification workspace', icon: ShieldCheck },
    { id: 'saved' as const, label: 'Calculation records', icon: ClipboardList },
  ];
  return <aside className="sidebar">
    <Brand />
    <nav aria-label="Main navigation">
      <p>PHILIPPINE TOOLKIT</p>
      {links.map(({ id, label, icon: Icon }) => <button key={id} className={page === id ? 'active' : ''} onClick={() => onNavigate(id)}><Icon size={18} />{label}</button>)}
    </nav>
    <div className="sidebar__tip"><Search size={18} /><div><strong>PEC search</strong><span>Try “motor breaker” or “generator neutral”</span></div></div>
    <button className="sidebar__settings"><Settings size={18} />Settings</button>
    <div className="sidebar__profile"><span>NE</span><div><strong>N. Engineer</strong><small>Offline workspace</small></div></div>
  </aside>;
}
