const FR_LONG = new Intl.DateTimeFormat('fr-FR', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

export function formatFrenchDate(s?: string): string {
  if (!s) return '—';
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return s;
  return FR_LONG.format(d);
}

export function formatFrenchDateUpper(date: Date = new Date()): string {
  return FR_LONG.format(date).toUpperCase();
}
