/**
 * Комментарии для локального каталога статей (public/articles).
 *
 * Пока статьи не импортированы в БД, комментарии хранятся в localStorage,
 * чтобы интерфейс оставался рабочим. Правила те же, что на бэкенде:
 * менять можно только свой последний комментарий в ветке.
 */
import type { BlogAuthor, BlogComment } from './blog';

type StoredComment = {
  id: number;
  article_id: number;
  parent_id: number | null;
  author: BlogAuthor;
  text: string;
  created_at: string;
  updated_at: string | null;
  deleted: boolean;
};

type StoredState = {
  next_id: number;
  comments: StoredComment[];
};

const STORAGE_KEY = 'blog:local-comments:v1';
const EMPTY_STATE: StoredState = { next_id: 1, comments: [] };

function readState(): StoredState {
  if (typeof window === 'undefined') return { ...EMPTY_STATE, comments: [] };

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...EMPTY_STATE, comments: [] };
    const parsed = JSON.parse(raw) as StoredState;
    if (!parsed || !Array.isArray(parsed.comments)) return { ...EMPTY_STATE, comments: [] };
    return {
      next_id: Number.isFinite(parsed.next_id) ? parsed.next_id : 1,
      comments: parsed.comments.filter(
        (comment) =>
          comment && typeof comment.id === 'number' && typeof comment.article_id === 'number',
      ),
    };
  } catch {
    return { ...EMPTY_STATE, comments: [] };
  }
}

function writeState(state: StoredState) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // localStorage может быть недоступен (приватный режим) — не ломаем страницу.
  }
}

function cloneState(): StoredState {
  const state = readState();
  return { next_id: state.next_id, comments: state.comments.map((comment) => ({ ...comment })) };
}

function toBlogComment(
  comment: StoredComment,
  comments: StoredComment[],
  viewerId: number,
): BlogComment {
  const children = comments.filter((item) => item.parent_id === comment.id);
  const siblings = comments.filter(
    (item) => item.article_id === comment.article_id && item.parent_id === comment.parent_id,
  );
  const lastSiblingId = Math.max(...siblings.map((item) => item.id));
  const canChange =
    !comment.deleted &&
    viewerId > 0 &&
    comment.author.id === viewerId &&
    children.length === 0 &&
    comment.id === lastSiblingId;

  return {
    id: comment.id,
    article_id: comment.article_id,
    parent_id: comment.parent_id,
    author: comment.author,
    text: comment.deleted ? '' : comment.text,
    created_at: comment.created_at,
    updated_at: comment.updated_at,
    deleted: comment.deleted,
    can_edit: canChange,
    can_delete: canChange,
  };
}

export function getLocalBlogPosts(articleId: number, viewerId = 0): BlogComment[] {
  const state = readState();
  return state.comments
    .filter((comment) => comment.article_id === articleId)
    .sort((a, b) => a.id - b.id)
    .map((comment) => toBlogComment(comment, state.comments, viewerId));
}

export function addLocalBlogPost(params: {
  articleId: number;
  parentId?: number | null;
  text: string;
  author?: BlogAuthor;
}): { id: number } {
  const text = params.text.trim();
  if (!text) throw new Error('Текст комментария не задан.');
  if (!params.author || !params.author.id) {
    throw new Error('Войдите, чтобы оставить комментарий.');
  }

  const state = cloneState();
  const parentId = params.parentId ?? null;
  if (parentId !== null && !state.comments.some((comment) => comment.id === parentId)) {
    throw new Error('Родительский комментарий не найден.');
  }

  const comment: StoredComment = {
    id: state.next_id,
    article_id: params.articleId,
    parent_id: parentId,
    author: params.author,
    text,
    created_at: new Date().toISOString(),
    updated_at: null,
    deleted: false,
  };

  state.next_id += 1;
  state.comments.push(comment);
  writeState(state);
  return { id: comment.id };
}

function findEditableComment(state: StoredState, id: number, viewerId: number): StoredComment {
  const comment = state.comments.find((item) => item.id === id);
  if (!comment) throw new Error('Комментарий не найден.');
  if (comment.author.id !== viewerId || viewerId <= 0) {
    throw new Error('Можно изменять только свои комментарии.');
  }
  if (comment.deleted) throw new Error('Комментарий уже удалён.');

  const children = state.comments.filter((item) => item.parent_id === id);
  const siblings = state.comments.filter(
    (item) => item.article_id === comment.article_id && item.parent_id === comment.parent_id,
  );
  const lastSiblingId = Math.max(...siblings.map((item) => item.id));
  if (children.length > 0 || lastSiblingId !== id) {
    throw new Error('Можно изменять только последний комментарий в ветке.');
  }

  return comment;
}

export function editLocalBlogPost(params: { id: number; text: string; viewerId: number }): {
  ok: boolean;
} {
  const text = params.text.trim();
  if (!text) throw new Error('Текст комментария не задан.');

  const state = cloneState();
  const comment = findEditableComment(state, params.id, params.viewerId);
  comment.text = text;
  comment.updated_at = new Date().toISOString();
  writeState(state);
  return { ok: true };
}

export function deleteLocalBlogPost(params: { id: number; viewerId: number }): { ok: boolean } {
  const state = cloneState();
  const comment = findEditableComment(state, params.id, params.viewerId);
  comment.text = '';
  comment.deleted = true;
  comment.updated_at = new Date().toISOString();
  writeState(state);
  return { ok: true };
}

export function resetLocalComments() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(STORAGE_KEY);
}
