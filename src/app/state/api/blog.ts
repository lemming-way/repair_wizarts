/**
 * Модуль api для статей и комментариев.
 *
 * Действия сохранены по контракту AGENTS.md, но работают с реальными
 * таблицами проекта: blog_post — статьи, blog_topic — категории,
 * blog_comment — комментарии.
 */
import { post } from './request';

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

export async function getBlogTopics(): Promise<BlogArticle[]> {
  const payload = {
    is_var: 1,
    s_t_data: {
      action: 'getBlogTopics',
    },
  };
  return post<BlogArticle[]>('script/template/repair_api', payload);
}

export async function getBlogTopicById(id: number): Promise<BlogArticle> {
  const payload = {
    is_var: 1,
    s_t_data: {
      action: 'getBlogTopicById',
      id,
    },
  };
  return post<BlogArticle>('script/template/repair_api', payload);
}

export async function getBlogPosts(articleId: number): Promise<BlogComment[]> {
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
}): Promise<{ id: number }> {
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

export async function editBlogPost(params: { id: number; text: string }): Promise<{ ok: boolean }> {
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

export async function deleteBlogPost(id: number): Promise<{ ok: boolean }> {
  const payload = {
    is_var: 1,
    s_t_data: {
      action: 'deleteBlogPost',
      id,
    },
  };
  return post<{ ok: boolean }>('script/template/repair_api', payload);
}
