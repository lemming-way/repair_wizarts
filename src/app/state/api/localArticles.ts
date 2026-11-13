/**
 * Локальный каталог статей, собранный из ZIP-архивов docs/ скриптом
 * `scripts/build-articles.mjs` в public/articles.
 *
 * Используется, пока статьи не импортированы в БД бэкенда (или при
 * REACT_APP_BLOG_SOURCE=local). Формат данных — Article Format 1.3.
 */
import type { BlogArticle } from './blog';

export type ArticleBlock = {
  type: string;
  [key: string]: unknown;
};

export type ArticleAsset = {
  file: string;
  type: string;
  format?: string;
  size_bytes?: number;
  dl_id?: number | string;
};

export type ArticleTopic = {
  name: string;
  path: string[];
};

export type LocalArticleMeta = {
  id: number;
  slug: string;
  format_version: string;
  title: string;
  summary: string;
  topic: ArticleTopic;
  cover: string | null;
  cover_url: string | null;
  base_path: string;
  author: BlogArticle['author'];
  created_at: string;
  updated_at: string | null;
  comments_count: number;
  blocks_count: number;
};

type LocalCatalog = {
  format_version: string;
  generated_at: string;
  source: string;
  articles: LocalArticleMeta[];
};

type LocalArticleFile = {
  format_version: string;
  title: string;
  summary: string;
  topic: ArticleTopic;
  cover?: { file: string; alt?: string };
  assets: ArticleAsset[];
  blocks: ArticleBlock[];
  technical_knowledge?: unknown;
};

const PUBLIC_URL = (process.env.PUBLIC_URL || '').replace(/\/+$/, '');
const CATALOG_PATH = '/articles/catalog.json';

let catalogPromise: Promise<LocalCatalog> | null = null;
const articlePromises = new Map<number, Promise<BlogArticle>>();

function withPublicUrl(pathname: string): string {
  const normalized = pathname.startsWith('/') ? pathname : `/${pathname}`;
  return `${PUBLIC_URL}${normalized}`;
}

function toAbsoluteUrl(pathname: string): string {
  if (/^(?:https?:)?\/\//i.test(pathname) || /^(?:data|blob):/i.test(pathname)) return pathname;
  if (typeof window === 'undefined') return pathname;
  return new URL(withPublicUrl(pathname), window.location.href).toString();
}

function assertCatalog(value: unknown): LocalCatalog {
  if (!value || typeof value !== 'object' || !Array.isArray((value as LocalCatalog).articles)) {
    throw new Error('Некорректный локальный каталог статей.');
  }
  return value as LocalCatalog;
}

function assertArticleFile(value: unknown): LocalArticleFile {
  if (!value || typeof value !== 'object' || !Array.isArray((value as LocalArticleFile).blocks)) {
    throw new Error('Некорректный JSON статьи.');
  }
  return value as LocalArticleFile;
}

export function getLocalArticleCatalog(): Promise<LocalCatalog> {
  if (!catalogPromise) {
    catalogPromise = fetch(withPublicUrl(CATALOG_PATH), { cache: 'no-cache' })
      .then((response) => {
        if (!response.ok)
          throw new Error(`Не удалось загрузить каталог статей (${response.status}).`);
        return response.json();
      })
      .then(assertCatalog)
      .catch((error) => {
        catalogPromise = null;
        throw error;
      });
  }

  return catalogPromise;
}

function metaToArticle(meta: LocalArticleMeta): BlogArticle {
  return {
    id: meta.id,
    topic_id: 0,
    topic_name: meta.topic?.name || 'Статьи',
    title: meta.title,
    excerpt: meta.summary,
    cover_url: meta.cover_url ? toAbsoluteUrl(meta.cover_url) : null,
    author: meta.author,
    created_at: meta.created_at,
    updated_at: meta.updated_at,
    comments_count: meta.comments_count || 0,
    format_version: meta.format_version,
    source: 'local',
    media_base_url: `${PUBLIC_URL}${meta.base_path}`,
  };
}

export async function getLocalBlogArticles(): Promise<BlogArticle[]> {
  const catalog = await getLocalArticleCatalog();
  return catalog.articles.map(metaToArticle);
}

export function getLocalBlogArticleById(id: number): Promise<BlogArticle> {
  const cached = articlePromises.get(id);
  if (cached) return cached;

  const promise = getLocalArticleCatalog()
    .then((catalog) => {
      const meta = catalog.articles.find((article) => article.id === id);
      if (!meta) throw new Error('Статья не найдена.');

      return fetch(withPublicUrl(`${meta.base_path}article.json`), { cache: 'no-cache' })
        .then((response) => {
          if (!response.ok) throw new Error(`Не удалось загрузить статью (${response.status}).`);
          return response.json();
        })
        .then((raw) => {
          const article = assertArticleFile(raw);
          return {
            ...metaToArticle(meta),
            title: article.title || meta.title,
            excerpt: article.summary || meta.summary,
            blocks: article.blocks,
            assets: article.assets,
            technical_knowledge: article.technical_knowledge,
            format_version: article.format_version || meta.format_version,
          };
        });
    })
    .catch((error) => {
      articlePromises.delete(id);
      throw error;
    });

  articlePromises.set(id, promise);
  return promise;
}

/** Сброс кэша (используется в тестах). */
export function resetLocalArticleCache() {
  catalogPromise = null;
  articlePromises.clear();
}
