import { useState } from 'react';

import { getInitials, resolveMediaUrl } from '../../shared/lib/blog';
import styles from './Article.module.css';

function BlogAvatar({ name, src, size = 'md' }) {
  const [failed, setFailed] = useState(false);
  const className = size === 'lg' ? styles.avatarLg : styles.avatar;
  const resolvedSrc = resolveMediaUrl(src);

  if (!resolvedSrc || failed) {
    return <span className={`${styles.avatarFallback} ${className}`}>{getInitials(name)}</span>;
  }

  return (
    <img
      className={className}
      src={resolvedSrc}
      alt={name}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}

export default BlogAvatar;
