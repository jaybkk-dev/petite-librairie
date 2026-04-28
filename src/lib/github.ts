import type { SyncConfig } from '../types';

const API = 'https://api.github.com';

interface FileResult<T> {
  data: T;
  sha: string;
}

interface ContentsResponse {
  content: string;
  sha: string;
  encoding: string;
}

export class GitHubError extends Error {
  constructor(message: string, public readonly status?: number) {
    super(message);
    this.name = 'GitHubError';
  }
}

function headers(cfg: SyncConfig): HeadersInit {
  return {
    Authorization: `Bearer ${cfg.pat}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };
}

function b64encode(s: string): string {
  return btoa(unescape(encodeURIComponent(s)));
}

function b64decode(s: string): string {
  return decodeURIComponent(escape(atob(s.replace(/\n/g, ''))));
}

export async function checkRepo(cfg: SyncConfig): Promise<boolean> {
  const res = await fetch(`${API}/repos/${cfg.repo}`, { headers: headers(cfg) });
  if (res.status === 404) return false;
  if (!res.ok) throw new GitHubError(`Échec d'accès au dépôt (${res.status})`, res.status);
  return true;
}

export async function readFile<T>(cfg: SyncConfig, path: string): Promise<FileResult<T> | null> {
  const url = `${API}/repos/${cfg.repo}/contents/${path}?ref=${cfg.branch}`;
  const res = await fetch(url, { headers: headers(cfg) });
  if (res.status === 404) return null;
  if (!res.ok) throw new GitHubError(`Échec de lecture ${path} (${res.status})`, res.status);
  const json = (await res.json()) as ContentsResponse;
  const text = b64decode(json.content);
  return { data: JSON.parse(text) as T, sha: json.sha };
}

export async function writeFile(
  cfg: SyncConfig,
  path: string,
  data: unknown,
  sha: string | undefined,
  message: string,
): Promise<string> {
  const url = `${API}/repos/${cfg.repo}/contents/${path}`;
  const body: Record<string, unknown> = {
    message,
    content: b64encode(JSON.stringify(data, null, 2) + '\n'),
    branch: cfg.branch,
  };
  if (sha) body.sha = sha;
  const res = await fetch(url, {
    method: 'PUT',
    headers: { ...headers(cfg), 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new GitHubError(`Échec d'écriture ${path} (${res.status}): ${text}`, res.status);
  }
  const json = (await res.json()) as { content: { sha: string } };
  return json.content.sha;
}

export interface RemoteFiles {
  booksSha?: string;
  inboxSha?: string;
  dismissedSha?: string;
  prefsSha?: string;
}

export async function dispatchWorkflow(
  cfg: SyncConfig,
  workflow: string,
  inputs: Record<string, string>,
): Promise<void> {
  const url = `${API}/repos/${cfg.repo}/actions/workflows/${workflow}/dispatches`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { ...headers(cfg), 'Content-Type': 'application/json' },
    body: JSON.stringify({ ref: cfg.branch, inputs }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new GitHubError(
      `Échec de déclenchement de l'action ${workflow} (${res.status}): ${text}`,
      res.status,
    );
  }
}

export async function fetchEpubBytes(cfg: SyncConfig, path: string): Promise<ArrayBuffer> {
  const url = `${API}/repos/${cfg.repo}/contents/${path}?ref=${cfg.branch}`;
  const res = await fetch(url, {
    headers: { ...headers(cfg), Accept: 'application/vnd.github.raw' },
  });
  if (!res.ok) {
    throw new GitHubError(`Échec de lecture epub (${res.status})`, res.status);
  }
  return res.arrayBuffer();
}

export async function getFileSha(cfg: SyncConfig, path: string): Promise<string | undefined> {
  const url = `${API}/repos/${cfg.repo}/contents/${path}?ref=${cfg.branch}`;
  const res = await fetch(url, { headers: headers(cfg) });
  if (res.status === 404) return undefined;
  if (!res.ok) throw new GitHubError(`Échec de lecture ${path} (${res.status})`, res.status);
  const json = (await res.json()) as { sha: string };
  return json.sha;
}

export async function writeEpubBytes(
  cfg: SyncConfig,
  path: string,
  buffer: ArrayBuffer,
  message: string,
): Promise<string> {
  const sha = await getFileSha(cfg, path);
  const url = `${API}/repos/${cfg.repo}/contents/${path}`;
  const body: Record<string, unknown> = {
    message,
    content: bytesToBase64(buffer),
    branch: cfg.branch,
  };
  if (sha) body.sha = sha;
  const res = await fetch(url, {
    method: 'PUT',
    headers: { ...headers(cfg), 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new GitHubError(`Échec d'écriture ${path} (${res.status}): ${text}`, res.status);
  }
  const json = (await res.json()) as { content: { sha: string } };
  return json.content.sha;
}

export async function moveFile(
  cfg: SyncConfig,
  fromPath: string,
  toPath: string,
  message: string,
): Promise<void> {
  const fromUrl = `${API}/repos/${cfg.repo}/contents/${fromPath}?ref=${cfg.branch}`;
  const fromRes = await fetch(fromUrl, {
    headers: { ...headers(cfg), Accept: 'application/vnd.github.raw' },
  });
  if (fromRes.status === 404) return;
  if (!fromRes.ok) {
    throw new GitHubError(`Échec de lecture ${fromPath} (${fromRes.status})`, fromRes.status);
  }
  const buffer = await fromRes.arrayBuffer();
  await writeEpubBytes(cfg, toPath, buffer, message);
  const fromSha = await getFileSha(cfg, fromPath);
  if (!fromSha) return;
  const delRes = await fetch(`${API}/repos/${cfg.repo}/contents/${fromPath}`, {
    method: 'DELETE',
    headers: { ...headers(cfg), 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, sha: fromSha, branch: cfg.branch }),
  });
  if (!delRes.ok) {
    const text = await delRes.text();
    throw new GitHubError(`Échec de suppression ${fromPath} (${delRes.status}): ${text}`, delRes.status);
  }
}

function bytesToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode.apply(null, Array.from(bytes.subarray(i, i + chunk)));
  }
  return btoa(binary);
}
