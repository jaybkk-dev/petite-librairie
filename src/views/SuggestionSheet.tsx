import { useState } from 'react';
import { formatFrenchDateUpper } from '../lib/dates';
import { useStore } from '../store';
import type { InboxEntry } from '../types';
import './SuggestionSheet.css';

interface Props {
  onClose: () => void;
}

const CURRENT_YEAR = new Date().getFullYear();

export function SuggestionSheet({ onClose }: Props) {
  const { addInboxEntry } = useStore();
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [year, setYear] = useState<string>(String(CURRENT_YEAR));
  const [why, setWhy] = useState('');
  const [src, setSrc] = useState(`AJOUT MANUEL — ${formatFrenchDateUpper()}`);
  const [error, setError] = useState<string | null>(null);

  const submit = () => {
    const t = title.trim();
    const a = author.trim();
    const y = Number(year);
    const w = why.trim();
    const s = src.trim();
    if (!t || !a || !w || !s) {
      setError('Titre, auteur, pourquoi et source requis.');
      return;
    }
    if (!Number.isFinite(y) || y < 1500 || y > CURRENT_YEAR + 1) {
      setError('Année invalide.');
      return;
    }
    const entry: InboxEntry = {
      id: `manual-${Date.now().toString(36)}`,
      title: t,
      author: a,
      year: y,
      src: s,
      why: w,
      pipeline: 'manual',
      addedAt: new Date().toISOString(),
    };
    addInboxEntry(entry);
    onClose();
  };

  return (
    <div className="sg-sheet" role="dialog" aria-modal="true">
      <div className="sg-sheet__panel">
        <header className="sg-sheet__header">
          <span className="sg-sheet__eyebrow">Ajouter une suggestion</span>
          <button className="sg-sheet__close" onClick={onClose} aria-label="Fermer">
            ✕
          </button>
        </header>

        <label className="sg-sheet__field">
          <span className="sg-sheet__label">Titre</span>
          <input
            className="sg-sheet__input sg-sheet__input--serif"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
          />
        </label>
        <label className="sg-sheet__field">
          <span className="sg-sheet__label">Auteur</span>
          <input
            className="sg-sheet__input"
            type="text"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
          />
        </label>
        <label className="sg-sheet__field">
          <span className="sg-sheet__label">Année</span>
          <input
            className="sg-sheet__input sg-sheet__input--mono"
            type="number"
            inputMode="numeric"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            min={1500}
            max={CURRENT_YEAR + 1}
          />
        </label>
        <label className="sg-sheet__field">
          <span className="sg-sheet__label">Pourquoi</span>
          <textarea
            className="sg-sheet__input sg-sheet__textarea"
            value={why}
            onChange={(e) => setWhy(e.target.value)}
            rows={3}
            placeholder="Quelques mots sur la raison de l'ajouter…"
          />
        </label>
        <label className="sg-sheet__field">
          <span className="sg-sheet__label">Source</span>
          <input
            className="sg-sheet__input sg-sheet__input--mono"
            type="text"
            value={src}
            onChange={(e) => setSrc(e.target.value)}
          />
        </label>

        {error && <p className="sg-sheet__error">{error}</p>}

        <div className="sg-sheet__actions">
          <button className="btn btn--ghost" onClick={onClose}>
            Annuler
          </button>
          <button className="btn btn--primary" onClick={submit}>
            Ajouter
          </button>
        </div>
      </div>
    </div>
  );
}
