// Reader: full-screen epub. Selection -> floating "Sauvegarder le passage".

const ReaderView = ({ night = false, fontSize = 19, withSelection = true }) => {
  const T = window.TOKENS;
  const bg = night ? '#0f0c08' : T.paper;
  const fg = night ? '#d4c5a8' : T.ink;
  const fgSoft = night ? '#8a7d65' : T.inkSoft;
  const fgMute = night ? '#5a5040' : T.inkMute;

  return (
    <window.Screen tabActive="reader" dark={night} noTabs>
      <div style={{ height: '100%', position: 'relative', background: bg, color: fg }}>
        {/* Top chrome — book title + controls, very minimal */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0,
          padding: '6px 24px 10px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          fontFamily: T.mono, fontSize: 9.5, letterSpacing: 1.2,
          textTransform: 'uppercase', color: fgMute,
          borderBottom: `0.5px solid ${night ? 'rgba(255,255,255,0.08)' : T.rule}`,
        }}>
          <span style={{ color: fgMute, fontSize: 14 }}>←</span>
          <span style={{
            fontFamily: T.serif, fontStyle: 'italic',
            fontSize: 13, textTransform: 'none', letterSpacing: 0,
            color: fgSoft,
          }}>À la recherche du temps perdu</span>
          <span style={{ display: 'flex', gap: 14 }}>
            <span>Aa</span>
            <span>{night ? '☾' : '☼'}</span>
          </span>
        </div>

        {/* Body text */}
        <div style={{
          position: 'absolute', top: 38, left: 0, right: 0, bottom: 36,
          overflow: 'auto', padding: '36px 32px 40px',
          fontFamily: T.serif, fontSize, lineHeight: 1.55,
          color: fg, textAlign: 'justify', hyphens: 'auto',
        }}>
          <div style={{
            fontFamily: T.mono, fontSize: 10, letterSpacing: 1.4,
            textTransform: 'uppercase', color: fgMute, marginBottom: 20,
            textAlign: 'center',
          }}>— Combray, II —</div>

          <p style={{ margin: '0 0 1em', textIndent: '1.4em' }}>
            Longtemps, je me suis couché de bonne heure. Parfois, à peine
            ma bougie éteinte, mes yeux se fermaient si vite que je
            n'avais pas le temps de me dire : « Je m'endors. »
          </p>
          <p style={{ margin: '0 0 1em', textIndent: '1.4em' }}>
            Et, une demi-heure après, la pensée qu'il était temps de
            chercher le sommeil m'éveillait ; je voulais poser le volume
            que je croyais avoir encore dans les mains et souffler ma
            lumière ; je n'avais pas cessé en dormant de faire des
            réflexions sur ce que je venais de lire, mais ces réflexions
            avaient pris un tour un peu particulier ; il me semblait que
            j'étais moi-même ce dont parlait l'ouvrage : une église, un
            quatuor, la rivalité de François I<sup>er</sup> et de
            Charles Quint.
          </p>
          <p style={{ margin: '0 0 1em', textIndent: '1.4em' }}>
            Cette croyance survivait pendant quelques secondes à mon
            réveil ; elle ne choquait pas ma raison{' '}
            {withSelection ? (
              <span style={{
                background: night ? 'rgba(212, 197, 168, 0.25)' : 'rgba(122, 36, 24, 0.18)',
                boxShadow: night ? 'inset 0 -1px 0 rgba(212,197,168,0.5)' : 'inset 0 -1px 0 rgba(122,36,24,0.5)',
                padding: '0 1px',
              }}>mais pesait comme des écailles sur mes yeux et les empêchait de se rendre compte que le bougeoir n'était plus allumé</span>
            ) : "mais pesait comme des écailles sur mes yeux et les empêchait de se rendre compte que le bougeoir n'était plus allumé"}.
            Puis elle commençait à me devenir inintelligible, comme
            après la métempsycose les pensées d'une existence antérieure.
          </p>
        </div>

        {/* Floating save button on selection */}
        {withSelection && (
          <div style={{
            position: 'absolute', top: 320, left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex', alignItems: 'center', gap: 0,
            background: night ? '#1a1612' : T.ink,
            color: night ? T.paper : T.paper,
            boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
            fontFamily: T.mono, fontSize: 11, letterSpacing: 1.2,
            textTransform: 'uppercase',
          }}>
            <div style={{ padding: '12px 18px', borderRight: `0.5px solid rgba(255,255,255,0.15)` }}>
              <svg width="13" height="14" viewBox="0 0 13 14" fill="none" stroke="currentColor" strokeWidth="1.3">
                <path d="M2 1h9v12l-4.5-3L2 13z"/>
              </svg>
            </div>
            <div style={{ padding: '12px 18px' }}>Sauvegarder le passage</div>
            {/* arrow */}
            <div style={{
              position: 'absolute', bottom: -6, left: '50%',
              transform: 'translateX(-50%) rotate(45deg)',
              width: 12, height: 12, background: night ? '#1a1612' : T.ink,
            }} />
          </div>
        )}

        {/* Bottom: progress */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          padding: '10px 24px 12px',
          display: 'flex', justifyContent: 'space-between',
          fontFamily: T.mono, fontSize: 9.5, color: fgMute,
          letterSpacing: 1, textTransform: 'uppercase',
          borderTop: `0.5px solid ${night ? 'rgba(255,255,255,0.08)' : T.rule}`,
        }}>
          <span>p. 4 / 412</span>
          <span>1 %</span>
        </div>
      </div>
    </window.Screen>
  );
};

window.ReaderView = ReaderView;
