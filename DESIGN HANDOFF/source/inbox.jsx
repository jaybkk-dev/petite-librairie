// Recommendations Inbox — agent-generated candidate cards.

const InboxCard = ({ rec, dismissed = false }) => {
  const T = window.TOKENS;
  return (
    <div style={{
      borderBottom: `0.5px solid ${T.rule}`,
      padding: '22px 24px 20px',
      opacity: dismissed ? 0.4 : 1,
      position: 'relative',
    }}>
      {/* source */}
      <div style={{
        fontFamily: T.mono, fontSize: 9, letterSpacing: 1.2,
        textTransform: 'uppercase', color: T.inkMute, marginBottom: 12,
      }}>{rec.src}</div>

      {/* title + author */}
      <div style={{
        fontFamily: T.serif, fontStyle: 'italic',
        fontSize: 22, lineHeight: 1.15, color: T.ink,
        letterSpacing: -0.2, marginBottom: 5,
        textWrap: 'pretty',
      }}>{rec.title}</div>
      <div style={{
        fontFamily: T.sans, fontSize: 13, color: T.inkSoft,
        display: 'flex', alignItems: 'center', gap: 8,
        marginBottom: 14,
      }}>
        <span>{rec.author}</span>
        <span style={{ color: T.inkFaint }}>·</span>
        <span style={{ fontFamily: T.mono, fontSize: 11, color: T.inkMute }}>{rec.year}</span>
      </div>

      {/* why */}
      <div style={{
        fontFamily: T.serif, fontSize: 14.5, lineHeight: 1.45,
        color: T.inkSoft, marginBottom: 18,
        paddingLeft: 12, borderLeft: `1px solid ${T.ruleStrong}`,
        textWrap: 'pretty',
      }}>{rec.why}</div>

      {/* actions */}
      <div style={{ display: 'flex', gap: 8, fontFamily: T.mono,
        fontSize: 10, letterSpacing: 1, textTransform: 'uppercase' }}>
        <div style={{
          flex: 1, padding: '10px 0', textAlign: 'center',
          background: T.ink, color: T.paper, cursor: 'pointer',
        }}>Ajouter</div>
        <div style={{
          padding: '10px 18px', textAlign: 'center',
          border: `0.5px solid ${T.ruleStrong}`,
          color: T.inkSoft, cursor: 'pointer',
        }}>Écarter</div>
      </div>
    </div>
  );
};

const InboxView = () => {
  const T = window.TOKENS;
  return (
    <window.Screen tabActive="inbox">
      <div style={{ height: '100%', overflow: 'auto' }}>
        {/* Header */}
        <div style={{ padding: '20px 24px 18px' }}>
          <div style={{
            fontFamily: T.mono, fontSize: 9.5, letterSpacing: 1.4,
            textTransform: 'uppercase', color: T.inkMute, marginBottom: 4,
          }}>Suggestions de l'agent</div>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
          }}>
            <div style={{
              fontFamily: T.serif, fontSize: 32, lineHeight: 1, color: T.ink,
              letterSpacing: -0.5,
            }}>À examiner</div>
            <div style={{
              fontFamily: T.mono, fontSize: 10, color: T.inkMute,
              letterSpacing: 0.5,
            }}>{String(window.INBOX.length).padStart(2, '0')} cartes</div>
          </div>
        </div>
        <div style={{ borderTop: `0.5px solid ${T.ruleStrong}` }}>
          {window.INBOX.map((r, i) => <InboxCard key={i} rec={r} />)}
        </div>
        <div style={{ height: 40 }} />
      </div>
    </window.Screen>
  );
};

window.InboxView = InboxView;
window.InboxCard = InboxCard;
