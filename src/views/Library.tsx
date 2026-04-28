import { useMemo, useRef, useState } from 'react';
import { Brand } from '../components/Brand';
import { NotesEditor } from '../components/NotesEditor';
import { SegControl } from '../components/SegControl';
import { StatusBadge } from '../components/StatusBadge';
import { compareByStatusThenTitle } from '../lib/sort';
import { authorWikipediaURL } from '../lib/wikipedia';
import { useStore } from '../store';
import type { Book } from '../types';
import { Bookcase } from './Bookcase';
import { ImportSheet } from './ImportSheet';
import './Library.css';

type Mode = 'list' | 'shelf';

const MODE_OPTIONS = [
  { value: 'shelf' as const, label: 'Étagère' },
  { value: 'list' as const, label: 'Liste' },
];

interface LibraryProps {
  onOpenBook: (id: string) => void;
  onOpenReader: (id: string) => void;
  onAcquire: (id: string) => void;
}

export function Library({ onOpenBook, onOpenReader, onAcquire }: LibraryProps) {
  const { data, cycleStatus, setNote, deleteBook } = useStore();
  const [mode, setMode] = useState<Mode>('shelf');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [importFile, setImportFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const ordered = useMemo(
    () => [...data.books].sort(compareByStatusThenTitle),
    [data.books],
  );

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) setImportFile(f);
    e.target.value = '';
  };

  return (
    <div className="library">
      <header className="library__header">
        <Brand />
        <div className="library__title-row">
          <h1 className="library__title">Bibliothèque</h1>
          <span className="library__count">
            {String(data.books.length).padStart(3, '0')} ouvrages
          </span>
        </div>
        <div className="library__mode">
          <SegControl
            options={MODE_OPTIONS}
            value={mode}
            onChange={setMode}
            ariaLabel="Mode d'affichage"
          />
        </div>
        <div className="library__import">
          <button
            type="button"
            className="library__import-btn"
            onClick={() => fileInputRef.current?.click()}
          >
            + Importer un epub
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".epub,application/epub+zip"
            className="library__import-input"
            onChange={handleFile}
          />
        </div>
      </header>

      {mode === 'list' ? (
        <ul className="library__rows">
          {ordered.map((book) => (
            <LibraryRow
              key={book.id}
              book={book}
              expanded={expanded === book.id}
              onToggle={() =>
                setExpanded((cur) => (cur === book.id ? null : book.id))
              }
              onCycleStatus={() => cycleStatus(book.id)}
              onSaveNote={(note) => setNote(book.id, note)}
              onDelete={() => deleteBook(book.id)}
              onOpenDetail={() => onOpenBook(book.id)}
              onOpenReader={() => onOpenReader(book.id)}
              onAcquire={() => onAcquire(book.id)}
            />
          ))}
        </ul>
      ) : (
        <Bookcase books={data.books} onOpenBook={onOpenBook} />
      )}

      {importFile && (
        <ImportSheet
          file={importFile}
          onClose={() => setImportFile(null)}
          onImported={(id) => {
            setImportFile(null);
            onOpenBook(id);
          }}
        />
      )}
    </div>
  );
}

interface RowProps {
  book: Book;
  expanded: boolean;
  onToggle: () => void;
  onCycleStatus: () => void;
  onSaveNote: (note: string) => void;
  onDelete: () => void;
  onOpenDetail: () => void;
  onOpenReader: () => void;
  onAcquire: () => void;
}

function LibraryRow({
  book,
  expanded,
  onToggle,
  onCycleStatus,
  onSaveNote,
  onDelete,
  onOpenDetail,
  onOpenReader,
  onAcquire,
}: RowProps) {
  const isAbandoned = book.status === 'abandonne';
  const hasEpub = Boolean(book.epubPath);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    const ok = window.confirm('Supprimer définitivement ?');
    if (ok) onDelete();
  };

  const handleAction = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasEpub) onOpenReader();
    else onAcquire();
  };

  const handleRowKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onToggle();
    }
  };

  return (
    <li className="library__row-wrap">
      <div
        className="library__row"
        role="button"
        tabIndex={0}
        onClick={onToggle}
        onKeyDown={handleRowKey}
      >
        <span className="library__n">{book.n}</span>
        <div className="library__main">
          <div
            className={`library__title-italic ${isAbandoned ? 'library__title-italic--strike' : ''}`}
          >
            {book.title}
          </div>
          <div className="library__meta">
            <a
              className="library__author"
              href={authorWikipediaURL(book.author)}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
            >
              {book.author}
            </a>
          </div>
        </div>
        <span className="library__year">{book.year}</span>
        <div className="library__stack">
          <StatusBadge status={book.status} onTap={onCycleStatus} as="button" />
          <button
            type="button"
            className="library__action"
            onClick={handleAction}
            aria-label={hasEpub ? 'Ouvrir la liseuse' : 'Acquérir'}
            title={hasEpub ? 'Ouvrir la liseuse' : 'Acquérir'}
          >
            {hasEpub ? <BookGlyph /> : <AcquireGlyph />}
          </button>
        </div>
        <button
          type="button"
          className="library__trash"
          onClick={handleDelete}
          aria-label="Supprimer le livre"
        >
          <TrashGlyph />
        </button>
      </div>
      {expanded && (
        <ExpandedPanel
          book={book}
          onSaveNote={onSaveNote}
          onOpenDetail={onOpenDetail}
        />
      )}
    </li>
  );
}

interface ExpandedProps {
  book: Book;
  onSaveNote: (note: string) => void;
  onOpenDetail: () => void;
}

function ExpandedPanel({ book, onSaveNote, onOpenDetail }: ExpandedProps) {
  return (
    <div className="library__expanded" onClick={(e) => e.stopPropagation()}>
      {book.justif && (
        <div className="library__field">
          <div className="library__eyebrow">Pourquoi</div>
          <div className="library__justif">{book.justif}</div>
        </div>
      )}
      <div className="library__field">
        <div className="library__eyebrow">Notes</div>
        <NotesEditor value={book.note ?? ''} onSave={onSaveNote} />
      </div>
      <div className="library__expanded-actions">
        <button
          type="button"
          className="library__open-detail"
          onClick={onOpenDetail}
        >
          Ouvrir la fiche →
        </button>
      </div>
    </div>
  );
}

function TrashGlyph() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
    >
      <path d="M2 3.5 L12 3.5" />
      <path d="M5 3.5 L5 2 L9 2 L9 3.5" />
      <path d="M3.5 3.5 L4.2 12 L9.8 12 L10.5 3.5" />
      <path d="M6 6 L6 10 M8 6 L8 10" />
    </svg>
  );
}

function BookGlyph() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
    >
      <path d="M2 3 L7 4.5 L12 3 L12 11 L7 9.5 L2 11 Z" />
      <line x1="7" y1="4.5" x2="7" y2="9.5" />
    </svg>
  );
}

function AcquireGlyph() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
    >
      <rect x="2" y="2" width="10" height="10" />
      <line x1="4.5" y1="7" x2="9.5" y2="7" />
      <line x1="7" y1="4.5" x2="7" y2="9.5" />
    </svg>
  );
}
