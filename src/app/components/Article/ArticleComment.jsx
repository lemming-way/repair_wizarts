import { useId, useState } from 'react';

import { countUnicodeChars, formatBlogDateTime } from '../../shared/lib/blog';
import { PencilIcon, TrashIcon } from '../../shared/ui/BlogIcons';
import BlogAvatar from './BlogAvatar';
import styles from './Article.module.css';

export const MAX_COMMENT_LENGTH = 1000;

export function CommentForm({
  value,
  onChange,
  onSubmit,
  onCancel,
  submitLabel,
  busy,
  placeholder,
}) {
  const textareaId = useId();
  const length = countUnicodeChars(value);
  const tooLong = length > MAX_COMMENT_LENGTH;

  return (
    <form className={styles.commentForm} onSubmit={onSubmit}>
      <label className={styles.srOnly} htmlFor={textareaId}>
        {placeholder}
      </label>
      <textarea
        id={textareaId}
        className={styles.commentTextarea}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
      <div className={styles.commentFormFooter}>
        <span className={tooLong ? styles.counterError : undefined}>
          {length} / {MAX_COMMENT_LENGTH}
        </span>
        <div className={styles.commentFormButtons}>
          {onCancel && (
            <button
              type="button"
              className={styles.cancelButton}
              onClick={onCancel}
              disabled={busy}
            >
              Отмена
            </button>
          )}
          <button
            type="submit"
            className={styles.primaryButton}
            disabled={busy || !value.trim() || tooLong}
          >
            {busy ? 'Отправляем…' : submitLabel}
          </button>
        </div>
      </div>
    </form>
  );
}

function ArticleComment({
  comment,
  currentUserId,
  allowGuestTesting = false,
  depth = 0,
  onReply,
  onEdit,
  onDelete,
}) {
  const [mode, setMode] = useState('idle');
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const isOwn = currentUserId > 0 && comment.author.id === currentUserId;
  const canReply = currentUserId > 0 || allowGuestTesting;

  const reset = () => {
    setMode('idle');
    setDraft('');
    setError('');
    setBusy(false);
  };

  const handleReply = async (event) => {
    event.preventDefault();
    if (!draft.trim()) return;

    setBusy(true);
    setError('');
    try {
      await onReply(comment.id, draft.trim());
      reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось отправить ответ.');
      setBusy(false);
    }
  };

  const handleEdit = async (event) => {
    event.preventDefault();
    if (!draft.trim()) return;

    setBusy(true);
    setError('');
    try {
      await onEdit(comment.id, draft.trim());
      reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось сохранить комментарий.');
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    setBusy(true);
    setError('');
    try {
      await onDelete(comment.id);
      reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось удалить комментарий.');
      setBusy(false);
    }
  };

  return (
    <li className={styles.commentItem}>
      <div className={`${styles.commentRow} ${comment.can_edit ? styles.commentRowOwn : ''}`}>
        <BlogAvatar
          name={comment.author.name}
          src={comment.author.avatar}
          size={depth === 0 ? 'lg' : 'md'}
        />

        <div className={styles.commentBody}>
          <div className={styles.commentHeader}>
            <span className={styles.commentAuthorName}>{comment.author.name}</span>
            {isOwn && <span className={styles.ownBadge}>Вы</span>}
            <time className={styles.commentDate} dateTime={comment.created_at}>
              {formatBlogDateTime(comment.created_at)}
            </time>
            {comment.updated_at && !comment.deleted && (
              <span className={styles.editedMark}>изменено</span>
            )}
          </div>

          {comment.deleted ? (
            <p className={styles.deletedComment}>Комментарий удалён</p>
          ) : mode === 'edit' ? (
            <CommentForm
              value={draft}
              onChange={setDraft}
              onSubmit={handleEdit}
              onCancel={reset}
              submitLabel="Сохранить"
              placeholder="Текст комментария"
              busy={busy}
            />
          ) : (
            <p className={styles.commentText}>{comment.text}</p>
          )}

          {mode === 'reply' && (
            <CommentForm
              value={draft}
              onChange={setDraft}
              onSubmit={handleReply}
              onCancel={reset}
              submitLabel="Ответить"
              placeholder={`Ответ на комментарий ${comment.author.name}`}
              busy={busy}
            />
          )}

          {mode === 'delete' && (
            <div className={styles.deleteConfirm}>
              <span>Удалить комментарий?</span>
              <button
                type="button"
                className={styles.dangerButton}
                onClick={handleDelete}
                disabled={busy}
              >
                {busy ? 'Удаляем…' : 'Да, удалить'}
              </button>
              <button type="button" className={styles.cancelButton} onClick={reset} disabled={busy}>
                Нет
              </button>
            </div>
          )}

          {error && <p className={styles.commentError}>{error}</p>}

          {mode === 'idle' && (
            <div className={styles.commentActions}>
              {canReply && (
                <button
                  type="button"
                  className={styles.textButton}
                  onClick={() => {
                    setDraft('');
                    setError('');
                    setMode('reply');
                  }}
                >
                  Ответить
                </button>
              )}
              {comment.can_edit && (
                <button
                  type="button"
                  className={styles.textButton}
                  onClick={() => {
                    setDraft(comment.text);
                    setError('');
                    setMode('edit');
                  }}
                >
                  <PencilIcon />
                  Редактировать
                </button>
              )}
              {comment.can_delete && (
                <button
                  type="button"
                  className={`${styles.textButton} ${styles.textButtonDanger}`}
                  onClick={() => {
                    setError('');
                    setMode('delete');
                  }}
                >
                  <TrashIcon />
                  Удалить
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {comment.children.length > 0 && (
        <ol className={`${styles.commentChildren} ${depth >= 3 ? styles.commentChildrenFlat : ''}`}>
          {comment.children.map((child) => (
            <ArticleComment
              comment={child}
              currentUserId={currentUserId}
              allowGuestTesting={allowGuestTesting}
              depth={depth + 1}
              key={child.id}
              onReply={onReply}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </ol>
      )}
    </li>
  );
}

export default ArticleComment;
