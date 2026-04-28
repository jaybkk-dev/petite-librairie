import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import './NotesEditor.css';

interface Props {
  value: string;
  onSave: (next: string) => void;
}

export function NotesEditor({ value, onSave }: Props) {
  const [draft, setDraft] = useState(value);
  const ref = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [draft]);

  const commit = () => {
    if (draft !== value) onSave(draft);
  };

  return (
    <textarea
      ref={ref}
      className="notes-editor"
      placeholder="Saisir une note…"
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      rows={1}
    />
  );
}
