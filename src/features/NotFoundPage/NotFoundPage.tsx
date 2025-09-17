import React from 'react';
import styles from './NotFoundPage.module.scss';

const NotFoundPage = () => {
  return (
    <div className={`${styles.notFoundPage} appContainer`}>
        <h1 className={styles.notFoundPage_title}>Страница не найдена</h1>
    </div>
  );
};

export default NotFoundPage;