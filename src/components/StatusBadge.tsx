import type { Status } from '../types';
import './StatusBadge.css';

const LABELS: Record<Status, string> = {
  'a-lire': 'À lire',
  'en-cours': 'En cours',
  lu: 'Lu',
  abandonne: 'Abandonné',
};

interface Props {
  status: Status;
  onTap?: () => void;
  as?: 'button' | 'span';
}

export function StatusBadge({ status, onTap, as = 'span' }: Props) {
  const Tag = as;
  const props: Record<string, unknown> =
    as === 'button'
      ? {
          type: 'button',
          onClick: (e: React.MouseEvent) => {
            e.stopPropagation();
            onTap?.();
          },
          'aria-label': `Statut : ${LABELS[status]}. Toucher pour changer.`,
        }
      : {};
  return (
    <Tag className={`badge badge--${status}`} {...props}>
      <span className="badge__dot" />
      <span className="badge__label">{LABELS[status]}</span>
    </Tag>
  );
}
