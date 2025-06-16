import React from 'react';
import styles from './NotFoundPage.module.scss';
import { useLanguage } from '../../context/LanguageContext';

const NotFoundPage = () => {
  const { t } = useLanguage();
  return (
    <div className={`${styles.notFoundPage} appContainer`}>
        <h1 className={styles.notFoundPage_title}>{t("Page not found")}</h1>
    </div>
  );
};

export default NotFoundPage;