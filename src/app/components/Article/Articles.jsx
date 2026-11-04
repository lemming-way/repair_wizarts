import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { useBlogArticles } from '../../hooks/useBlog';
import { ArrowLeftIcon } from '../../shared/ui/BlogIcons';
import BlogArticleCard from './BlogArticleCard';
import styles from './Article.module.css';

const Articles = () => {
  const { data: articles = [], isLoading, isError, error, refetch } = useBlogArticles();
  const [activeTopic, setActiveTopic] = useState(null);

  const topics = useMemo(() => {
    const names = new Map();
    for (const article of articles) {
      if (article.topic_name)
        names.set(article.topic_name, (names.get(article.topic_name) || 0) + 1);
    }
    return Array.from(names, ([name, count]) => ({ name, count }));
  }, [articles]);

  const visibleArticles = useMemo(() => {
    if (!activeTopic) return articles;
    return articles.filter((article) => article.topic_name === activeTopic);
  }, [activeTopic, articles]);

  useEffect(() => {
    if (activeTopic && !topics.some((topic) => topic.name === activeTopic)) {
      setActiveTopic(null);
    }
  }, [activeTopic, topics]);

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

            {!isLoading && !isError && activeTopic && (
              <div className={styles.activeFilter}>
                <span>
                  Категория: <strong>{activeTopic}</strong>
                </span>
                <button
                  type="button"
                  className={styles.activeFilterReset}
                  onClick={() => setActiveTopic(null)}
                >
                  Сбросить
                </button>
              </div>
            )}

            {!isLoading && !isError && articles.length > 0 && visibleArticles.length === 0 && (
              <div className={styles.emptyState}>
                <h2>В этой категории пока нет статей</h2>
                <p>Попробуйте выбрать другую категорию или сбросить фильтр.</p>
                <button
                  type="button"
                  className={styles.retryButton}
                  onClick={() => setActiveTopic(null)}
                >
                  Все статьи
                </button>
              </div>
            )}

            {!isLoading && !isError && visibleArticles.length > 0 && (
              <div className={styles.articlesGrid}>
                {visibleArticles.map((article) => (
                  <BlogArticleCard article={article} key={article.id} />
                ))}
              </div>
            )}
          </div>

          <aside className={styles.articlesAside}>
            <p className={styles.asideTitle}>Категории</p>
            {topics.length === 0 && <p className={styles.asideMuted}>Нет категорий</p>}
            <button
              type="button"
              className={`${styles.asideItem} ${!activeTopic ? styles.asideItemSelected : ''}`}
              aria-pressed={!activeTopic}
              onClick={() => setActiveTopic(null)}
            >
              <span>Все статьи</span>
              <span>{articles.length}</span>
            </button>
            {topics.map((topic) => (
              <button
                type="button"
                className={`${styles.asideItem} ${activeTopic === topic.name ? styles.asideItemSelected : ''}`}
                aria-pressed={activeTopic === topic.name}
                key={topic.name}
                onClick={() => setActiveTopic(topic.name)}
              >
                <span>{topic.name}</span>
                <span>{topic.count}</span>
              </button>
            ))}
            {activeTopic && (
              <button
                type="button"
                className={styles.asideFooterLink}
                onClick={() => setActiveTopic(null)}
              >
                Сбросить фильтр
              </button>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
};

export default Articles;
