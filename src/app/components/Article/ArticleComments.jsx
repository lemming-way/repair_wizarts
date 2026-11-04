import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import CONFIG from 'config';

import {
  useAddBlogComment,
  useBlogComments,
  useDeleteBlogComment,
  useEditBlogComment,
} from '../../hooks/useBlog';
import { buildCommentTree } from '../../shared/lib/blog';
import { useUser } from '../../state/user';
import ArticleComment, { CommentForm } from './ArticleComment';
import styles from './Article.module.css';

const ArticleComments = ({ articleId, commentsCount = 0 }) => {
  const { user } = useUser();
  const currentUserId = user.id || 0;
  const allowGuestTesting = Boolean(CONFIG.BLOG?.allowGuestTesting);
  const canInteract = currentUserId > 0 || allowGuestTesting;
  const { data: comments = [], isLoading, isError, error, refetch } = useBlogComments(
    articleId,
    currentUserId,
  );
  const addComment = useAddBlogComment(articleId);
  const editComment = useEditBlogComment(articleId);
  const deleteComment = useDeleteBlogComment(articleId);

  const [rootText, setRootText] = useState('');
  const [rootBusy, setRootBusy] = useState(false);
  const [rootError, setRootError] = useState('');

  const tree = useMemo(() => buildCommentTree(comments), [comments]);
  const visibleCount = comments.filter((comment) => !comment.deleted).length;
  const total = isLoading ? commentsCount : visibleCount;

  const handleRootSubmit = async (event) => {
    event.preventDefault();
    if (!rootText.trim()) return;

    setRootBusy(true);
    setRootError('');
    try {
      await addComment.mutateAsync({ articleId, text: rootText.trim() });
      setRootText('');
    } catch (err) {
      setRootError(err instanceof Error ? err.message : 'Не удалось отправить комментарий.');
    } finally {
      setRootBusy(false);
    }
  };

  const handleReply = (parentId, text) => addComment.mutateAsync({ articleId, parentId, text });
  const handleEdit = (id, text) => editComment.mutateAsync({ id, text });
  const handleDelete = (id) => deleteComment.mutateAsync(id);

  return (
    <section className={styles.comments} aria-labelledby="comments-heading">
      <h2 id="comments-heading" className={styles.commentsTitle}>
        Комментарии ({total})
      </h2>

      {isLoading && <p className={styles.commentState}>Загружаем комментарии…</p>}

      {isError && (
        <div className={styles.commentState}>
          <p>{error instanceof Error ? error.message : 'Не удалось загрузить комментарии.'}</p>
          <button type="button" className={styles.secondaryButton} onClick={() => refetch()}>
            Повторить
          </button>
        </div>
      )}

      {!isLoading && !isError && tree.length === 0 && (
        <p className={styles.commentState}>Пока нет комментариев. Будьте первым.</p>
      )}

      {!isLoading && !isError && tree.length > 0 && (
        <ol className={styles.commentList}>
          {tree.map((comment) => (
            <ArticleComment
              comment={comment}
              currentUserId={currentUserId}
              allowGuestTesting={allowGuestTesting}
              key={comment.id}
              onReply={handleReply}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </ol>
      )}

      {canInteract ? (
        <CommentForm
          value={rootText}
          onChange={setRootText}
          onSubmit={handleRootSubmit}
          submitLabel="Отправить"
          placeholder="Напишите комментарий…"
          busy={rootBusy}
        />
      ) : (
        <div className={styles.authPrompt}>
          <p>Войдите, чтобы оставить комментарий.</p>
          <div className={styles.authPromptActions}>
            <Link className={styles.primaryButton} to="/login">
              Войти
            </Link>
            <Link className={styles.secondaryButton} to="/register/client">
              Зарегистрироваться
            </Link>
          </div>
        </div>
      )}

      {rootError && <p className={styles.commentError}>{rootError}</p>}
    </section>
  );
};

export default ArticleComments;
