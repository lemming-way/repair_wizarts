import React from 'react';

import styles from './NotFoundPage.module.scss';
import { useLanguage } from 'app/state/language';

const NotFoundPage = () => {
  const text = useLanguage();
  return (
    <div className={`${styles.notFoundPage} appContainer`}>
        <h1 className={styles.notFoundPage_title}>{text("Page not found")}</h1>
    </div>
  );
};

export default NotFoundPage;
