import { useEffect, useState } from 'react';
import { maybeNormalizeCase } from '../lib/case';
import { parseEpubMetadata } from '../lib/epub';
import { useStore } from '../store';
import './ImportSheet.css';

interface Props {
  file: File;
  onClose: () => void;
  onImported: (bookId: string) => void;
}

type Phase = 'parsing' | 'editing' | 'uploading' | 'error';

const CURRENT_YEAR = new Date().getFullYear();

export function ImportSheet({ file, onClose, onImported }: Props) {
  const { importEpub } = useStore();
  const [phase, setPhase] = useState<Phase>('parsing');
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [year, setYear] = useState<string>(String(CURRENT_YEAR));

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const buffer = await file.arrayBuffer();
        const meta = await parseEpubMetadata(buffer);
        if (cancelled) return;
        setTitle(maybeNormalizeCase(meta.title || stripExtension(file.name)));
        setAuthor(maybeNormalizeCase(meta.author || ''));
        setYear(meta.year ? String(meta.year) : String(CURRENT_YEAR));
        setPhase('editing');
      } catch (e) {
        if (cancelled) return;
        setTitle(maybeNormalizeCase(stripExtension(file.name)));
        setAuthor('');
        setYear(String(CURRENT_YEAR));
        setPhase('editing');
        setError(
          'Métadonnées illisibles. Saisir manuellement avant de valider. (' +
            (e instanceof Error ? e.message : String(e)) +
            ')',
        );
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [file]);

  const submit = async () => {
    const t = maybeNormalizeCase(title.trim());
    const a = maybeNormalizeCase(author.trim());
    const y = Number(year);
    if (!t || !a || !Number.isFinite(y)) {
      setError('Titre, auteur et année requis.');
      return;
    }
    setError(null);
    setPhase('uploading');
    try {
      const newBook = await importEpub({ file, title: t, author: a, year: y });
      onImported(newBook.id);
    } catch (e) {
      setPhase('editing');
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  return (
    <div className="import" role="dialog" aria-modal="true" aria-labelledby="import-title">
      <div className="import__sheet">
        <header className="import__header">
          <span className="import__eyebrow">Importer un epub</span>
          <button className="import__close" onClick={onClose} aria-label="Fermer">
            ✕
          </button>
        </header>
        <p className="import__file">{file.name}</p>

        {phase === 'parsing' && (
          <p className="import__status">Lecture des métadonnées…</p>
        )}

        {(phase === 'editing' || phase === 'uploading') && (
          <>
            <label className="import__field">
              <span className="import__label">Titre</span>
              <input
                className="import__input import__input--serif"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={phase === 'uploading'}
                autoFocus
              />
            </label>
            <label className="import__field">
              <span className="import__label">Auteur</span>
              <input
                className="import__input"
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                disabled={phase === 'uploading'}
              />
            </label>
            <label className="import__field">
              <span className="import__label">Année</span>
              <input
                className="import__input import__input--mono"
                type="number"
                inputMode="numeric"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                min={1500}
                max={CURRENT_YEAR + 1}
                disabled={phase === 'uploading'}
              />
            </label>

            {error && <p className="import__error">{error}</p>}

            <div className="import__actions">
              <button
                className="btn btn--ghost"
                onClick={onClose}
                disabled={phase === 'uploading'}
              >
                Annuler
              </button>
              <button
                className="btn btn--primary"
                onClick={submit}
                disabled={phase === 'uploading'}
              >
                {phase === 'uploading' ? 'Téléversement…' : 'Ajouter'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function stripExtension(name: string): string {
  return name.replace(/\.epub$/i, '');
}
