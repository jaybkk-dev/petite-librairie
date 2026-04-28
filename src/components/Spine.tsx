import type { Book } from '../types';
import { SPINE_HEIGHT, SPINE_WIDTH, spineSurname } from '../lib/spine';
import './Spine.css';

interface Props {
  book: Book;
  dim: boolean;
  onOpen: () => void;
}

export function Spine({ book, dim, onOpen }: Props) {
  const h = SPINE_HEIGHT[book.spineSize ?? 'medium'];
  const isAbandoned = book.status === 'abandonne';
  const opacity = dim ? 0.5 : isAbandoned ? 0.55 : 1;
  const surname = spineSurname(book.author);

  return (
    <button
      type="button"
      className="spine"
      style={{
        width: SPINE_WIDTH,
        height: h,
        background: book.spineColor,
        color: book.spineText,
        opacity,
      }}
      onClick={onOpen}
      aria-label={`${book.title}, ${book.author}`}
    >
      <span className="spine__rib spine__rib--t1" style={{ background: book.spineText }} />
      <span className="spine__rib spine__rib--t2" style={{ background: book.spineText }} />
      <span className="spine__rib spine__rib--b1" style={{ background: book.spineText }} />
      <span className="spine__rib spine__rib--b2" style={{ background: book.spineText }} />
      <span className="spine__inner">
        <span className="spine__title" title={book.title}>
          {book.title}
        </span>
        <span className="spine__surname" style={{ color: book.spineText }}>
          {surname}
        </span>
      </span>
    </button>
  );
}
