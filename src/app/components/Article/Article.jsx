import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { useBlogArticle, useBlogArticles } from '../../hooks/useBlog';
import sanitizeHtml from '../../shared/lib/sanitizeHtml';
import { stripHtml } from '../../shared/lib/blog';
import { formatDate } from '../../shared/lib/formatDate';
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CalendarIcon,
  CommentIcon,
} from '../../shared/ui/BlogIcons';
import { useUser } from '../../state/user';
import ArticleComments from './ArticleComments';
import BlogArticleCard from './BlogArticleCard';
import BlogAvatar from './BlogAvatar';
import styles from './Article.module.css';

function ArticlePageState({ title, message, onRetry }) {
  return (
    <div className={styles.articlesPage}>
      <div className={styles.articleStateCard}>
        <h1>{title}</h1>
        <p>{message}</p>
        <div className={styles.articleStateActions}>
          <Link className={styles.secondaryButton} to="/articles">
            Все статьи
          </Link>
          {onRetry && (
            <button type="button" className={styles.primaryButton} onClick={onRetry}>
              Повторить
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

const Article = () => {
  const { id } = useParams();
  const articleId = Number(id);
  const { user } = useUser();
  const { data: article, isLoading, isError, error, refetch } = useBlogArticle(articleId);
  const { data: articles = [] } = useBlogArticles();

  const [expanded, setExpanded] = useState(false);
  const [canExpand, setCanExpand] = useState(false);
  const contentRef = useRef(null);

  const cleanContent = useMemo(() => sanitizeHtml(article?.content || ''), [article?.content]);
  const plainText = useMemo(() => stripHtml(cleanContent), [cleanContent]);
  const readingMinutes = Math.max(1, Math.ceil(Array.from(plainText).length / 1000));

  useEffect(() => {
    setExpanded(false);
    setCanExpand(false);
  }, [articleId]);

  useEffect(() => {
    if (!cleanContent) return;
    const element = contentRef.current;
    if (!element) return;
    setCanExpand(element.scrollHeight > 360 || Array.from(plainText).length > 1200);
  }, [cleanContent, plainText]);

  if (isLoading) {
    return <ArticlePageState title="Загружаем статью" message="Это займёт несколько секунд." />;
  }

  if (isError) {
    return (
      <ArticlePageState
        title="Не удалось загрузить статью"
        message={error instanceof Error ? error.message : 'Попробуйте обновить страницу.'}
        onRetry={() => refetch()}
      />
    );
  }

  if (!article) {
    return (
      <ArticlePageState title="Статья не найдена" message="Возможно, публикация была удалена." />
    );
  }

  const otherArticles = articles.filter((item) => item.id !== article.id).slice(0, 3);
  const serviceLink = user.id ? '/client/requests/create/data' : '/register/client';
  const publishedAt = formatDate(article.created_at, 'ru', 'long').replace(' г.', '');

  return (
    <div className={styles.articlesPage}>
      <header className={styles.articleHero}>
        <div className={styles.articleHeroInner}>
          <Link className={styles.articlesBack} to="/articles">
            <ArrowLeftIcon />
            Все статьи
          </Link>
          <p className={styles.articleHeroCategory}>{article.topic_name}</p>
          <h1 className={styles.articleHeroTitle}>{article.title}</h1>
          <div className={styles.articleHeroMeta}>
            <span>
              <CalendarIcon />
              {publishedAt}
            </span>
            <span>
              <CommentIcon />
              {article.comments_count} комментариев
            </span>
            <span>{readingMinutes} мин чтения</span>
          </div>
        </div>
      </header>

      <div className={styles.articleContentCard}>
        <div className={styles.articleLayout}>
          <div className={styles.articleMain}>
            <article className={styles.article}>
              <div className={styles.articleAuthor}>
                <BlogAvatar name={article.author.name} src={article.author.avatar} />
                <div>
                  <p className={styles.articleAuthorName}>
                    {article.author.name}
                    <span> ({article.author.role === 2 ? 'Мастер' : 'Клиент'})</span>
                  </p>
                  <p className={styles.articleAuthorDate}>Опубликовано {publishedAt}</p>
                </div>
              </div>

              <div className={styles.articleBodyWrap}>
                <div
                  ref={contentRef}
                  className={`${styles.articleBody} ${expanded ? styles.articleBodyExpanded : styles.articleBodyCollapsed}`}
                  dangerouslySetInnerHTML={{ __html: cleanContent }}
                />
                {!expanded && canExpand && <div className={styles.articleBodyGradient} />}
              </div>

              <div className={styles.articleActions}>
                {canExpand && (
                  <button
                    type="button"
                    className={styles.primaryButton}
                    onClick={() => setExpanded((value) => !value)}
                  >
                    {expanded ? 'Свернуть' : 'Читать далее'}
                  </button>
                )}
                <Link className={styles.serviceLink} to={serviceLink}>
                  Оформить услугу
                  <ArrowRightIcon />
                </Link>
              </div>
            </article>

            <ArticleComments articleId={article.id} commentsCount={article.comments_count} />

            {otherArticles.length > 0 && (
              <section className={styles.otherArticles}>
                <h2 className={styles.otherArticlesTitle}>Другие статьи</h2>
                <div className={styles.otherArticlesGrid}>
                  {otherArticles.map((item) => (
                    <BlogArticleCard article={item} key={item.id} />
                  ))}
                </div>
              </section>
            )}
          </div>

          <aside className={styles.articleAside}>
            <p className={styles.asideTitle}>Категория</p>
            <p className={styles.asideItemActive}>{article.topic_name}</p>
            <Link className={styles.asideFooterLink} to="/articles">
              Все статьи
            </Link>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default Article;
