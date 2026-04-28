import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type {
  AppData,
  Book,
  Dismissed,
  InboxEntry,
  Passage,
  ReaderPrefs,
  Status,
  SyncConfig,
} from '../types';
import { SEED_DATA } from '../data/seed';
import {
  dispatchWorkflow,
  moveFile,
  readFile,
  writeFile,
  writeEpubBytes,
  type RemoteFiles,
} from '../lib/github';
import { computeSpineSize } from '../lib/spine';
import { formatFrenchDateUpper } from '../lib/dates';

const CONFIG_KEY = 'lpl.sync.config.v1';
const CACHE_KEY = 'lpl.cache.v1';
const SHA_KEY = 'lpl.sha.v1';
const DIRTY_KEY = 'lpl.dirty.v1';
const PUSH_DEBOUNCE_MS = 500;

const FILES = {
  books: 'books.json',
  inbox: 'inbox.json',
  dismissed: 'dismissed.json',
  prefs: 'prefs.json',
} as const;

type SyncStatus = 'idle' | 'pulling' | 'pushing' | 'error';

interface StoreValue {
  config: SyncConfig | null;
  configured: boolean;
  data: AppData;
  syncStatus: SyncStatus;
  syncError: string | null;
  lastSync: number | null;

  setConfig: (cfg: SyncConfig | null) => void;
  pull: () => Promise<void>;
  bootstrap: () => Promise<void>;

  cycleStatus: (id: string) => void;
  setStatus: (id: string, status: Status) => void;
  startReading: (id: string) => void;
  setNote: (id: string, note: string) => void;
  deleteBook: (id: string) => void;
  addBook: (book: Book) => void;
  updateBook: (id: string, patch: Partial<Book>) => void;
  addPassage: (id: string, passage: Passage) => void;

  acceptInbox: (entryId: string) => void;
  dismissInbox: (entryId: string) => void;
  addInboxEntry: (entry: InboxEntry) => void;

  setPrefs: (patch: Partial<ReaderPrefs>) => void;
  setReadPosition: (bookId: string, cfi: string) => void;
  setLastRead: (bookId: string) => void;

  importEpub: (input: ImportEpubInput) => Promise<Book>;
  attachEpub: (bookId: string, file: File) => Promise<void>;
  triggerAcquisition: (bookId: string) => Promise<void>;
}

export interface ImportEpubInput {
  file: File;
  title: string;
  author: string;
  year: number;
}

const StoreContext = createContext<StoreValue | null>(null);

function loadConfig(): SyncConfig | null {
  try {
    const raw = localStorage.getItem(CONFIG_KEY);
    return raw ? (JSON.parse(raw) as SyncConfig) : null;
  } catch {
    return null;
  }
}

function loadCache(): AppData {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (raw) return JSON.parse(raw) as AppData;
  } catch {
    // fall through
  }
  return SEED_DATA;
}

function loadShas(): RemoteFiles {
  try {
    const raw = localStorage.getItem(SHA_KEY);
    return raw ? (JSON.parse(raw) as RemoteFiles) : {};
  } catch {
    return {};
  }
}

function persistCache(data: AppData) {
  localStorage.setItem(CACHE_KEY, JSON.stringify(data));
}

function persistShas(shas: RemoteFiles) {
  localStorage.setItem(SHA_KEY, JSON.stringify(shas));
}

type DirtyKey = keyof typeof FILES;

function loadDirty(): Set<DirtyKey> {
  try {
    const raw = localStorage.getItem(DIRTY_KEY);
    if (raw) return new Set(JSON.parse(raw) as DirtyKey[]);
  } catch {
    // fall through
  }
  return new Set();
}

function persistDirty(dirty: Set<DirtyKey>) {
  if (dirty.size === 0) {
    localStorage.removeItem(DIRTY_KEY);
  } else {
    localStorage.setItem(DIRTY_KEY, JSON.stringify(Array.from(dirty)));
  }
}

const STATUS_CYCLE: Status[] = ['a-lire', 'en-cours', 'lu', 'abandonne'];

export function StoreProvider({ children }: { children: ReactNode }) {
  const [config, setConfigState] = useState<SyncConfig | null>(() => loadConfig());
  const [data, setData] = useState<AppData>(() => loadCache());
  const [shas, setShas] = useState<RemoteFiles>(() => loadShas());
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  const [syncError, setSyncError] = useState<string | null>(null);
  const [lastSync, setLastSync] = useState<number | null>(null);

  // dirty flags drive a debounced push of just the changed files
  const dirtyRef = useRef<Set<DirtyKey>>(loadDirty());
  const pushTimerRef = useRef<number | null>(null);

  // Refs mirror the latest state so async callbacks (debounced pushes,
  // safety-net flushes) always read fresh values instead of a stale closure.
  const dataRef = useRef<AppData>(data);
  const shasRef = useRef<RemoteFiles>(shas);

  useEffect(() => {
    dataRef.current = data;
    persistCache(data);
  }, [data]);

  useEffect(() => {
    shasRef.current = shas;
    persistShas(shas);
  }, [shas]);

  const setConfig = useCallback((cfg: SyncConfig | null) => {
    if (cfg) {
      localStorage.setItem(CONFIG_KEY, JSON.stringify(cfg));
    } else {
      localStorage.removeItem(CONFIG_KEY);
    }
    setConfigState(cfg);
  }, []);

  const push = useCallback(async () => {
    if (!config) return;
    const dirty = Array.from(dirtyRef.current);
    if (dirty.length === 0) return;
    setSyncStatus('pushing');
    setSyncError(null);
    try {
      const next: RemoteFiles = { ...shasRef.current };
      for (const key of dirty) {
        const path = FILES[key];
        const current = dataRef.current;
        let payload: unknown;
        let shaKey: keyof RemoteFiles;
        switch (key) {
          case 'books':
            payload = current.books;
            shaKey = 'booksSha';
            break;
          case 'inbox':
            payload = current.inbox;
            shaKey = 'inboxSha';
            break;
          case 'dismissed':
            payload = current.dismissed;
            shaKey = 'dismissedSha';
            break;
          case 'prefs':
            payload = current.prefs;
            shaKey = 'prefsSha';
            break;
        }
        const newSha = await writeFile(
          config,
          path,
          payload,
          next[shaKey],
          `update ${path}`,
        );
        next[shaKey] = newSha;
        shasRef.current = { ...shasRef.current, [shaKey]: newSha };
        dirtyRef.current.delete(key);
        persistDirty(dirtyRef.current);
      }
      setShas(next);
      setLastSync(Date.now());
      setSyncStatus('idle');
    } catch (err) {
      setSyncStatus('error');
      setSyncError(err instanceof Error ? err.message : String(err));
    }
  }, [config]);

  const schedulePush = useCallback(
    (file: DirtyKey) => {
      dirtyRef.current.add(file);
      persistDirty(dirtyRef.current);
      if (pushTimerRef.current !== null) {
        window.clearTimeout(pushTimerRef.current);
      }
      pushTimerRef.current = window.setTimeout(() => {
        pushTimerRef.current = null;
        void push();
      }, PUSH_DEBOUNCE_MS);
    },
    [push],
  );

  const flushPush = useCallback(() => {
    if (pushTimerRef.current !== null) {
      window.clearTimeout(pushTimerRef.current);
      pushTimerRef.current = null;
    }
    if (dirtyRef.current.size > 0) {
      void push();
    }
  }, [push]);

  const pull = useCallback(async () => {
    if (!config) return;
    setSyncStatus('pulling');
    setSyncError(null);
    try {
      const [books, inbox, dismissed, prefs] = await Promise.all([
        readFile<Book[]>(config, FILES.books),
        readFile<InboxEntry[]>(config, FILES.inbox),
        readFile<Dismissed[]>(config, FILES.dismissed),
        readFile<ReaderPrefs>(config, FILES.prefs),
      ]);
      setData({
        books: books?.data ?? SEED_DATA.books,
        inbox: inbox?.data ?? [],
        dismissed: dismissed?.data ?? [],
        prefs: prefs?.data ?? SEED_DATA.prefs,
      });
      setShas({
        booksSha: books?.sha,
        inboxSha: inbox?.sha,
        dismissedSha: dismissed?.sha,
        prefsSha: prefs?.sha,
      });
      setLastSync(Date.now());
      setSyncStatus('idle');
    } catch (err) {
      setSyncStatus('error');
      setSyncError(err instanceof Error ? err.message : String(err));
    }
  }, [config]);

  const bootstrap = useCallback(async () => {
    if (!config) return;
    setSyncStatus('pushing');
    setSyncError(null);
    try {
      const [booksExisting, inboxExisting, dismissedExisting, prefsExisting] = await Promise.all([
        readFile<Book[]>(config, FILES.books),
        readFile<InboxEntry[]>(config, FILES.inbox),
        readFile<Dismissed[]>(config, FILES.dismissed),
        readFile<ReaderPrefs>(config, FILES.prefs),
      ]);
      const next: RemoteFiles = {};
      next.booksSha = await writeFile(
        config,
        FILES.books,
        SEED_DATA.books,
        booksExisting?.sha,
        booksExisting ? 'reset books to seed' : 'init books',
      );
      next.inboxSha = await writeFile(
        config,
        FILES.inbox,
        [],
        inboxExisting?.sha,
        inboxExisting ? 'reset inbox' : 'init inbox',
      );
      next.dismissedSha = await writeFile(
        config,
        FILES.dismissed,
        [],
        dismissedExisting?.sha,
        dismissedExisting ? 'reset dismissed' : 'init dismissed',
      );
      next.prefsSha = await writeFile(
        config,
        FILES.prefs,
        SEED_DATA.prefs,
        prefsExisting?.sha,
        prefsExisting ? 'reset prefs to seed' : 'init prefs',
      );
      setData(SEED_DATA);
      setShas(next);
      dirtyRef.current.clear();
      persistDirty(dirtyRef.current);
      setLastSync(Date.now());
      setSyncStatus('idle');
    } catch (err) {
      setSyncStatus('error');
      setSyncError(err instanceof Error ? err.message : String(err));
    }
  }, [config]);

  // on mount: push any dirty changes left from a previous session, then pull
  useEffect(() => {
    if (!config) return;
    (async () => {
      if (dirtyRef.current.size > 0) {
        await push();
      }
      await pull();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config?.pat, config?.repo, config?.branch]);

  // safety net: flush dirty when the tab is hidden / closed
  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') flushPush();
    };
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (dirtyRef.current.size > 0) {
        flushPush();
        e.preventDefault();
        e.returnValue = '';
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('beforeunload', onBeforeUnload);
    };
  }, [flushPush]);

  const cycleStatus = useCallback(
    (id: string) => {
      setData((d) => ({
        ...d,
        books: d.books.map((b) => {
          if (b.id !== id) return b;
          const i = STATUS_CYCLE.indexOf(b.status);
          const next = STATUS_CYCLE[(i + 1) % STATUS_CYCLE.length];
          const today = new Date().toISOString().slice(0, 10);
          const patch: Partial<Book> = { status: next };
          if (next === 'en-cours' && !b.start) patch.start = today;
          if (next === 'lu' && !b.end) patch.end = today;
          return { ...b, ...patch };
        }),
      }));
      schedulePush('books');
    },
    [schedulePush],
  );

  const setStatus = useCallback(
    (id: string, status: Status) => {
      setData((d) => ({
        ...d,
        books: d.books.map((b) => (b.id === id ? { ...b, status } : b)),
      }));
      schedulePush('books');
    },
    [schedulePush],
  );

  const startReading = useCallback(
    (id: string) => {
      setData((d) => {
        const book = d.books.find((b) => b.id === id);
        if (!book || book.status !== 'a-lire') return d;
        const today = new Date().toISOString().slice(0, 10);
        return {
          ...d,
          books: d.books.map((b) =>
            b.id === id ? { ...b, status: 'en-cours', start: b.start ?? today } : b,
          ),
        };
      });
      schedulePush('books');
    },
    [schedulePush],
  );

  const setNote = useCallback(
    (id: string, note: string) => {
      setData((d) => ({
        ...d,
        books: d.books.map((b) => (b.id === id ? { ...b, note } : b)),
      }));
      schedulePush('books');
    },
    [schedulePush],
  );

  const deleteBook = useCallback(
    (id: string) => {
      const book = dataRef.current.books.find((b) => b.id === id);
      setData((d) => ({ ...d, books: d.books.filter((b) => b.id !== id) }));
      schedulePush('books');
      if (book?.epubPath && config) {
        const cemeteryPath = book.epubPath.startsWith('epubs/')
          ? `cemetery/${book.epubPath.slice('epubs/'.length)}`
          : `cemetery/${book.epubPath.split('/').pop() ?? `${id}.epub`}`;
        moveFile(config, book.epubPath, cemeteryPath, `cemetery ${id}`).catch((err) => {
          console.error('Échec déplacement vers /cemetery:', err);
        });
      }
    },
    [config, schedulePush],
  );

  const addBook = useCallback(
    (book: Book) => {
      setData((d) => ({ ...d, books: [...d.books, book] }));
      schedulePush('books');
    },
    [schedulePush],
  );

  const updateBook = useCallback(
    (id: string, patch: Partial<Book>) => {
      setData((d) => ({
        ...d,
        books: d.books.map((b) => (b.id === id ? { ...b, ...patch } : b)),
      }));
      schedulePush('books');
    },
    [schedulePush],
  );

  const addPassage = useCallback(
    (id: string, passage: Passage) => {
      setData((d) => ({
        ...d,
        books: d.books.map((b) =>
          b.id === id ? { ...b, passages: [...b.passages, passage] } : b,
        ),
      }));
      schedulePush('books');
    },
    [schedulePush],
  );

  const acceptInbox = useCallback(
    (entryId: string) => {
      setData((d) => {
        const entry = d.inbox.find((e) => e.id === entryId);
        if (!entry) return d;
        const nextN = String(d.books.length + 1).padStart(2, '0');
        const newBook: Book = {
          id: `${nextN}-${entry.author.toLowerCase().replace(/[^a-z]+/g, '-')}-${entry.title
            .toLowerCase()
            .replace(/[^a-z]+/g, '-')
            .slice(0, 16)}`,
          n: nextN,
          title: entry.title,
          author: entry.author,
          year: entry.year,
          status: 'a-lire',
          spineSize: computeSpineSize(entry.title, entry.author),
          spineColor: '#3a3025',
          spineText: '#bfa97a',
          passages: [],
          source: entry.src,
          justif: entry.why,
          acquired: new Date().toISOString().slice(0, 10),
        };
        return {
          ...d,
          books: [...d.books, newBook],
          inbox: d.inbox.filter((e) => e.id !== entryId),
          dismissed: [
            ...d.dismissed,
            { key: dismissKey(entry), dismissedAt: new Date().toISOString() },
          ],
        };
      });
      schedulePush('books');
      schedulePush('inbox');
      schedulePush('dismissed');
    },
    [schedulePush],
  );

  const dismissInbox = useCallback(
    (entryId: string) => {
      setData((d) => {
        const entry = d.inbox.find((e) => e.id === entryId);
        if (!entry) return d;
        return {
          ...d,
          inbox: d.inbox.filter((e) => e.id !== entryId),
          dismissed: [
            ...d.dismissed,
            { key: dismissKey(entry), dismissedAt: new Date().toISOString() },
          ],
        };
      });
      schedulePush('inbox');
      schedulePush('dismissed');
    },
    [schedulePush],
  );

  const addInboxEntry = useCallback(
    (entry: InboxEntry) => {
      setData((d) => ({ ...d, inbox: [...d.inbox, entry] }));
      schedulePush('inbox');
    },
    [schedulePush],
  );

  const setPrefs = useCallback(
    (patch: Partial<ReaderPrefs>) => {
      setData((d) => ({ ...d, prefs: { ...d.prefs, ...patch } }));
      schedulePush('prefs');
    },
    [schedulePush],
  );

  const setReadPosition = useCallback(
    (bookId: string, cfi: string) => {
      setData((d) => ({
        ...d,
        prefs: {
          ...d.prefs,
          positions: { ...d.prefs.positions, [bookId]: cfi },
        },
      }));
      schedulePush('prefs');
    },
    [schedulePush],
  );

  const setLastRead = useCallback(
    (bookId: string) => {
      setData((d) => ({
        ...d,
        prefs: { ...d.prefs, lastReadId: bookId },
      }));
      schedulePush('prefs');
    },
    [schedulePush],
  );

  const importEpub = useCallback(
    async (input: ImportEpubInput): Promise<Book> => {
      if (!config) throw new Error('PAT et dépôt requis pour importer un epub.');
      const buffer = await input.file.arrayBuffer();
      const idBase = makeBookIdBase(input.author, input.title);
      const today = new Date().toISOString().slice(0, 10);
      const epubPath = `epubs/${idBase}.epub`;
      await writeEpubBytes(config, epubPath, buffer, `import ${input.title}`);
      const newBook: Book = {
        id: idBase,
        n: '',
        title: input.title.trim(),
        author: input.author.trim(),
        year: input.year,
        status: 'a-lire',
        spineSize: computeSpineSize(input.title, input.author),
        spineColor: '#3a3025',
        spineText: '#bfa97a',
        passages: [],
        epubPath,
        source: `IMPORT MANUEL — ${formatFrenchDateUpper()}`,
        acquired: today,
      };
      setData((d) => {
        const n = String(d.books.length + 1).padStart(2, '0');
        return { ...d, books: [...d.books, { ...newBook, n }] };
      });
      schedulePush('books');
      return newBook;
    },
    [config, schedulePush],
  );

  const attachEpub = useCallback(
    async (bookId: string, file: File): Promise<void> => {
      if (!config) throw new Error('PAT et dépôt requis pour joindre un fichier.');
      const buffer = await file.arrayBuffer();
      const epubPath = `epubs/${bookId}.epub`;
      await writeEpubBytes(config, epubPath, buffer, `attach epub to ${bookId}`);
      setData((d) => ({
        ...d,
        books: d.books.map((b) => (b.id === bookId ? { ...b, epubPath } : b)),
      }));
      schedulePush('books');
    },
    [config, schedulePush],
  );

  const triggerAcquisition = useCallback(
    async (bookId: string): Promise<void> => {
      if (!config) throw new Error('PAT et dépôt requis pour lancer l\'agent.');
      await dispatchWorkflow(config, 'acquisition.yml', { book_id: bookId });
    },
    [config],
  );

  const value = useMemo<StoreValue>(
    () => ({
      config,
      configured: Boolean(config?.pat && config?.repo),
      data,
      syncStatus,
      syncError,
      lastSync,
      setConfig,
      pull,
      bootstrap,
      cycleStatus,
      setStatus,
      startReading,
      setNote,
      deleteBook,
      addBook,
      updateBook,
      addPassage,
      acceptInbox,
      dismissInbox,
      addInboxEntry,
      setPrefs,
      setReadPosition,
      setLastRead,
      importEpub,
      attachEpub,
      triggerAcquisition,
    }),
    [
      config,
      data,
      syncStatus,
      syncError,
      lastSync,
      setConfig,
      pull,
      bootstrap,
      cycleStatus,
      setStatus,
      startReading,
      setNote,
      deleteBook,
      addBook,
      updateBook,
      addPassage,
      acceptInbox,
      dismissInbox,
      addInboxEntry,
      setPrefs,
      setReadPosition,
      setLastRead,
      importEpub,
      attachEpub,
      triggerAcquisition,
    ],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within a StoreProvider');
  return ctx;
}

function dismissKey(entry: InboxEntry): string {
  return `${entry.author.toLowerCase().trim()}::${entry.title.toLowerCase().trim()}`;
}

function makeBookIdBase(author: string, title: string): string {
  const surname =
    stripAccents(lastWord(author)).toLowerCase().replace(/[^a-z0-9]/g, '') || 'book';
  const titleSlug =
    stripAccents(title)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 20) || 'untitled';
  const stamp = Date.now().toString(36).slice(-4);
  return `${surname}-${titleSlug}-${stamp}`;
}

function lastWord(s: string): string {
  return s.trim().split(/\s+/).slice(-1)[0] ?? '';
}

function stripAccents(s: string): string {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '');
}
