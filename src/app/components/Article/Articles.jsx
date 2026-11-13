import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { useBlogArticles } from '../../hooks/useBlog';
import { ArrowLeftIcon, ChevronDownIcon, FilterIcon } from '../../shared/ui/BlogIcons';
import { SearchableSelect } from '../../shared/ui/SearchableSelect';
import BlogArticleCard from './BlogArticleCard';
import styles from './Article.module.css';

const LIST_THRESHOLD = 20;

const Articles = () => {
  const { data: articles = [], isLoading, isError, error, refetch } = useBlogArticles();
  const [activeTopic, setActiveTopic] = useState(null);
  const [activeAuthor, setActiveAuthor] = useState(null);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const topics = useMemo(() => {
    const names = new Map();
    for (const article of articles) {
      if (article.topic_name)
        names.set(article.topic_name, (names.get(article.topic_name) || 0) + 1);
    }
    return Array.from(names, ([name, count]) => ({ name, count })).sort(
      (a, b) => b.count - a.count || a.name.localeCompare(b.name, 'ru'),
    );
  }, [articles]);

  const authors = useMemo(() => {
    const byId = new Map();
    for (const article of articles) {
      const author = article.author;
      if (!author || author.id === null || author.id === undefined) continue;

      const key = String(author.id);
      const name = typeof author.name === 'string' ? author.name.trim() : '';
      const role = Number(author.role);
      const roleLabel = role === 2 ? 'Мастер' : role === 1 ? 'Клиент' : '';
      const label = [name, roleLabel ? `(${roleLabel})` : '', !name ? `ID: ${author.id}` : '']
        .filter(Boolean)
        .join(' ');
      const entry = byId.get(key) || { key, name: label, count: 0 };
      entry.count += 1;
      byId.set(key, entry);
    }
    return Array.from(byId.values()).sort(
      (a, b) => b.count - a.count || a.name.localeCompare(b.name, 'ru'),
    );
  }, [articles]);

  const visibleArticles = useMemo(
    () =>
      articles.filter(
        (article) =>
          (!activeTopic || article.topic_name === activeTopic) &&
          (!activeAuthor || String(article.author?.id ?? '') === activeAuthor),
      ),
    [activeAuthor, activeTopic, articles],
  );

  const activeAuthorName = activeAuthor
    ? authors.find((author) => author.key === activeAuthor)?.name
    : '';
  const hasActiveFilters = Boolean(activeTopic || activeAuthor);
  const activeFilterCount = Number(Boolean(activeTopic)) + Number(Boolean(activeAuthor));

  const resetFilters = () => {
    setActiveTopic(null);
    setActiveAuthor(null);
  };

  const selectTopic = (name) => {
    setActiveTopic(name);
    setFiltersOpen(false);
  };

  const selectAuthor = (key) => {
    setActiveAuthor(key);
    setFiltersOpen(false);
  };

  useEffect(() => {
    if (activeTopic && !topics.some((topic) => topic.name === activeTopic)) {
      setActiveTopic(null);
    }
  }, [activeTopic, topics, setActiveTopic]);

  useEffect(() => {
    if (activeAuthor && !authors.some((author) => author.key === activeAuthor)) {
      setActiveAuthor(null);
    }
  }, [activeAuthor, authors, setActiveAuthor]);

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
        <button
          type="button"
          className={styles.filtersToggle}
          aria-expanded={filtersOpen}
          aria-controls="articles-filters"
          onClick={() => setFiltersOpen((open) => !open)}
        >
          <span className={styles.filtersToggleLabel}>
            <FilterIcon className={styles.filtersToggleIcon} />
            Фильтры
            {activeFilterCount > 0 ? ` · ${activeFilterCount}` : ''}
          </span>
          <ChevronDownIcon
            className={`${styles.filtersToggleChevron} ${
              filtersOpen ? styles.filtersToggleChevronOpen : ''
            }`}
          />
        </button>

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

          <aside
            id="articles-filters"
            className={`${styles.articlesAside} ${filtersOpen ? styles.articlesAsideOpen : ''}`}
          >
            <p className={styles.asideTitle}>
              Категории
              {topics.length > 0 && <span className={styles.asideTitleCount}>{topics.length}</span>}
            </p>
            {topics.length === 0 ? (
              <p className={styles.asideMuted}>Нет категорий</p>
            ) : (
              <>
                <button
                  type="button"
                  className={`${styles.asideItem} ${!activeTopic ? styles.asideItemSelected : ''}`}
                  aria-pressed={!activeTopic}
                  onClick={() => selectTopic(null)}
                >
                  <span>Все категории</span>
                  <span>{topics.length}</span>
                </button>
                {topics.length <= LIST_THRESHOLD ? (
                  <div className={styles.asideList}>
                    {topics.map((topic) => (
                      <button
                        type="button"
                        className={`${styles.asideItem} ${activeTopic === topic.name ? styles.asideItemSelected : ''}`}
                        aria-pressed={activeTopic === topic.name}
                        key={topic.name}
                        onClick={() => selectTopic(topic.name)}
                      >
                        <span>{topic.name}</span>
                        <span>{topic.count}</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <SearchableSelect
                    options={topics.map((t) => ({ value: t.name, label: t.name, count: t.count }))}
                    value={activeTopic}
                    onChange={selectTopic}
                    placeholder="Все категории"
                    searchPlaceholder="Поиск категории…"
                    noOptionsMessage="Категории не найдены"
                    aria-label="Выбор категории"
                    className={styles.searchableSelect}
                  />
                )}
              </>
            )}

            <p className={`${styles.asideTitle} ${styles.asideTitleSpaced}`}>
              Авторы
              {authors.length > 0 && (
                <span className={styles.asideTitleCount}>{authors.length}</span>
              )}
            </p>
            {authors.length === 0 ? (
              <p className={styles.asideMuted}>Нет авторов</p>
            ) : (
              <>
                <button
                  type="button"
                  className={`${styles.asideItem} ${!activeAuthor ? styles.asideItemSelected : ''}`}
                  aria-pressed={!activeAuthor}
                  onClick={() => selectAuthor(null)}
                >
                  <span>Все авторы</span>
                  <span>{authors.length}</span>
                </button>
                {authors.length <= LIST_THRESHOLD ? (
                  <div className={styles.asideList}>
                    {authors.map((author) => (
                      <button
                        type="button"
                        className={`${styles.asideItem} ${activeAuthor === author.key ? styles.asideItemSelected : ''}`}
                        aria-pressed={activeAuthor === author.key}
                        key={author.key}
                        onClick={() => selectAuthor(author.key)}
                      >
                        <span>{author.name}</span>
                        <span>{author.count}</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <SearchableSelect
                    options={authors.map((a) => ({ value: a.key, label: a.name, count: a.count }))}
                    value={activeAuthor}
                    onChange={selectAuthor}
                    placeholder="Все авторы"
                    searchPlaceholder="Поиск автора…"
                    noOptionsMessage="Авторы не найдены"
                    aria-label="Выбор автора"
                    className={styles.searchableSelect}
                  />
                )}
              </>
            )}
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
