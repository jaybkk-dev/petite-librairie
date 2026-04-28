// Library: scrollable list of books, with header toggle (List ⇄ Bookcase),
// and inline expand showing justification + notes.

const StatusBadge = ({ status }) => {
  const T = window.TOKENS;
  const s = window.STATUS[status];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      fontFamily: T.mono, fontSize: 9.5, letterSpacing: 0.8,
      textTransform: 'uppercase', color: T.inkSoft,
      whiteSpace: 'nowrap',
    }}>
      <span style={{
        width: 6, height: 6, borderRadius: 3,
        background: s.dot, border: status === 'abandonne' ? `1px solid ${T.inkMute}` : 'none',
      }} />
      {s.label}
    </span>
  );
};

const LibraryRow = ({ book, expanded, onToggle }) => {
  const T = window.TOKENS;
  const s = window.STATUS[book.status];
  return (
    <div style={{ borderBottom: `0.5px solid ${T.rule}` }}>
      <div onClick={onToggle} style={{
        display: 'flex', alignItems: 'baseline', gap: 14,
        padding: '20px 24px 18px', cursor: 'pointer',
      }}>
        <span style={{
          fontFamily: T.mono, fontSize: 11, color: T.inkFaint,
          minWidth: 22, paddingTop: 4, fontWeight: 400,
        }}>{book.n}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontFamily: T.serif, fontStyle: 'italic',
            fontSize: 21, lineHeight: 1.15, color: T.ink,
            textDecoration: s.strike ? 'line-through' : 'none',
            textDecorationColor: T.inkMute,
            letterSpacing: -0.1,
            marginBottom: 4,
          }}>{book.title}</div>
          <div style={{
            fontFamily: T.sans, fontSize: 13, color: T.inkSoft,
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <span>{book.author}</span>
            <span style={{ color: T.inkFaint }}>·</span>
            <span style={{ fontFamily: T.mono, fontSize: 11, color: T.inkMute }}>{book.year}</span>
          </div>
        </div>
        <StatusBadge status={book.status} />
      </div>
      {expanded && (
        <div style={{
          padding: '0 24px 22px 60px',
          background: 'rgba(26,22,18,0.025)',
          borderTop: `0.5px dashed ${T.rule}`,
          paddingTop: 16,
        }}>
          {book.justif && (
            <div style={{ marginBottom: 14 }}>
              <div style={{
                fontFamily: T.mono, fontSize: 9, letterSpacing: 0.8,
                textTransform: 'uppercase', color: T.inkMute, marginBottom: 6,
              }}>Pourquoi</div>
              <div style={{
                fontFamily: T.serif, fontSize: 16, lineHeight: 1.4,
                color: T.inkSoft, fontStyle: 'italic',
              }}>{book.justif}</div>
            </div>
          )}
          <div>
            <div style={{
              fontFamily: T.mono, fontSize: 9, letterSpacing: 0.8,
              textTransform: 'uppercase', color: T.inkMute, marginBottom: 6,
            }}>Notes</div>
            <div style={{
              fontFamily: T.serif, fontSize: 15, lineHeight: 1.45,
              color: book.note ? T.ink : T.inkFaint,
              minHeight: 22,
              borderBottom: `0.5px solid ${T.ruleStrong}`,
              paddingBottom: 6,
            }}>
              {book.note || 'Saisir une note…'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const LibraryHeader = ({ mode = 'list', onToggle, count }) => {
  const T = window.TOKENS;
  return (
    <div style={{ padding: '20px 24px 18px' }}>
      {/* Logo lockup — left aligned, ink on paper */}
      <div style={{
        display: 'inline-flex', flexDirection: 'column', alignItems: 'flex-start',
        lineHeight: 1, color: T.ink, marginBottom: 14,
      }}>
        <div style={{
          fontFamily: T.serif, fontWeight: 500, fontStyle: 'normal',
          fontSize: 11, letterSpacing: -0.2, marginBottom: 1,
        }}>La petite</div>
        <div style={{
          fontFamily: T.sans, fontWeight: 800, textTransform: 'uppercase',
          fontSize: 10, letterSpacing: 2.4,
        }}>LIBRAIRIE</div>
      </div>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
        marginBottom: 12,
      }}>
        <div style={{
          fontFamily: T.serif, fontStyle: 'normal', fontSize: 32, lineHeight: 1, color: T.ink,
          letterSpacing: -0.5,
        }}>Bibliothèque</div>
        <div style={{
          fontFamily: T.mono, fontSize: 10, color: T.inkMute,
          letterSpacing: 0.5,
        }}>{String(count).padStart(3, '0')} ouvrages</div>
      </div>
      {/* Toggle */}
      <div style={{
        display: 'flex', border: `0.5px solid ${T.ruleStrong}`,
        marginTop: 14, fontFamily: T.mono, fontSize: 10,
        letterSpacing: 1, textTransform: 'uppercase',
      }}>
        <div onClick={() => onToggle('list')} style={{
          flex: 1, padding: '9px 0', textAlign: 'center', cursor: 'pointer',
          background: mode === 'list' ? T.ink : 'transparent',
          color: mode === 'list' ? T.paper : T.inkSoft,
        }}>Liste</div>
        <div onClick={() => onToggle('shelf')} style={{
          flex: 1, padding: '9px 0', textAlign: 'center', cursor: 'pointer',
          background: mode === 'shelf' ? T.ink : 'transparent',
          color: mode === 'shelf' ? T.paper : T.inkSoft,
          borderLeft: `0.5px solid ${T.ruleStrong}`,
        }}>Étagère</div>
      </div>
    </div>
  );
};

const LibraryView = ({ initialExpanded = null }) => {
  const T = window.TOKENS;
  const [expanded, setExpanded] = React.useState(initialExpanded);
  return (
    <window.Screen tabActive="library">
      <div style={{ height: '100%', overflow: 'auto' }}>
        <LibraryHeader mode="list" onToggle={() => {}} count={window.BOOKS.length} />
        <div style={{ borderTop: `0.5px solid ${T.ruleStrong}` }}>
          {window.BOOKS.map(b => (
            <LibraryRow key={b.n} book={b}
              expanded={expanded === b.n}
              onToggle={() => setExpanded(expanded === b.n ? null : b.n)} />
          ))}
        </div>
        <div style={{ height: 40 }} />
      </div>
    </window.Screen>
  );
};

window.LibraryView = LibraryView;
window.LibraryHeader = LibraryHeader;
window.StatusBadge = StatusBadge;
