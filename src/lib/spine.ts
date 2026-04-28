import type { SpineSize } from '../types';

export const SPINE_WIDTH = 28;

export const SPINE_HEIGHT: Record<SpineSize, number> = {
  short: 215,
  medium: 250,
  tall: 300,
};

export const SHELF_HEIGHT = SPINE_HEIGHT.tall;

export function spineSurname(author: string): string {
  return author.trim().split(/\s+/).slice(-1)[0] ?? author;
}

export function computeSpineSize(title: string, author: string): SpineSize {
  const len = title.length + spineSurname(author).length;
  if (len <= 18) return 'short';
  if (len <= 27) return 'medium';
  return 'tall';
}
