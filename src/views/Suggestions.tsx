import { useMemo, useState } from 'react';
import { Brand } from '../components/Brand';
import { useStore } from '../store';
import { SuggestionSheet } from './SuggestionSheet';
import './Suggestions.css';

type LaunchPhase = 'idle' | 'launching' | 'launched' | 'error';

export function Suggestions() {
  const { data, acceptInbox, dismissInbox, triggerDiscovery } = useStore();
  const [adding, setAdding] = useState(false);
  const [launch, setLaunch] = useState<LaunchPhase>('idle');
  const [launchError, setLaunchError] = useState<string>('');

  const ordered = useMemo(
    () => [...data.inbox].sort((a, b) => b.addedAt.localeCompare(a.addedAt)),
    [data.inbox],
  );

  const handleLaunch = async () => {
    if (!confirm('Lancer une nouvelle recherche ?')) return;
    setLaunch('launching');
    setLaunchError('');
    try {
      await triggerDiscovery();
      setLaunch('launched');
    } catch (err) {
      setLaunch('error');
      setLaunchError(err instanceof Error ? err.message : String(err));
    }
  };

  return (
    <div className="suggestions">
      <header className="suggestions__header">
        <Brand />
        <p className="suggestions__eyebrow">Suggestions de l'agent</p>
        <div className="suggestions__title-row">
          <h1 className="suggestions__title">À examiner</h1>
          <span className="suggestions__count">
            {String(ordered.length).padStart(3, '0')} suggestions
          </span>
        </div>
        <div className="suggestions__add-row">
          <button
            type="button"
            className="suggestions__add-btn"
            onClick={handleLaunch}
            disabled={launch === 'launching'}
          >
            {launch === 'launching' ? 'Lancement…' : '↻ Lancer une recherche'}
          </button>
          <button
            type="button"
            className="suggestions__add-btn"
            onClick={() => setAdding(true)}
          >
            + Ajouter une suggestion
          </button>
        </div>
        {launch === 'launched' && (
          <p className="suggestions__launch-msg">
            Recherche lancée. Les nouvelles suggestions arriveront dans quelques minutes.
          </p>
        )}
        {launch === 'error' && (
          <p className="suggestions__launch-msg suggestions__launch-msg--error">
            Échec du lancement{launchError ? ' — ' + launchError : ''}
          </p>
        )}
      </header>

      {ordered.length === 0 ? (
        <p className="suggestions__empty">Aucune suggestion à examiner.</p>
      ) : (
        <ul className="suggestions__list">
          {ordered.map((entry) => (
            <li key={entry.id} className="suggestion">
              <p className="suggestion__source">{entry.src}</p>
              <h2 className="suggestion__title">{entry.title}</h2>
              <p className="suggestion__meta">
                <span className="suggestion__author">{entry.author}</span>
                <span className="suggestion__sep">·</span>
                <span className="suggestion__year">{entry.year}</span>
              </p>
              <p className="suggestion__why">{entry.why}</p>
              <div className="suggestion__actions">
                <button
                  type="button"
                  className="btn btn--primary suggestion__primary"
                  onClick={() => acceptInbox(entry.id)}
                >
                  Ajouter
                </button>
                <button
                  type="button"
                  className="btn btn--ghost suggestion__secondary"
                  onClick={() => dismissInbox(entry.id)}
                >
                  Écarter
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {adding && <SuggestionSheet onClose={() => setAdding(false)} />}
    </div>
  );
}
