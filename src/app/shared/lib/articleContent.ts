import SERVER_PATH from 'config/SERVER_PATH';

import type { ArticleBlock } from 'app/state/api/blog';

const ABSOLUTE_URL = /^(?:https?:)?\/\//i;
const DATA_URL = /^(?:data|blob):/i;

/** Безопасно склеивает путь к медиа статьи с её базовым адресом. */
export function resolveArticleMedia(file: string | undefined, baseUrl?: string): string {
  if (!file) return '';
  if (ABSOLUTE_URL.test(file)) return file;
  if (DATA_URL.test(file)) return /^data:image\//i.test(file) ? file : '';
  const dropboxMatch = file.match(/^dropbox:(\d+)$/i);
  if (dropboxMatch) return `${SERVER_PATH.replace(/\/+$/, '')}/dropbox/file/${dropboxMatch[1]}`;
  if (/^[a-z][a-z\d+.-]*:/i.test(file)) return '';

  const cleanFile = file.replace(/^\.?\//, '');
  if (baseUrl) {
    if (ABSOLUTE_URL.test(baseUrl)) return `${baseUrl.replace(/\/+$/, '')}/${cleanFile}`;
    if (baseUrl.startsWith('/')) return `${baseUrl.replace(/\/+$/, '')}/${cleanFile}`;
  }

  return `${SERVER_PATH.replace(/\/+$/, '')}/${cleanFile}`;
}

/** Проверяет, что URL можно использовать в src/href. */
export function isSafeMediaUrl(url: string): boolean {
  if (!url) return false;
  if (DATA_URL.test(url)) return /^data:image\//i.test(url);
  if (/^[a-z][a-z\d+.-]*:/i.test(url) && !/^https?:/i.test(url)) return false;
  return true;
}

/** Возвращает embed-ссылку YouTube или null для неподдерживаемого URL. */
export function getYouTubeEmbedUrl(rawUrl: string | undefined): string | null {
  if (!rawUrl) return null;

  let url: URL;
  try {
    url = new URL(rawUrl, 'https://www.youtube.com');
  } catch {
    return null;
  }

  const host = url.hostname.replace(/^www\./i, '').toLowerCase();
  const allowedHosts = new Set([
    'youtube.com',
    'm.youtube.com',
    'music.youtube.com',
    'youtube-nocookie.com',
    'youtu.be',
  ]);
  if (!allowedHosts.has(host)) return null;

  let videoId = '';
  if (host === 'youtu.be') {
    videoId = url.pathname.split('/').filter(Boolean)[0] || '';
  } else if (url.pathname === '/watch') {
    videoId = url.searchParams.get('v') || '';
  } else {
    const match = url.pathname.match(/^\/(?:embed|shorts|live)\/([^/?#]+)/i);
    videoId = match?.[1] || '';
  }

  if (!/^[A-Za-z0-9_-]{6,20}$/.test(videoId)) return null;
  return `https://www.youtube-nocookie.com/embed/${videoId}`;
}

function blockText(block: ArticleBlock): string {
  const value = block as Record<string, unknown>;
  const parts: string[] = [];

  if (typeof value.text === 'string') parts.push(value.text);
  if (typeof value.title === 'string') parts.push(value.title);
  if (typeof value.caption === 'string') parts.push(value.caption);
  if (typeof value.alt === 'string') parts.push(value.alt);

  if (Array.isArray(value.items)) {
    for (const item of value.items) {
      if (typeof item === 'string') parts.push(item);
      else if (item && typeof item === 'object') {
        const entry = item as Record<string, unknown>;
        if (typeof entry.title === 'string') parts.push(entry.title);
        if (typeof entry.text === 'string') parts.push(entry.text);
        if (typeof entry.caption === 'string') parts.push(entry.caption);
      }
    }
  }

  if (Array.isArray(value.headers)) {
    parts.push(...value.headers.filter((header): header is string => typeof header === 'string'));
  }

  if (Array.isArray(value.rows)) {
    for (const row of value.rows) {
      if (Array.isArray(row)) {
        parts.push(...row.filter((cell): cell is string => typeof cell === 'string'));
      }
    }
  }

  return parts.join(' ');
}

export function getBlocksPlainText(blocks: ArticleBlock[] | undefined): string {
  if (!Array.isArray(blocks)) return '';
  return blocks.map(blockText).join(' ').replace(/\s+/g, ' ').trim();
}
