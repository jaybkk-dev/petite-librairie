// Shared chrome: tab bar, status bar shim, screen wrapper

const TabBar = ({ active = 'library' }) => {
  const T = window.TOKENS;
  const tabs = [
    { id: 'library',  label: 'Bibliothèque', icon: (c) => (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke={c} strokeWidth="1.4">
        <path d="M4 3v16M7 3v16M10 3v16M14 4l4 15M16 4l4 15"/>
      </svg>) },
    { id: 'inbox',    label: 'Suggestions', icon: (c) => (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke={c} strokeWidth="1.4">
        <path d="M3 5h16v12H3z M3 12h5l1 2h4l1-2h5"/>
      </svg>) },
    { id: 'reader',   label: 'Lecture', icon: (c) => (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke={c} strokeWidth="1.4">
        <path d="M2 5c3-1 6-1 9 1v13c-3-2-6-2-9-1zM20 5c-3-1-6-1-9 1v13c3-2 6-2 9-1z"/>
      </svg>) },
    { id: 'settings', label: 'Réglages', icon: (c) => (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke={c} strokeWidth="1.4">
        <circle cx="11" cy="11" r="3"/>
        <path d="M11 2v3M11 17v3M2 11h3M17 11h3M4.5 4.5l2 2M15.5 15.5l2 2M17.5 4.5l-2 2M6.5 15.5l-2 2"/>
      </svg>) },
  ];
  return (
    <div style={{
      position: 'absolute', left: 0, right: 0, bottom: 0,
      paddingBottom: 30, paddingTop: 10, paddingLeft: 8, paddingRight: 8,
      background: T.paper,
      borderTop: `0.5px solid ${T.rule}`,
      display: 'flex', justifyContent: 'space-around', alignItems: 'flex-end',
      fontFamily: T.sans, zIndex: 30,
    }}>
      {tabs.map(t => {
        const on = t.id === active;
        const c = on ? T.accent : T.inkMute;
        return (
          <div key={t.id} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
            flex: 1, padding: '4px 0',
          }}>
            {t.icon(c)}
            <div style={{
              fontSize: 10, color: c, letterSpacing: 0.4,
              textTransform: 'uppercase', fontWeight: on ? 600 : 400,
            }}>{t.label}</div>
          </div>
        );
      })}
    </div>
  );
};

// Minimal status bar (small, our own — not the iOS starter, since we want
// dark text on the cream paper)
const StatusBar = ({ time = '8:14', dark = false }) => {
  const T = window.TOKENS;
  const c = dark ? '#f4efe6' : T.ink;
  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0, height: 54,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '18px 32px 0', fontFamily: T.sans, fontWeight: 600,
      fontSize: 15, color: c, zIndex: 25, pointerEvents: 'none',
    }}>
      <span>{time}</span>
      <span style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
        <svg width="17" height="11" viewBox="0 0 17 11"><path d="M8.5 2.5c2.2 0 4.2.8 5.7 2.2l1-1A8.6 8.6 0 008.5.5 8.6 8.6 0 002.3 3.7l1 1A8 8 0 018.5 2.5z M8.5 6c1.3 0 2.5.5 3.4 1.4l1-1a6 6 0 00-4.4-1.9 6 6 0 00-4.4 1.9l1 1A4.7 4.7 0 018.5 6z" fill={c}/><circle cx="8.5" cy="9.5" r="1.4" fill={c}/></svg>
        <svg width="24" height="11" viewBox="0 0 24 11"><rect x="0.5" y="0.5" width="20" height="10" rx="2.5" stroke={c} strokeOpacity="0.4" fill="none"/><rect x="2" y="2" width="17" height="7" rx="1.2" fill={c}/><path d="M22 4v3c.6-.2 1-.7 1-1.5S22.6 4.2 22 4z" fill={c} opacity="0.5"/></svg>
      </span>
    </div>
  );
};

// Frame for one screen — paper bg, status bar, content slot, optional tab bar
const Screen = ({ children, dark = false, tabActive = 'library', noTabs = false, statusTime = '8:14' }) => {
  const T = window.TOKENS;
  return (
    <div style={{
      width: 390, height: 844, position: 'relative', overflow: 'hidden',
      background: dark ? '#0f0c08' : T.paper,
      fontFamily: T.sans, color: T.ink,
    }}>
      <StatusBar time={statusTime} dark={dark} />
      <div style={{ position: 'absolute', top: 54, left: 0, right: 0, bottom: noTabs ? 0 : 84, overflow: 'hidden' }}>
        {children}
      </div>
      {!noTabs && <TabBar active={tabActive} />}
    </div>
  );
};

window.TabBar = TabBar;
window.StatusBar = StatusBar;
window.Screen = Screen;
