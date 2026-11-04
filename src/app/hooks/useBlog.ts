import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { blogKeys } from '../queries';
import {
  addBlogPost,
  deleteBlogPost,
  editBlogPost,
  getBlogPosts,
  getBlogTopicById,
  getBlogTopics,
} from '../state/api/blog';

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
    queryFn: () => getBlogPosts(articleId),
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

  return useMutation({
    mutationFn: addBlogPost,
    onSuccess: invalidate,
  });
}

export function useEditBlogComment(articleId: number) {
  const invalidate = useInvalidateBlog(articleId);

  return useMutation({
    mutationFn: editBlogPost,
    onSuccess: invalidate,
  });
}

export function useDeleteBlogComment(articleId: number) {
  const invalidate = useInvalidateBlog(articleId);

  return useMutation({
    mutationFn: deleteBlogPost,
    onSuccess: invalidate,
  });
}
