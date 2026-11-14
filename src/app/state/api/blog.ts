/**
 * Модуль api для статей и комментариев.
 *
 * Действия сохранены по контракту AGENTS.md. Источник данных переключается
 * через CONFIG.BLOG.source / REACT_APP_BLOG_SOURCE:
 *  - "local" — каталог из public/articles, собранный из ZIP-архивов docs/;
 *  - "api"   — штатный бэкенд script/template/repair_api_test_page.
 *
 * В обоих режимах статьи формата 1.3 отдаются как blocks и рендерятся
 * единым ArticleRenderer.
 */
import CONFIG from 'config';

import { getBlocksPlainText, resolveArticleMedia } from 'app/shared/lib/articleContent';

import {
  getLocalBlogArticleById,
  getLocalBlogArticles,
  type ArticleAsset,
  type ArticleBlock,
} from './localArticles';
import {
  addLocalBlogPost,
  deleteLocalBlogPost,
  editLocalBlogPost,
  getLocalBlogPosts,
} from './localComments';
import { post } from './request';

export type { ArticleAsset, ArticleBlock };

export type BlogAuthor = {
  id: number;
  name: string;
  avatar: string;
  role: number;
};

export type BlogArticle = {
  id: number;
  topic_id: number;
  topic_name: string;
  title: string;
  content?: string;
  excerpt: string;
  cover_url: string | null;
  cover_file_id?: number | null;
  author: BlogAuthor;
  created_at: string;
  published_at?: string | null;
  updated_at: string | null;
  comments_count: number;
  format_version?: string;
  blocks?: ArticleBlock[];
  assets?: ArticleAsset[];
  technical_knowledge?: unknown;
  media_base_url?: string;
  source?: 'api' | 'local';
};

export type BlogComment = {
  id: number;
  article_id: number;
  parent_id: number | null;
  author: BlogAuthor;
  text: string;
  created_at: string;
  updated_at: string | null;
  deleted: boolean;
  can_edit: boolean;
  can_delete: boolean;
};

type ParsedArticleContent = {
  format_version?: string;
  summary?: string;
  media_base_url?: string;
  blocks: ArticleBlock[];
  assets?: ArticleAsset[];
  technical_knowledge?: unknown;
  cover?: { file?: string };
  cover_file_id?: number;
};

function buildExcerpt(text: string, limit = 240): string {
  const trimmed = text.replace(/\s+/g, ' ').trim();
  if (!trimmed) return '';
  const chars = Array.from(trimmed);
  if (chars.length <= limit) return trimmed;
  return `${chars.slice(0, limit).join('').trimEnd()}…`;
}

function deriveMediaBaseUrl(coverUrl: string | null | undefined): string | undefined {
  if (!coverUrl) return undefined;
  const index = coverUrl.indexOf('/media/');
  if (index === -1) return undefined;
  return coverUrl.slice(0, index + 1);
}

const BLOG_SOURCE = process.env.REACT_APP_BLOG_SOURCE || CONFIG.BLOG?.source || 'local';
const BLOG_API_PATH = process.env.REACT_APP_BLOG_API_PATH || 'script/template/repair_api_test_page';
const BLOG_API_IS_VAR = process.env.REACT_APP_BLOG_API_IS_VAR !== '0';

function buildBlogPayload(data: Record<string, unknown>) {
  return {
    ...(BLOG_API_IS_VAR ? { is_var: 1 } : {}),
    s_t_data: data,
  };
}

export const isLocalBlogSource = BLOG_SOURCE === 'local';

/** Разбирает content, если бэкенд хранит статью как JSON формата 1.3. */
export function parseArticleContent(content: string | undefined): ParsedArticleContent | null {
  if (!content) return null;
  const trimmed = content.trim();
  if (!trimmed.startsWith('{')) return null;

  try {
    const parsed = JSON.parse(trimmed) as Partial<ParsedArticleContent>;
    if (!parsed || !Array.isArray(parsed.blocks)) return null;
    return {
      format_version: parsed.format_version,
      summary: typeof parsed.summary === 'string' ? parsed.summary : undefined,
      media_base_url: typeof parsed.media_base_url === 'string' ? parsed.media_base_url : undefined,
      blocks: parsed.blocks,
      assets: parsed.assets,
      technical_knowledge: parsed.technical_knowledge,
      cover: parsed.cover,
      cover_file_id: typeof parsed.cover_file_id === 'number' ? parsed.cover_file_id : undefined,
    };
  } catch {
    return null;
  }
}

export function normalizeBlogArticleContent(article: BlogArticle): BlogArticle {
  const parsed = parseArticleContent(article.content);
  if (!parsed) return article;

  const mediaBaseUrl = parsed.media_base_url || article.media_base_url;
  const coverAsset = parsed.cover?.file
    ? [
        ...(Array.isArray(article.assets) ? article.assets : []),
        ...(Array.isArray(parsed.assets) ? parsed.assets : []),
      ].find(
        (asset) =>
          asset?.file === parsed.cover?.file &&
          Number.isSafeInteger(Number(asset.dl_id)) &&
          Number(asset.dl_id) > 0,
      )
    : undefined;
  const coverUrl = coverAsset
    ? `dropbox:${Number(coverAsset.dl_id)}`
    : parsed.cover?.file
      ? resolveArticleMedia(parsed.cover.file, mediaBaseUrl)
      : article.cover_url;
  const parsedText = parsed.summary?.trim() || getBlocksPlainText(parsed.blocks);
  // API may return Dropbox assets beside `content`, while older Article Format 1.3
  // payloads embed them inside the JSON content. Keep both shapes working.
  const assetsByFile = new Map();
  for (const asset of [
    ...(Array.isArray(article.assets) ? article.assets : []),
    ...(Array.isArray(parsed.assets) ? parsed.assets : []),
  ]) {
    if (asset?.file) assetsByFile.set(asset.file, asset);
  }
  const assets = Array.from(assetsByFile.values());

  return {
    ...article,
    excerpt: parsedText ? buildExcerpt(parsedText) : article.excerpt,
    cover_url: coverUrl || article.cover_url,
    cover_file_id: parsed.cover_file_id || article.cover_file_id,
    media_base_url: mediaBaseUrl || deriveMediaBaseUrl(coverUrl),
    format_version: parsed.format_version || article.format_version || '1.3',
    blocks: parsed.blocks,
    technical_knowledge: parsed.technical_knowledge,
  };
}

export async function getBlogTopics(): Promise<BlogArticle[]> {
  if (isLocalBlogSource) return getLocalBlogArticles();

  const payload = buildBlogPayload({ action: 'getBlogTopics' });
  const articles = await post<BlogArticle[]>(BLOG_API_PATH, payload);
  return articles.map(normalizeBlogArticleContent);
}

export async function getBlogTopicById(id: number): Promise<BlogArticle> {
  if (isLocalBlogSource) return getLocalBlogArticleById(id);

  const payload = buildBlogPayload({ action: 'getBlogTopicById', id });
  const article = await post<BlogArticle>(BLOG_API_PATH, payload);
  return normalizeBlogArticleContent(article);
}

export async function getBlogPosts(articleId: number, viewerId = 0): Promise<BlogComment[]> {
  if (isLocalBlogSource) return getLocalBlogPosts(articleId, viewerId);

  const payload = buildBlogPayload({
    action: 'getBlogPosts',
    article_id: articleId,
  });
  return post<BlogComment[]>(BLOG_API_PATH, payload);
}

export async function addBlogPost(params: {
  articleId: number;
  parentId?: number | null;
  text: string;
  author?: BlogAuthor;
}): Promise<{ id: number }> {
  if (isLocalBlogSource) {
    return addLocalBlogPost({
      articleId: params.articleId,
      parentId: params.parentId,
      text: params.text,
      author: params.author,
    });
  }

  const payload = buildBlogPayload({
    action: 'addBlogPost',
    article_id: params.articleId,
    parent_id: params.parentId ?? undefined,
    text: params.text,
  });
  return post<{ id: number }>(BLOG_API_PATH, payload);
}

export async function editBlogPost(params: {
  id: number;
  text: string;
  viewerId?: number;
}): Promise<{ ok: boolean }> {
  if (isLocalBlogSource) {
    return editLocalBlogPost({
      id: params.id,
      text: params.text,
      viewerId: params.viewerId || 0,
    });
  }

  const payload = buildBlogPayload({
    action: 'editBlogPost',
    id: params.id,
    text: params.text,
  });
  return post<{ ok: boolean }>(BLOG_API_PATH, payload);
}

export async function deleteBlogPost(id: number, viewerId = 0): Promise<{ ok: boolean }> {
  if (isLocalBlogSource) {
    return deleteLocalBlogPost({ id, viewerId });
  }

  const payload = buildBlogPayload({
    action: 'deleteBlogPost',
    id,
  });
  return post<{ ok: boolean }>(BLOG_API_PATH, payload);
}