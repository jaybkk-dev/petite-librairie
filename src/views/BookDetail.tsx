import { useRef, useState } from 'react';
import { NotesEditor } from '../components/NotesEditor';
import { StatusBadge } from '../components/StatusBadge';
import { formatFrenchDate } from '../lib/dates';
import { authorWikipediaURL } from '../lib/wikipedia';
import { useStore } from '../store';
import type { AcquisitionBlock } from '../types';
import './BookDetail.css';

interface Props {
  bookId: string;
  onBack: () => void;
  onOpenReader: () => void;
  onAcquire: () => void;
}

export function BookDetail({ bookId, onBack, onOpenReader, onAcquire }: Props) {
  const { data, cycleStatus, setNote, attachEpub } = useStore();
  const book = data.books.find((b) => b.id === bookId);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [attaching, setAttaching] = useState(false);
  const [attachError, setAttachError] = useState<string | null>(null);

  const onAttachFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (!f || !book) return;
    setAttaching(true);
    setAttachError(null);
    try {
      await attachEpub(book.id, f);
    } catch (err) {
      setAttachError(err instanceof Error ? err.message : String(err));
    } finally {
      setAttaching(false);
    }
  };

  if (!book) {
    return (
      <div className="detail">
        <header className="detail__strip">
          <button className="detail__back" onClick={onBack}>
            ← Bibliothèque
          </button>
        </header>
        <div className="detail__missing">Livre introuvable.</div>
      </div>
    );
  }

  const total = String(data.books.length).padStart(2, '0');
  const acq = book.acquisition;
  const hasEpub = Boolean(book.epubPath);

  return (
    <div className="detail">
      <header className="detail__strip">
        <button className="detail__back" onClick={onBack}>
          ← Bibliothèque
        </button>
        <span className="detail__counter">
          {book.n} / {total}
        </span>
      </header>

      <section className="detail__title-block">
        <div className="detail__eyebrow">Fiche</div>
        <a
          className="detail__author"
          href={authorWikipediaURL(book.author)}
          target="_blank"
          rel="noreferrer"
        >
          {book.author}
          <ArrowOutGlyph />
        </a>
        <h1 className="detail__title">{book.title}</h1>
        <p className="detail__meta">
          {book.year} · {book.source ?? '—'}
        </p>
      </section>

      <section className="detail__primary">
        {hasEpub ? (
          <button className="btn btn--primary detail__primary-btn" onClick={onOpenReader}>
            Ouvrir la liseuse →
          </button>
        ) : (
          <>
            <button
              type="button"
              className="btn btn--primary detail__primary-btn"
              onClick={() => fileInputRef.current?.click()}
              disabled={attaching}
            >
              {attaching ? 'Téléversement…' : 'Joindre un fichier .epub'}
            </button>
            <button
              type="button"
              className="btn btn--ghost detail__secondary-btn"
              onClick={onAcquire}
              disabled={attaching}
            >
              Acquérir
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".epub,application/epub+zip"
              className="detail__file-input"
              onChange={onAttachFile}
            />
            {attachError && <p className="detail__attach-error">{attachError}</p>}
          </>
        )}
      </section>

      <section className="detail__table">
        <div className="detail__row">
          <span className="detail__row-label">Statut</span>
          <span className="detail__row-value">
            <StatusBadge status={book.status} onTap={() => cycleStatus(book.id)} as="button" />
          </span>
        </div>
        <div className="detail__row">
          <span className="detail__row-label">Commencé</span>
          <span className="detail__row-value detail__row-value--mono">
            {formatFrenchDate(book.start)}
          </span>
        </div>
        <div className="detail__row">
          <span className="detail__row-label">Terminé</span>
          <span className="detail__row-value detail__row-value--mono">
            {formatFrenchDate(book.end)}
          </span>
        </div>
      </section>

      {book.justif && (
        <section className="detail__section">
          <div className="detail__eyebrow">Pourquoi</div>
          <p className="detail__justif">{book.justif}</p>
        </section>
      )}

      <section className="detail__section">
        <div className="detail__eyebrow">Notes</div>
        <NotesEditor value={book.note ?? ''} onSave={(v) => setNote(book.id, v)} />
      </section>

      {book.passages.length > 0 && (
        <section className="detail__section">
          <div className="detail__eyebrow detail__eyebrow--row">
            <span>Passages</span>
            <span className="detail__count">{book.passages.length}</span>
          </div>
          <ul className="detail__passages">
            {book.passages.map((p, i) => (
              <li key={i} className="detail__passage">
                <p className="detail__passage-text">« {p.text} »</p>
                <p className="detail__passage-page">p. {p.page}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      <AcquisitionSection book={book} acquisition={acq} />
    </div>
  );
}

interface AcqProps {
  book: { title: string; author: string };
  acquisition?: AcquisitionBlock;
}

function AcquisitionSection({ book, acquisition }: AcqProps) {
  const [copied, setCopied] = useState(false);

  if (!acquisition) {
    return (
      <section className="detail__acq">
        <div className="detail__eyebrow">Acquisition</div>
        <p className="detail__acq-empty">Aucune information disponible.</p>
      </section>
    );
  }

  const message =
    acquisition.message ??
    `Si jamais l'envie te prenait d'offrir un livre — voici le lien pour ${book.title}, de ${book.author}.`;

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      // permission denied or unsupported — silently no-op
    }
  };

  const onShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ text: message });
      } catch {
        // user dismissed — silently no-op
      }
    } else {
      void onCopy();
    }
  };

  return (
    <section className="detail__acq">
      <div className="detail__eyebrow">Acquisition</div>
      <dl className="detail__acq-grid">
        <AcqRow label="Plateforme" value={acquisition.platform} />
        <AcqRow label="Prix" value={acquisition.price} />
        <AcqRow label="DRM" value={acquisition.drm} />
        <AcqRow label="Bangkok" value={acquisition.bangkok} />
      </dl>
      {acquisition.url && acquisition.platform && (
        <a
          className="btn btn--primary detail__acq-cta"
          href={acquisition.url}
          target="_blank"
          rel="noreferrer"
        >
          Acheter sur {acquisition.platform} →
        </a>
      )}
      <div className="detail__acq-message">
        <div className="detail__eyebrow">Message à transférer</div>
        <p className="detail__acq-text">« {message} »</p>
        <div className="detail__acq-actions">
          <button className="btn btn--ghost" onClick={onCopy}>
            {copied ? 'Copié' : 'Copier'}
          </button>
          <button className="btn btn--ghost" onClick={onShare}>
            Partager
          </button>
        </div>
      </div>
    </section>
  );
}

function AcqRow({ label, value }: { label: string; value?: string }) {
  return (
    <>
      <dt>{label}</dt>
      <dd>{value ?? '—'}</dd>
    </>
  );
}

function ArrowOutGlyph() {
  return (
    <svg
      width="9"
      height="9"
      viewBox="0 0 9 9"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      aria-hidden="true"
    >
      <path d="M3 1h5v5M8 1L1 8" />
    </svg>
  );
}
