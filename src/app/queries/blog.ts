export const blogKeys = {
  all: ['blog'] as const,
  articles: () => [...blogKeys.all, 'articles'] as const,
  article: (id: number) => [...blogKeys.all, 'article', id] as const,
  comments: (articleId: number, userId: number) =>
    [...blogKeys.all, 'comments', articleId, userId] as const,
  commentsRoot: (articleId: number) => [...blogKeys.all, 'comments', articleId] as const,
};

export type BlogArticlesQueryKey = ReturnType<typeof blogKeys.articles>;
export type BlogArticleQueryKey = ReturnType<typeof blogKeys.article>;
export type BlogCommentsQueryKey = ReturnType<typeof blogKeys.comments>;
