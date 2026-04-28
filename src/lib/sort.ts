import type { Book, Status } from '../types';

const LEADING_ARTICLE = /^(L'|Le |La |Les |Un |Une |Des |Du )/i;

export function titleSortKey(title: string): string {
  return title.replace(LEADING_ARTICLE, '');
}

export function compareByTitle(a: Book, b: Book): number {
  return titleSortKey(a.title).localeCompare(titleSortKey(b.title), 'fr', {
    sensitivity: 'base',
  });
}

const STATUS_ORDER: Record<Status, number> = {
  'en-cours': 0,
  'a-lire': 1,
  lu: 2,
  abandonne: 3,
};

export function compareByStatusThenTitle(a: Book, b: Book): number {
  const s = STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
  if (s !== 0) return s;
  return compareByTitle(a, b);
}
