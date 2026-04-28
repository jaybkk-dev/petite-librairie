export function authorWikipediaURL(name: string): string {
  const slug = name.trim().replace(/\s+/g, '_');
  return `https://fr.wikipedia.org/wiki/${encodeURIComponent(slug)}`;
}
