import SERVER_PATH from 'config/SERVER_PATH';

import { BlogComment } from 'app/state/api/blog';

export type BlogCommentNode = BlogComment & {
  children: BlogCommentNode[];
};

export function resolveMediaUrl(src: string | null | undefined): string {
  if (!src) return '';
  if (/^(?:https?:)?\/\//i.test(src) || /^(?:data|blob):/i.test(src)) return src;
  const dropboxMatch = src.match(/^dropbox:(\d+)$/i);
  if (dropboxMatch) return `${SERVER_PATH.replace(/\/+$/, '')}/dropbox/file/${dropboxMatch[1]}`;

  return `${SERVER_PATH.replace(/\/+$/, '')}/${src.replace(/^\/+/, '')}`;
}

export function stripHtml(html: string): string {
  if (!html) return '';

  if (typeof DOMParser !== 'undefined') {
    try {
      const doc = new DOMParser().parseFromString(html, 'text/html');
      doc.querySelectorAll('script, style').forEach((node) => node.remove());
      return (doc.body.textContent || '').replace(/\s+/g, ' ').trim();
    } catch {
      // fall through to the regex implementation
    }
  }

  return html
    .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

export function getArticleExcerpt(html: string, limit = 240): string {
  const text = stripHtml(html);
  const chars = Array.from(text);
  if (chars.length <= limit) return text;
  return `${chars.slice(0, limit).join('').trimEnd()}…`;
}

export function getArticleCover(html: string): string | null {
  if (!html) return null;

  const quoted = html.match(/<img\b[^>]*\bsrc\s*=\s*(["'])(.*?)\1/is);
  const unquoted = quoted ? null : html.match(/<img\b[^>]*\bsrc\s*=\s*([^\s>]+)/is);
  const cover = quoted?.[2] ?? unquoted?.[1];
  if (!cover) return null;

  const trimmed = cover.trim();
  if (!/^(?:https?:)?\/\/|^\/|^data:image\//i.test(trimmed)) return null;
  return trimmed;
}

export function buildCommentTree(comments: BlogComment[]): BlogCommentNode[] {
  const nodes = new Map<number, BlogCommentNode>();
  const roots: BlogCommentNode[] = [];

  const sorted = [...comments].sort((a, b) => a.id - b.id);
  for (const comment of sorted) {
    nodes.set(comment.id, { ...comment, children: [] });
  }

  for (const comment of sorted) {
    const node = nodes.get(comment.id);
    if (!node) continue;

    const parent = comment.parent_id === null ? undefined : nodes.get(comment.parent_id);
    if (parent) parent.children.push(node);
    else roots.push(node);
  }

  return roots;
}

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) return '?';
  if (parts.length === 1) return Array.from(parts[0]).slice(0, 2).join('').toUpperCase();

  return parts
    .slice(0, 2)
    .map((part) => Array.from(part)[0] ?? '')
    .join('')
    .toUpperCase();
}

export function countUnicodeChars(value: string): number {
  return Array.from(value).length;
}

export function formatBlogDateTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  return new Intl.DateTimeFormat('ru', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
    .format(date)
    .replace(' г.', '');
}
