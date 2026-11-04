import { Link } from 'react-router-dom';

import { getInitials, resolveMediaUrl } from '../../shared/lib/blog';
import { formatDate } from '../../shared/lib/formatDate';
import { CalendarIcon, CommentIcon } from '../../shared/ui/BlogIcons';
import styles from './Article.module.css';

function BlogArticleCard({ article }) {
  return (
    <Link className={styles.articleCardLink} to={`/articles/${article.id}`}>
      <article className={styles.articleCard}>
        {article.cover_url ? (
          <img
            className={styles.articleCardImage}
            src={resolveMediaUrl(article.cover_url)}
            alt=""
            loading="lazy"
          />
        ) : (
          <div className={styles.articleCardImagePlaceholder} aria-hidden="true">
            {getInitials(article.topic_name)}
          </div>
        )}
        <div className={styles.articleCardBody}>
          <span className={styles.articleCardTopic}>{article.topic_name}</span>
          <h2 className={styles.articleCardTitle}>{article.title}</h2>
          {article.excerpt && <p className={styles.articleCardExcerpt}>{article.excerpt}</p>}
          <div className={styles.articleCardMeta}>
            <span>
              <CalendarIcon />
              {formatDate(article.created_at)}
            </span>
            <span>
              <CommentIcon />
              {article.comments_count}
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}

export default BlogArticleCard;
