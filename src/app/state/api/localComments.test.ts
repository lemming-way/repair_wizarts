import type { BlogAuthor } from './blog';
import {
  addLocalBlogPost,
  deleteLocalBlogPost,
  editLocalBlogPost,
  getLocalBlogPosts,
  resetLocalComments,
} from './localComments';

const author: BlogAuthor = { id: 1, name: 'Автор', avatar: '', role: 1 };
const other: BlogAuthor = { id: 2, name: 'Другой', avatar: '', role: 1 };

beforeEach(() => {
  resetLocalComments();
});

describe('local comment rules', () => {
  it('allows changing the latest comment in its group even when it has replies', () => {
    const root = addLocalBlogPost({ articleId: 1, text: 'Корень', author });
    addLocalBlogPost({ articleId: 1, parentId: root.id, text: 'Ответ', author: other });

    const rootView = getLocalBlogPosts(1, author.id).find((comment) => comment.id === root.id);
    expect(rootView?.can_edit).toBe(true);
    expect(rootView?.can_delete).toBe(true);

    expect(editLocalBlogPost({ id: root.id, text: 'Обновлено', viewerId: author.id }).ok).toBe(
      true,
    );
    expect(deleteLocalBlogPost({ id: root.id, viewerId: author.id }).ok).toBe(true);
  });

  it('does not allow changing a comment that is not the latest in its group', () => {
    const first = addLocalBlogPost({ articleId: 1, text: 'Первый', author });
    addLocalBlogPost({ articleId: 1, text: 'Второй', author });

    const firstView = getLocalBlogPosts(1, author.id).find((comment) => comment.id === first.id);
    expect(firstView?.can_edit).toBe(false);
    expect(() => editLocalBlogPost({ id: first.id, text: 'Нельзя', viewerId: author.id })).toThrow(
      'последний комментарий',
    );
  });

  it('allows replying to a deleted comment', () => {
    const root = addLocalBlogPost({ articleId: 1, text: 'Корень', author });
    deleteLocalBlogPost({ id: root.id, viewerId: author.id });

    const reply = addLocalBlogPost({
      articleId: 1,
      parentId: root.id,
      text: 'Ответ на удалённый',
      author: other,
    });

    expect(reply.id).toBeGreaterThan(0);
    expect(getLocalBlogPosts(1, author.id).some((comment) => comment.parent_id === root.id)).toBe(
      true,
    );
  });

  it('rejects a parent comment from another article', () => {
    const root = addLocalBlogPost({ articleId: 1, text: 'Корень', author });

    expect(() =>
      addLocalBlogPost({
        articleId: 2,
        parentId: root.id,
        text: 'Чужой ответ',
        author: other,
      }),
    ).toThrow('другой статье');
  });
});
