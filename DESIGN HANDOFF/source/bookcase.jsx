// Étagère: visual mode. Sort: acquisition / auteur / titre. Filter: tous/lu/non-lu.

const Spine = ({ book, dim }) => {
  const T = window.TOKENS;
  const w = book.status === 'a-lire' ? 22 : (book.status === 'lu' ? 28 : 26);
  const h = Math.round(book.spineH * 240);
  return (
    <div style={{
      width: w, height: h, position: 'relative', flexShrink: 0,
      cursor: 'pointer', opacity: dim ? 0.32 : 1,
      transition: 'opacity 0.2s',
    }}>
      <div style={{
        position: 'absolute', inset: 0,
        background: book.spineColor,
        boxShadow: `inset 1.5px 0 0 rgba(255,255,255,0.08), inset -1.5px 0 0 rgba(0,0,0,0.25), 0 1px 2px rgba(0,0,0,0.3)`,
      }} />
      <div style={{ position: 'absolute', top: 8, left: 2, right: 2, height: 0.5, background: book.spineText, opacity: 0.4 }} />
      <div style={{ position: 'absolute', top: 12, left: 2, right: 2, height: 0.5, background: book.spineText, opacity: 0.4 }} />
      <div style={{ position: 'absolute', bottom: 8, left: 2, right: 2, height: 0.5, background: book.spineText, opacity: 0.4 }} />
      <div style={{ position: 'absolute', bottom: 12, left: 2, right: 2, height: 0.5, background: book.spineText, opacity: 0.4 }} />
      <div style={{
        position: 'absolute', top: 22, bottom: 22, left: 0, right: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{
          writingMode: 'vertical-rl', transform: 'rotate(180deg)',
          fontFamily: T.serif, fontStyle: 'italic',
          fontSize: w > 24 ? 11 : 10,
          color: book.spineText, letterSpacing: 0.2,
          whiteSpace: 'nowrap', overflow: 'hidden', maxHeight: h - 70,
        }}>{book.title}</div>
        <div style={{
          writingMode: 'vertical-rl', transform: 'rotate(180deg)',
          fontFamily: T.sans, fontSize: 8.5, fontWeight: 500,
          color: book.spineText, opacity: 0.75,
          letterSpacing: 1, textTransform: 'uppercase', whiteSpace: 'nowrap',
        }}>{book.author.split(' ').slice(-1)[0]}</div>
      </div>
    </div>
  );
};

const Shelf = ({ books, dimSet }) => (
  <div style={{ marginBottom: 22, position: 'relative', padding: '0 24px' }}>
    <div style={{
      display: 'flex', alignItems: 'flex-end', gap: 3,
      minHeight: 250, paddingLeft: 6, paddingRight: 6,
    }}>
      {books.map(b => <Spine key={b.n} book={b} dim={dimSet && dimSet.has(b.n) === false} />)}
    </div>
    <div style={{
      height: 8, background: 'linear-gradient(180deg, #6b5638 0%, #4a3a25 50%, #2e2418 100%)',
      boxShadow: '0 2px 4px rgba(0,0,0,0.18), inset 0 0.5px 0 rgba(255,255,255,0.18)',
      marginTop: -1,
    }} />
    <div style={{ height: 2, background: 'rgba(0,0,0,0.15)' }} />
  </div>
);

const SegControl = ({ options, value, onChange }) => {
  const T = window.TOKENS;
  return (
    <div style={{
      display: 'flex', border: `0.5px solid ${T.ruleStrong}`,
      fontFamily: T.mono, fontSize: 9, letterSpacing: 0.8,
      textTransform: 'uppercase',
    }}>
      {options.map((o, i) => (
        <div key={o.v} onClick={() => onChange(o.v)} style={{
          flex: 1, padding: '7px 6px', textAlign: 'center', cursor: 'pointer',
          background: value === o.v ? T.ink : 'transparent',
          color: value === o.v ? T.paper : T.inkSoft,
          borderLeft: i > 0 ? `0.5px solid ${T.ruleStrong}` : 'none',
        }}>{o.label}</div>
      ))}
    </div>
  );
};

const BookcaseView = () => {
  const T = window.TOKENS;
  const [sort, setSort] = React.useState('acquired');
  const [filter, setFilter] = React.useState('tous');

  // Sort all books
  const sorted = [...window.BOOKS].sort((a, b) => {
    if (sort === 'acquired') return (b.acquired || '').localeCompare(a.acquired || '');
    if (sort === 'auteur') {
      const al = a.author.split(' ').slice(-1)[0];
      const bl = b.author.split(' ').slice(-1)[0];
      return al.localeCompare(bl, 'fr');
    }
    return a.title.replace(/^L'|^Le |^La |^Les /, '').localeCompare(
      b.title.replace(/^L'|^Le |^La |^Les /, ''), 'fr'
    );
  });

  // Filter dims rather than removes — preserves visual continuity
  const dimSet = filter === 'tous' ? null : new Set(
    sorted.filter(b => filter === 'lu' ? b.status === 'lu' : b.status !== 'lu').map(b => b.n)
  );

  // Pack into shelves of N
  const PER_SHELF = 6;
  const shelves = [];
  for (let i = 0; i < sorted.length; i += PER_SHELF) shelves.push(sorted.slice(i, i + PER_SHELF));

  return (
    <window.Screen tabActive="library">
      <div style={{ height: '100%', overflow: 'auto', background: T.paper }}>
        <window.LibraryHeader mode="shelf" onToggle={() => {}} count={window.BOOKS.length} />
        <div style={{ borderTop: `0.5px solid ${T.ruleStrong}`, padding: '14px 24px 18px' }}>
          <div style={{
            fontFamily: T.mono, fontSize: 9, letterSpacing: 1.2,
            textTransform: 'uppercase', color: T.inkMute, marginBottom: 6,
          }}>Classer par</div>
          <SegControl
            value={sort}
            onChange={setSort}
            options={[
              { v: 'acquired', label: 'Acquisition' },
              { v: 'auteur',   label: 'Auteur' },
              { v: 'titre',    label: 'Titre' },
            ]}
          />
          <div style={{
            fontFamily: T.mono, fontSize: 9, letterSpacing: 1.2,
            textTransform: 'uppercase', color: T.inkMute, marginTop: 14, marginBottom: 6,
          }}>Filtrer</div>
          <SegControl
            value={filter}
            onChange={setFilter}
            options={[
              { v: 'tous',   label: 'Tous' },
              { v: 'lu',     label: 'Lus' },
              { v: 'non-lu', label: 'Non lus' },
            ]}
          />
        </div>
        <div style={{ paddingTop: 8 }}>
          {shelves.map((s, i) => <Shelf key={i} books={s} dimSet={dimSet} />)}
        </div>
        <div style={{ height: 40 }} />
      </div>
    </window.Screen>
  );
};

window.BookcaseView = BookcaseView;
window.Spine = Spine;
