import { useMemo } from 'react';
import { Link } from 'react-router-dom';

import { useBlogArticles } from '../../hooks/useBlog';
import { ArrowLeftIcon } from '../../shared/ui/BlogIcons';
import BlogArticleCard from './BlogArticleCard';
import styles from './Article.module.css';

const Articles = () => {
  const { data: articles = [], isLoading, isError, error, refetch } = useBlogArticles();

  const topics = useMemo(() => {
    const names = new Map();
    for (const article of articles) {
      if (article.topic_name)
        names.set(article.topic_name, (names.get(article.topic_name) || 0) + 1);
    }
    return Array.from(names, ([name, count]) => ({ name, count }));
  }, [articles]);

  return (
    <div className={styles.articlesPage}>
      <header className={styles.articlesHero}>
        <div className={styles.articlesHeroInner}>
          <Link className={styles.articlesBack} to="/">
            <ArrowLeftIcon />
            На главную
          </Link>
          <p className={styles.articlesHeroLabel}>Блог</p>
          <h1 className={styles.articlesHeroTitle}>Все статьи</h1>
          <p className={styles.articlesHeroSubtitle}>
            Полезные материалы от мастеров и авторов сервиса
          </p>
        </div>
      </header>

      <div className={styles.articlesContentCard}>
        <div className={styles.articlesLayout}>
          <div className={styles.articlesMain}>
            {isLoading && (
              <div className={styles.articlesGrid} aria-label="Загрузка статей">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div className={styles.articleCardSkeleton} key={index} />
                ))}
              </div>
            )}

            {isError && (
              <div className={styles.emptyState}>
                <h2>Не удалось загрузить статьи</h2>
                <p>{error instanceof Error ? error.message : 'Попробуйте обновить страницу.'}</p>
                <button type="button" className={styles.retryButton} onClick={() => refetch()}>
                  Повторить
                </button>
              </div>
            )}

            {!isLoading && !isError && articles.length === 0 && (
              <div className={styles.emptyState}>
                <h2>Пока нет статей</h2>
                <p>Как только появится первая публикация, она сразу появится в каталоге.</p>
              </div>
            )}

            {!isLoading && !isError && articles.length > 0 && (
              <div className={styles.articlesGrid}>
                {articles.map((article) => (
                  <BlogArticleCard article={article} key={article.id} />
                ))}
              </div>
            )}
          </div>

          <aside className={styles.articlesAside}>
            <p className={styles.asideTitle}>Категории</p>
            {topics.length === 0 && <p className={styles.asideMuted}>Нет категорий</p>}
            {topics.map((topic) => (
              <p className={styles.asideItem} key={topic.name}>
                <span>{topic.name}</span>
                <span>{topic.count}</span>
              </p>
            ))}
            <Link className={styles.asideFooterLink} to="/articles">
              Все статьи
            </Link>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default Articles;
