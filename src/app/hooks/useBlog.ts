import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { blogKeys } from '../queries';
import {
  addBlogPost,
  type BlogAuthor,
  deleteBlogPost,
  editBlogPost,
  getBlogPosts,
  getBlogTopicById,
  getBlogTopics,
} from '../state/api/blog';
import { useUser } from '../state/user';

function toBlogAuthor(user: ReturnType<typeof useUser>['user']): BlogAuthor | undefined {
  if (!user.id) return undefined;

  return {
    id: user.id,
    name: user.fullname || user.name || 'Пользователь',
    avatar: user.avatar || '',
    role: Number(user.role) || 1,
  };
}

export function useBlogArticles() {
  return useQuery({
    queryKey: blogKeys.articles(),
    queryFn: getBlogTopics,
    staleTime: 60_000,
  });
}

export function useBlogArticle(id: number) {
  return useQuery({
    queryKey: blogKeys.article(id),
    queryFn: () => getBlogTopicById(id),
    enabled: Number.isInteger(id) && id > 0,
    staleTime: 60_000,
  });
}

export function useBlogComments(articleId: number, userId = 0) {
  return useQuery({
    queryKey: blogKeys.comments(articleId, userId),
    queryFn: () => getBlogPosts(articleId, userId),
    enabled: Number.isInteger(articleId) && articleId > 0,
  });
}

function useInvalidateBlog(articleId: number) {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: blogKeys.commentsRoot(articleId) });
    queryClient.invalidateQueries({ queryKey: blogKeys.article(articleId) });
    queryClient.invalidateQueries({ queryKey: blogKeys.articles() });
  };
}

export function useAddBlogComment(articleId: number) {
  const invalidate = useInvalidateBlog(articleId);
  const { user } = useUser();

  return useMutation({
    mutationFn: (params: { articleId: number; parentId?: number | null; text: string }) =>
      addBlogPost({ ...params, author: toBlogAuthor(user) }),
    onSuccess: invalidate,
  });
}

export function useEditBlogComment(articleId: number) {
  const invalidate = useInvalidateBlog(articleId);
  const { user } = useUser();

  return useMutation({
    mutationFn: (params: { id: number; text: string }) =>
      editBlogPost({ ...params, viewerId: user.id || 0 }),
    onSuccess: invalidate,
  });
}

export function useDeleteBlogComment(articleId: number) {
  const invalidate = useInvalidateBlog(articleId);
  const { user } = useUser();

  return useMutation({
    mutationFn: (id: number) => deleteBlogPost(id, user.id || 0),
    onSuccess: invalidate,
  });
}
