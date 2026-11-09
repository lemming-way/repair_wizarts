import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { useBlogArticles } from '../../hooks/useBlog';
import { ArrowLeftIcon } from '../../shared/ui/BlogIcons';
import BlogArticleCard from './BlogArticleCard';
import styles from './Article.module.css';

const Articles = () => {
  const { data: articles = [], isLoading, isError, error, refetch } = useBlogArticles();
  const [activeTopic, setActiveTopic] = useState(null);
  const [activeAuthor, setActiveAuthor] = useState(null);

  const topics = useMemo(() => {
    const names = new Map();
    for (const article of articles) {
      if (article.topic_name)
        names.set(article.topic_name, (names.get(article.topic_name) || 0) + 1);
    }
    return Array.from(names, ([name, count]) => ({ name, count }));
  }, [articles]);

  const authors = useMemo(() => {
    const names = new Map();
    for (const article of articles) {
      const author = article.author;
      if (!author?.name) continue;
      const key = `${author.id}:${author.name}`;
      const entry = names.get(key) || { key, name: author.name, count: 0 };
      entry.count += 1;
      names.set(key, entry);
    }
    return Array.from(names.values());
  }, [articles]);

  const visibleArticles = useMemo(
    () =>
      articles.filter(
        (article) =>
          (!activeTopic || article.topic_name === activeTopic) &&
          (!activeAuthor || `${article.author?.id ?? ''}:${article.author?.name ?? ''}` === activeAuthor),
      ),
    [activeAuthor, activeTopic, articles],
  );

  const activeAuthorName = activeAuthor
    ? authors.find((author) => author.key === activeAuthor)?.name
    : '';
  const hasActiveFilters = Boolean(activeTopic || activeAuthor);

  const resetFilters = () => {
    setActiveTopic(null);
    setActiveAuthor(null);
  };

  useEffect(() => {
    if (activeTopic && !topics.some((topic) => topic.name === activeTopic)) {
      setActiveTopic(null);
    }
  }, [activeTopic, topics]);

  useEffect(() => {
    if (activeAuthor && !authors.some((author) => author.key === activeAuthor)) {
      setActiveAuthor(null);
    }
  }, [activeAuthor, authors]);

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

            {!isLoading && !isError && hasActiveFilters && (
              <div className={styles.activeFilter}>
                <span>
                  {activeTopic && (
                    <>
                      Категория: <strong>{activeTopic}</strong>
                    </>
                  )}
                  {activeTopic && activeAuthor && ' · '}
                  {activeAuthor && (
                    <>
                      Автор: <strong>{activeAuthorName}</strong>
                    </>
                  )}
                </span>
                <button type="button" className={styles.activeFilterReset} onClick={resetFilters}>
                  Сбросить
                </button>
              </div>
            )}

            {!isLoading && !isError && articles.length > 0 && visibleArticles.length === 0 && (
              <div className={styles.emptyState}>
                <h2>Нет статей по выбранным фильтрам</h2>
                <p>Попробуйте выбрать другую категорию, автора или сбросить фильтр.</p>
                <button type="button" className={styles.retryButton} onClick={resetFilters}>
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
              className={`${styles.asideItem} ${!hasActiveFilters ? styles.asideItemSelected : ''}`}
              aria-pressed={!hasActiveFilters}
              onClick={resetFilters}
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

            <p className={`${styles.asideTitle} ${styles.asideTitleSpaced}`}>Авторы</p>
            {authors.length === 0 && <p className={styles.asideMuted}>Нет авторов</p>}
            <button
              type="button"
              className={`${styles.asideItem} ${!activeAuthor ? styles.asideItemSelected : ''}`}
              aria-pressed={!activeAuthor}
              onClick={() => setActiveAuthor(null)}
            >
              <span>Все авторы</span>
              <span>{articles.length}</span>
            </button>
            {authors.map((author) => (
              <button
                type="button"
                className={`${styles.asideItem} ${activeAuthor === author.key ? styles.asideItemSelected : ''}`}
                aria-pressed={activeAuthor === author.key}
                key={author.key}
                onClick={() => setActiveAuthor(author.key)}
              >
                <span>{author.name}</span>
                <span>{author.count}</span>
              </button>
            ))}
            {hasActiveFilters && (
              <button type="button" className={styles.asideFooterLink} onClick={resetFilters}>
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
