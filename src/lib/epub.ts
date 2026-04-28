import ePub from 'epubjs';
import { fetchEpubBytes } from './github';
import type { SyncConfig } from '../types';

export async function loadEpubBytes(
  epubPath: string,
  config: SyncConfig | null,
): Promise<ArrayBuffer> {
  // In dev, Vite serves index.html for unknown routes — so a fetch to
  // /epubs/<imported-id>.epub returns the SPA shell. Validate magic bytes
  // before accepting the local response.
  if (import.meta.env.DEV) {
    try {
      const url = import.meta.env.BASE_URL + epubPath;
      const res = await fetch(url);
      if (res.ok) {
        const buffer = await res.arrayBuffer();
        if (isEpub(buffer)) return buffer;
      }
    } catch {
      // fall through to GitHub
    }
  }
  if (!config) {
    throw new Error("Le PAT et le dépôt doivent être configurés pour charger l'epub.");
  }
  return fetchEpubBytes(config, epubPath);
}

function isEpub(buffer: ArrayBuffer): boolean {
  if (buffer.byteLength < 4) return false;
  const bytes = new Uint8Array(buffer, 0, 4);
  return bytes[0] === 0x50 && bytes[1] === 0x4b && bytes[2] === 0x03 && bytes[3] === 0x04;
}

export interface EpubMetadata {
  title: string;
  author: string;
  year?: number;
}

export async function parseEpubMetadata(buffer: ArrayBuffer): Promise<EpubMetadata> {
  const book = ePub(buffer);
  try {
    await book.ready;
    const meta = (await book.loaded.metadata) as {
      title?: string;
      creator?: string;
      pubdate?: string;
    };
    const year = meta.pubdate ? parseYear(meta.pubdate) : undefined;
    return {
      title: (meta.title ?? '').trim(),
      author: (meta.creator ?? '').trim(),
      year,
    };
  } finally {
    try {
      book.destroy();
    } catch {
      // ignore
    }
  }
}

function parseYear(raw: string): number | undefined {
  const m = raw.match(/(\d{4})/);
  if (!m) return undefined;
  const n = Number(m[1]);
  return Number.isFinite(n) ? n : undefined;
}
