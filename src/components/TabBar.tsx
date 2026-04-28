import './TabBar.css';

export type Tab = 'bibliotheque' | 'suggestions' | 'lecture' | 'reglages';

interface TabBarProps {
  active: Tab;
  onChange: (tab: Tab) => void;
}

const TABS: { id: Tab; label: string; glyph: JSX.Element }[] = [
  { id: 'bibliotheque', label: 'Bibliothèque', glyph: <SpinesGlyph /> },
  { id: 'suggestions', label: 'Suggestions', glyph: <TrayGlyph /> },
  { id: 'lecture', label: 'Lecture', glyph: <BookGlyph /> },
  { id: 'reglages', label: 'Réglages', glyph: <GearGlyph /> },
];

export function TabBar({ active, onChange }: TabBarProps) {
  return (
    <nav className="tabbar" role="tablist">
      {TABS.map((t) => (
        <button
          key={t.id}
          role="tab"
          aria-selected={active === t.id}
          className={`tabbar__item ${active === t.id ? 'tabbar__item--active' : ''}`}
          onClick={() => onChange(t.id)}
        >
          <span className="tabbar__glyph">{t.glyph}</span>
          <span className="tabbar__label">{t.label}</span>
        </button>
      ))}
    </nav>
  );
}

function SpinesGlyph() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1">
      <rect x="3" y="4" width="3" height="13" />
      <rect x="7" y="3" width="3" height="14" />
      <rect x="11" y="5" width="3" height="12" />
      <rect x="15" y="4" width="2" height="13" />
    </svg>
  );
}

function TrayGlyph() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1">
      <rect x="3" y="6" width="14" height="9" />
      <line x1="3" y1="11" x2="8" y2="11" />
      <line x1="12" y1="11" x2="17" y2="11" />
    </svg>
  );
}

function BookGlyph() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1">
      <path d="M3 5 L10 7 L17 5 L17 16 L10 14 L3 16 Z" />
      <line x1="10" y1="7" x2="10" y2="14" />
    </svg>
  );
}

function GearGlyph() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1">
      <circle cx="10" cy="10" r="3" />
      <path d="M10 3 L10 5 M10 15 L10 17 M3 10 L5 10 M15 10 L17 10 M5 5 L6.5 6.5 M13.5 13.5 L15 15 M5 15 L6.5 13.5 M13.5 6.5 L15 5" />
    </svg>
  );
}
