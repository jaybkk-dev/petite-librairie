import { useEffect, useRef, useState } from 'react';
import ePub, { type Book as EpubBook, type Rendition } from 'epubjs';
import { loadEpubBytes } from '../lib/epub';
import { useStore } from '../store';
import './Reader.css';

interface Props {
  bookId: string;
  onClose: () => void;
}

interface PageInfo {
  current: number;
  total: number;
  percent: number;
}

interface SelectionInfo {
  text: string;
  cfiRange: string;
}

const FONT_SIZE_STEPS = [16, 18, 20, 22, 24];

export function Reader({ bookId, onClose }: Props) {
  const { config, data, addPassage, setReadPosition, setLastRead, setPrefs, startReading } = useStore();
  const book = data.books.find((b) => b.id === bookId);

  const containerRef = useRef<HTMLDivElement>(null);
  const epubBookRef = useRef<EpubBook | null>(null);
  const renditionRef = useRef<Rendition | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pageInfo, setPageInfo] = useState<PageInfo | null>(null);
  const [selection, setSelection] = useState<SelectionInfo | null>(null);

  const nightMode = data.prefs.nightMode;
  const fontSize = data.prefs.fontSize;
  const savedCfi = data.prefs.positions[bookId];

  useEffect(() => {
    setLastRead(bookId);
    startReading(bookId);
  }, [bookId, setLastRead, startReading]);

  useEffect(() => {
    if (!book?.epubPath || !containerRef.current) return;
    let cancelled = false;
    let bk: EpubBook | null = null;
    let rend: Rendition | null = null;

    const updatePageInfo = (cfi: string) => {
      if (!bk || !bk.locations) return;
      try {
        const locs = bk.locations as unknown as {
          locationFromCfi: (cfi: string) => number | string;
          percentageFromCfi: (cfi: string) => number;
          total: number;
        };
        const loc = locs.locationFromCfi(cfi);
        const total = locs.total;
        const percent = locs.percentageFromCfi(cfi) ?? 0;
        const current = typeof loc === 'number' ? loc : Number(loc) || 0;
        if (!cancelled) {
          setPageInfo({ current, total, percent: Math.round(percent * 100) });
        }
      } catch {
        // locations not yet generated
      }
    };

    const onRelocated = (location: { start: { cfi: string } }) => {
      const cfi = location.start.cfi;
      setReadPosition(bookId, cfi);
      updatePageInfo(cfi);
      setSelection(null);
    };

    const onSelected = (cfiRange: string, contents: { window: Window }) => {
      const text = contents.window.getSelection()?.toString();
      if (text && text.trim().length > 0) {
        setSelection({ text: text.trim(), cfiRange });
      }
    };

    const onRendered = (
      _section: unknown,
      contents: { window: Window; document: Document },
    ) => {
      contents.document.addEventListener('selectionchange', () => {
        const t = contents.window.getSelection()?.toString();
        if (!t) setSelection(null);
      });
    };

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const buffer = await loadEpubBytes(book.epubPath!, config);
        if (cancelled) return;
        bk = ePub(buffer);
        epubBookRef.current = bk;
        await bk.ready;
        if (cancelled) return;

        rend = bk.renderTo(containerRef.current!, {
          width: '100%',
          height: '100%',
          spread: 'none',
          flow: 'paginated',
          allowScriptedContent: true,
        });
        renditionRef.current = rend;

        registerThemes(rend);
        rend.themes.select(nightMode ? 'night' : 'day');
        rend.themes.fontSize(`${fontSize}px`);

        rend.on('relocated', onRelocated);
        rend.on('selected', onSelected);
        rend.on('rendered', onRendered);

        await rend.display(savedCfi || undefined);
        if (cancelled) return;

        await bk.locations.generate(1024);
        if (cancelled) return;

        const loc = rend.location;
        if (loc?.start?.cfi) updatePageInfo(loc.start.cfi);

        setLoading(false);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : String(e));
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
      try {
        rend?.destroy();
      } catch {
        // ignore
      }
      try {
        bk?.destroy();
      } catch {
        // ignore
      }
      renditionRef.current = null;
      epubBookRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [book?.epubPath, bookId]);

  useEffect(() => {
    renditionRef.current?.themes.select(nightMode ? 'night' : 'day');
  }, [nightMode]);

  useEffect(() => {
    renditionRef.current?.themes.fontSize(`${fontSize}px`);
  }, [fontSize]);

  const turnPrev = () => {
    void renditionRef.current?.prev();
  };
  const turnNext = () => {
    void renditionRef.current?.next();
  };

  const cycleFontSize = () => {
    const i = FONT_SIZE_STEPS.indexOf(fontSize);
    const next = FONT_SIZE_STEPS[(i + 1) % FONT_SIZE_STEPS.length];
    setPrefs({ fontSize: next });
  };

  const toggleNight = () => setPrefs({ nightMode: !nightMode });

  const savePassage = () => {
    if (!selection || !book) return;
    addPassage(book.id, {
      text: selection.text,
      page: pageInfo?.current ?? 0,
      savedAt: new Date().toISOString(),
    });
    try {
      const iframe = containerRef.current?.querySelector('iframe');
      iframe?.contentWindow?.getSelection()?.removeAllRanges();
    } catch {
      // ignore
    }
    setSelection(null);
  };

  if (!book) {
    return (
      <div className="reader" data-night={nightMode}>
        <header className="reader__chrome">
          <button className="reader__back" onClick={onClose} aria-label="Retour">
            ←
          </button>
        </header>
        <div className="reader__error">Livre introuvable.</div>
      </div>
    );
  }

  if (!book.epubPath) {
    return (
      <div className="reader" data-night={nightMode}>
        <header className="reader__chrome">
          <button className="reader__back" onClick={onClose} aria-label="Retour">
            ←
          </button>
          <h1 className="reader__title">{book.title}</h1>
          <span />
        </header>
        <div className="reader__error">Aucun fichier .epub joint à ce livre.</div>
      </div>
    );
  }

  return (
    <div className="reader" data-night={nightMode}>
      <header className="reader__chrome">
        <button className="reader__back" onClick={onClose} aria-label="Retour">
          ←
        </button>
        <h1 className="reader__title">{book.title}</h1>
        <div className="reader__tools">
          <button
            className="reader__tool"
            onClick={cycleFontSize}
            aria-label={`Taille du texte (${fontSize}px)`}
          >
            Aa
          </button>
          <button
            className="reader__tool"
            onClick={toggleNight}
            aria-label={nightMode ? 'Mode jour' : 'Mode nuit'}
          >
            {nightMode ? '☼' : '☾'}
          </button>
        </div>
      </header>

      <div className="reader__body">
        {loading && <div className="reader__loading">Chargement…</div>}
        {error && <div className="reader__error">{error}</div>}
        <div ref={containerRef} className="reader__epub" />
        <button
          type="button"
          className="reader__zone reader__zone--prev"
          onClick={turnPrev}
          aria-label="Page précédente"
        />
        <button
          type="button"
          className="reader__zone reader__zone--next"
          onClick={turnNext}
          aria-label="Page suivante"
        />
        {selection && (
          <button type="button" className="reader__save" onClick={savePassage}>
            <BookmarkGlyph />
            Sauvegarder le passage
          </button>
        )}
      </div>

      <footer className="reader__strip">
        <span>{pageInfo ? `p. ${pageInfo.current} / ${pageInfo.total}` : ''}</span>
        <span>{pageInfo ? `${pageInfo.percent} %` : ''}</span>
      </footer>
    </div>
  );
}

function registerThemes(rendition: Rendition) {
  const baseBody = {
    'font-family': '"Cormorant Garamond", "EB Garamond", Georgia, serif',
    'line-height': '1.55',
    'text-align': 'justify',
    hyphens: 'auto',
    '-webkit-hyphens': 'auto',
    padding: '36px 32px 40px',
  };
  const para = { 'text-indent': '1.4em', margin: '0 0 0.5em 0' };
  const heading = {
    'font-family': '"Cormorant Garamond", serif',
    'font-weight': '500',
    'text-align': 'center',
  };

  rendition.themes.register('day', {
    body: { background: '#f4efe6', color: '#1a1612', ...baseBody },
    p: para,
    'p:first-of-type': { 'text-indent': '1.4em' },
    h1: heading,
    h2: heading,
    h3: heading,
  });
  rendition.themes.register('night', {
    body: { background: '#0f0c08', color: '#d4c5a8', ...baseBody },
    p: para,
    'p:first-of-type': { 'text-indent': '1.4em' },
    h1: { ...heading, color: '#d4c5a8' },
    h2: { ...heading, color: '#d4c5a8' },
    h3: { ...heading, color: '#d4c5a8' },
  });
}

function BookmarkGlyph() {
  return (
    <svg
      width="11"
      height="14"
      viewBox="0 0 11 14"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      aria-hidden="true"
    >
      <path d="M2 1 L9 1 L9 13 L5.5 10 L2 13 Z" />
    </svg>
  );
}
