export type Status = 'a-lire' | 'en-cours' | 'lu' | 'abandonne';

export type SpineSize = 'short' | 'medium' | 'tall';

export interface Passage {
  text: string;
  page: number;
  savedAt: string;
}

export interface AcquisitionBlock {
  platform?: string;
  price?: string;
  drm?: string;
  bangkok?: string;
  url?: string;
  message?: string;
}

export interface Book {
  id: string;
  n: string;
  title: string;
  author: string;
  year: number;
  status: Status;
  start?: string;
  end?: string;
  source?: string;
  note?: string;
  justif?: string;
  spineSize: SpineSize;
  spineColor: string;
  spineText: string;
  passages: Passage[];
  acquisition?: AcquisitionBlock;
  epubPath?: string;
  acquired?: string;
}

export interface InboxEntry {
  id: string;
  title: string;
  author: string;
  year: number;
  src: string;
  why: string;
  pipeline?: 'new' | 'backlist' | 'manual';
  addedAt: string;
}

export interface ReaderPrefs {
  fontSize: number;
  nightMode: boolean;
  positions: Record<string, string>;
  lastReadId?: string;
}

export interface Dismissed {
  key: string;
  dismissedAt: string;
}

export interface AppData {
  books: Book[];
  inbox: InboxEntry[];
  dismissed: Dismissed[];
  prefs: ReaderPrefs;
}

export interface SyncConfig {
  pat: string;
  repo: string;
  branch: string;
}
