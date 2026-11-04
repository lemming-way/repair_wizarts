/**
 * Модуль api для статей и комментариев.
 *
 * Действия сохранены по контракту AGENTS.md. Источник данных переключается
 * через CONFIG.BLOG.source / REACT_APP_BLOG_SOURCE:
 *  - "local" — каталог из public/articles, собранный из ZIP-архивов docs/;
 *  - "api"   — штатный бэкенд script/template/repair_api.
 *
 * В обоих режимах статьи формата 1.3 отдаются как blocks и рендерятся
 * единым ArticleRenderer.
 */
import CONFIG from 'config';

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
  author: BlogAuthor;
  created_at: string;
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
  blocks: ArticleBlock[];
  assets?: ArticleAsset[];
  technical_knowledge?: unknown;
  cover?: { file?: string };
};

const BLOG_SOURCE = process.env.REACT_APP_BLOG_SOURCE || CONFIG.BLOG?.source || 'local';

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
      blocks: parsed.blocks,
      assets: parsed.assets,
      technical_knowledge: parsed.technical_knowledge,
      cover: parsed.cover,
    };
  } catch {
    return null;
  }
}

function withParsedContent(article: BlogArticle): BlogArticle {
  const parsed = parseArticleContent(article.content);
  if (!parsed) return article;

  return {
    ...article,
    format_version: parsed.format_version || article.format_version || '1.3',
    blocks: parsed.blocks,
    assets: parsed.assets,
    technical_knowledge: parsed.technical_knowledge,
  };
}

export async function getBlogTopics(): Promise<BlogArticle[]> {
  if (isLocalBlogSource) return getLocalBlogArticles();

  const payload = {
    is_var: 1,
    s_t_data: {
      action: 'getBlogTopics',
    },
  };
  const articles = await post<BlogArticle[]>('script/template/repair_api', payload);
  return articles.map(withParsedContent);
}

export async function getBlogTopicById(id: number): Promise<BlogArticle> {
  if (isLocalBlogSource) return getLocalBlogArticleById(id);

  const payload = {
    is_var: 1,
    s_t_data: {
      action: 'getBlogTopicById',
      id,
    },
  };
  const article = await post<BlogArticle>('script/template/repair_api', payload);
  return withParsedContent(article);
}

export async function getBlogPosts(articleId: number, viewerId = 0): Promise<BlogComment[]> {
  if (isLocalBlogSource) return getLocalBlogPosts(articleId, viewerId);

  const payload = {
    is_var: 1,
    s_t_data: {
      action: 'getBlogPosts',
      article_id: articleId,
    },
  };
  return post<BlogComment[]>('script/template/repair_api', payload);
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

  const payload = {
    is_var: 1,
    s_t_data: {
      action: 'addBlogPost',
      article_id: params.articleId,
      parent_id: params.parentId ?? undefined,
      text: params.text,
    },
  };
  return post<{ id: number }>('script/template/repair_api', payload);
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

  const payload = {
    is_var: 1,
    s_t_data: {
      action: 'editBlogPost',
      id: params.id,
      text: params.text,
    },
  };
  return post<{ ok: boolean }>('script/template/repair_api', payload);
}

export async function deleteBlogPost(id: number, viewerId = 0): Promise<{ ok: boolean }> {
  if (isLocalBlogSource) {
    return deleteLocalBlogPost({ id, viewerId });
  }

  const payload = {
    is_var: 1,
    s_t_data: {
      action: 'deleteBlogPost',
      id,
    },
  };
  return post<{ ok: boolean }>('script/template/repair_api', payload);
}
