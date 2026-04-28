import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { SegControl } from '../components/SegControl';
import { Spine } from '../components/Spine';
import { SHELF_HEIGHT, SPINE_WIDTH } from '../lib/spine';
import { compareByTitle } from '../lib/sort';
import type { Book } from '../types';
import './Bookcase.css';

type Sort = 'acquired' | 'auteur' | 'titre';
type Filter = 'tous' | 'lus' | 'non-lus';

const SORT_OPTIONS = [
  { value: 'acquired' as const, label: 'Acquisition' },
  { value: 'auteur' as const, label: 'Auteur' },
  { value: 'titre' as const, label: 'Titre' },
];

const FILTER_OPTIONS = [
  { value: 'tous' as const, label: 'Tous' },
  { value: 'lus' as const, label: 'Lus' },
  { value: 'non-lus' as const, label: 'Non lus' },
];

const SHELF_PADDING_X = 24;
const SPINE_GAP = 3;

interface Props {
  books: Book[];
  onOpenBook: (id: string) => void;
}

export function Bookcase({ books, onOpenBook }: Props) {
  const [sort, setSort] = useState<Sort>('acquired');
  const [filter, setFilter] = useState<Filter>('tous');
  const [shelfWidth, setShelfWidth] = useState(0);
  const measureRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = measureRef.current;
    if (!el) return;
    const update = () => setShelfWidth(el.clientWidth);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const sorted = useMemo(() => sortBooks(books, sort), [books, sort]);

  const shelves = useMemo(() => {
    if (shelfWidth === 0) return [sorted];
    const usable = Math.max(0, shelfWidth - SHELF_PADDING_X * 2);
    const perShelf = Math.max(1, Math.floor((usable + SPINE_GAP) / (SPINE_WIDTH + SPINE_GAP)));
    const chunks: Book[][] = [];
    for (let i = 0; i < sorted.length; i += perShelf) {
      chunks.push(sorted.slice(i, i + perShelf));
    }
    return chunks;
  }, [sorted, shelfWidth]);

  return (
    <div className="bookcase" ref={measureRef}>
      <div className="bookcase__controls">
        <div className="bookcase__group">
          <div className="bookcase__eyebrow">Classer par</div>
          <SegControl options={SORT_OPTIONS} value={sort} onChange={setSort} />
        </div>
        <div className="bookcase__group">
          <div className="bookcase__eyebrow">Filtrer</div>
          <SegControl options={FILTER_OPTIONS} value={filter} onChange={setFilter} />
        </div>
      </div>

      <div className="bookcase__shelves">
        {shelves.map((shelfBooks, i) => (
          <div className="bookcase__shelf" key={i}>
            <div className="bookcase__spines" style={{ height: `${SHELF_HEIGHT}px` }}>
              {shelfBooks.map((b) => (
                <Spine
                  key={b.id}
                  book={b}
                  dim={!matches(b, filter)}
                  onOpen={() => onOpenBook(b.id)}
                />
              ))}
            </div>
            <div className="bookcase__board" />
          </div>
        ))}
      </div>
    </div>
  );
}

function matches(book: Book, filter: Filter): boolean {
  if (filter === 'tous') return true;
  if (filter === 'lus') return book.status === 'lu';
  return book.status !== 'lu';
}

function sortBooks(books: Book[], sort: Sort): Book[] {
  const arr = [...books];
  if (sort === 'acquired') {
    arr.sort((a, b) => {
      const av = a.acquired ?? '';
      const bv = b.acquired ?? '';
      if (av && bv) return bv.localeCompare(av);
      if (av) return -1;
      if (bv) return 1;
      return a.n.localeCompare(b.n);
    });
  } else if (sort === 'auteur') {
    arr.sort((a, b) => {
      const al = surname(a.author);
      const bl = surname(b.author);
      return al.localeCompare(bl, 'fr');
    });
  } else {
    arr.sort(compareByTitle);
  }
  return arr;
}

function surname(name: string): string {
  const parts = name.trim().split(/\s+/);
  return parts[parts.length - 1] ?? name;
}
