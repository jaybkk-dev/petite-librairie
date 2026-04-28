// Book detail card

const BookDetail = ({ book }) => {
  const T = window.TOKENS;
  const passages = [
    { p: 124, q: "Une heure n'est pas qu'une heure, c'est un vase rempli de parfums, de sons, de projets et de climats." },
    { p: 248, q: "Le seul véritable voyage, le seul bain de Jouvence, ce ne serait pas d'aller vers de nouveaux paysages." },
    { p: 412, q: "Nos désirs vont coupant l'un sur l'autre, et dans cette confusion de l'existence, il est rare qu'un bonheur vienne précisément se poser sur le désir qui l'avait réclamé." },
  ];
  return (
    <window.Screen tabActive="library">
      <div style={{ height: '100%', overflow: 'auto' }}>
        {/* Header strip */}
        <div style={{
          padding: '16px 24px 12px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          borderBottom: `0.5px solid ${T.rule}`,
        }}>
          <div style={{
            fontFamily: T.mono, fontSize: 10, color: T.inkMute,
            letterSpacing: 0.8,
          }}>← Bibliothèque</div>
          <div style={{
            fontFamily: T.mono, fontSize: 10, color: T.inkFaint,
            letterSpacing: 0.8,
          }}>{book.n} / {String(window.BOOKS.length).padStart(2, '0')}</div>
        </div>

        {/* Title block */}
        <div style={{ padding: '32px 28px 24px' }}>
          <div style={{
            fontFamily: T.mono, fontSize: 9, letterSpacing: 1.4,
            textTransform: 'uppercase', color: T.inkMute, marginBottom: 14,
          }}>Fiche</div>
          {/* Author as link to French Wikipedia */}
          <div style={{
            fontFamily: T.sans, fontSize: 14, color: T.accent,
            textDecoration: 'underline', textUnderlineOffset: 3,
            textDecorationThickness: '0.5px', marginBottom: 10,
            display: 'inline-flex', alignItems: 'center', gap: 4,
          }}>
            {book.author}
            <svg width="9" height="9" viewBox="0 0 9 9" fill="none" stroke="currentColor" strokeWidth="1"><path d="M3 1h5v5M8 1L1 8"/></svg>
          </div>
          <div style={{
            fontFamily: T.serif, fontStyle: 'italic',
            fontSize: 32, lineHeight: 1.1, color: T.ink,
            letterSpacing: -0.4, marginBottom: 10,
            textWrap: 'pretty',
          }}>{book.title}</div>
          <div style={{
            fontFamily: T.mono, fontSize: 11, color: T.inkMute,
            letterSpacing: 0.5,
          }}>{book.year} · {book.source || '—'}</div>
        </div>

        {/* Status & dates table */}
        <div style={{
          margin: '0 24px', borderTop: `0.5px solid ${T.ruleStrong}`,
          borderBottom: `0.5px solid ${T.ruleStrong}`,
        }}>
          {[
            ['Statut', <window.StatusBadge status={book.status} />],
            ['Commencé', book.start || '—'],
            ['Terminé', book.end || '—'],
          ].map(([k, v], i, a) => (
            <div key={k} style={{
              display: 'flex', justifyContent: 'space-between',
              padding: '12px 0',
              borderBottom: i < a.length - 1 ? `0.5px solid ${T.rule}` : 'none',
              fontFamily: T.sans, fontSize: 13,
            }}>
              <span style={{
                fontFamily: T.mono, fontSize: 9.5, letterSpacing: 1,
                textTransform: 'uppercase', color: T.inkMute,
                paddingTop: 2,
              }}>{k}</span>
              <span style={{ color: T.ink, fontFamily: typeof v === 'string' ? T.mono : 'inherit', fontSize: typeof v === 'string' ? 11 : 13 }}>{v}</span>
            </div>
          ))}
        </div>

        {/* Notes */}
        <div style={{ padding: '28px 24px 8px' }}>
          <div style={{
            fontFamily: T.mono, fontSize: 9, letterSpacing: 1.4,
            textTransform: 'uppercase', color: T.inkMute, marginBottom: 10,
          }}>Notes</div>
          <div style={{
            fontFamily: T.serif, fontSize: 16, lineHeight: 1.5,
            color: T.inkSoft,
          }}>{book.note || 'Saisir une note…'}</div>
        </div>

        {/* Saved passages */}
        <div style={{ padding: '24px 24px 8px' }}>
          <div style={{
            fontFamily: T.mono, fontSize: 9, letterSpacing: 1.4,
            textTransform: 'uppercase', color: T.inkMute, marginBottom: 14,
            display: 'flex', justifyContent: 'space-between',
          }}>
            <span>Passages</span>
            <span style={{ color: T.inkFaint }}>{passages.length}</span>
          </div>
          {passages.map((p, i) => (
            <div key={i} style={{
              borderLeft: `1px solid ${T.accent}`,
              paddingLeft: 14, marginBottom: 18,
            }}>
              <div style={{
                fontFamily: T.serif, fontSize: 15, lineHeight: 1.45,
                color: T.ink, fontStyle: 'italic', marginBottom: 6,
                textWrap: 'pretty',
              }}>« {p.q} »</div>
              <div style={{
                fontFamily: T.mono, fontSize: 9.5, color: T.inkMute,
                letterSpacing: 0.6,
              }}>p. {p.p}</div>
            </div>
          ))}
        </div>

        {/* Acquisition block */}
        <div style={{
          margin: '20px 24px 0', padding: '20px 0 0',
          borderTop: `0.5px solid ${T.ruleStrong}`,
        }}>
          <div style={{
            fontFamily: T.mono, fontSize: 9, letterSpacing: 1.4,
            textTransform: 'uppercase', color: T.inkMute, marginBottom: 14,
          }}>Acquisition</div>
          <div style={{
            display: 'grid', gridTemplateColumns: 'auto 1fr',
            rowGap: 8, columnGap: 18,
            fontFamily: T.sans, fontSize: 12.5,
          }}>
            {[
              ['Plateforme', 'Vivlio (FNAC)'],
              ['Prix', '12,99 €'],
              ['DRM', 'Adobe ADEPT'],
              ['Bangkok', 'Disponible — VPN non requis'],
            ].map(([k, v]) => (
              <React.Fragment key={k}>
                <span style={{
                  fontFamily: T.mono, fontSize: 9.5, letterSpacing: 1,
                  textTransform: 'uppercase', color: T.inkMute,
                  paddingTop: 2,
                }}>{k}</span>
                <span style={{ color: T.ink }}>{v}</span>
              </React.Fragment>
            ))}
          </div>

          <div style={{
            marginTop: 18, padding: '14px 16px',
            background: T.ink, color: T.paper,
            fontFamily: T.mono, fontSize: 11, letterSpacing: 1,
            textTransform: 'uppercase', textAlign: 'center', cursor: 'pointer',
          }}>Acheter sur Vivlio →</div>

          {/* Shareable message */}
          <div style={{ marginTop: 22 }}>
            <div style={{
              fontFamily: T.mono, fontSize: 9, letterSpacing: 1.4,
              textTransform: 'uppercase', color: T.inkMute, marginBottom: 10,
            }}>Message à transférer</div>
            <div style={{
              border: `0.5px solid ${T.ruleStrong}`,
              padding: '14px 16px',
              fontFamily: T.serif, fontSize: 14, lineHeight: 1.5,
              color: T.inkSoft, fontStyle: 'italic',
              background: 'rgba(26,22,18,0.025)',
            }}>
              « Si jamais l'envie te prenait d'offrir un livre — voici le lien
              Vivlio pour {book.title}, de {book.author}. 12,99 €, sans VPN.
              Le epub arrive directement dans ma bibliothèque. »
            </div>
            <div style={{
              display: 'flex', gap: 10, marginTop: 12,
              fontFamily: T.mono, fontSize: 10, letterSpacing: 1,
              textTransform: 'uppercase',
            }}>
              <div style={{ flex: 1, padding: '10px 0', textAlign: 'center', border: `0.5px solid ${T.ruleStrong}`, color: T.inkSoft, cursor: 'pointer' }}>Copier</div>
              <div style={{ flex: 1, padding: '10px 0', textAlign: 'center', border: `0.5px solid ${T.ruleStrong}`, color: T.inkSoft, cursor: 'pointer' }}>Partager</div>
            </div>
          </div>
        </div>

        <div style={{ height: 40 }} />
      </div>
    </window.Screen>
  );
};

window.BookDetail = BookDetail;
