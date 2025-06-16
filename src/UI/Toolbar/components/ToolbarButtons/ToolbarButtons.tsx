import React from 'react';
import {Link} from "react-router-dom";
import styles from "./ToolbarButtons.module.scss";
import { useLanguage } from '../../../../context/LanguageContext';

const ToolbarButtons = () => {
  const { t } = useLanguage();

  return (
    <div className={styles.buttons}>
      <Link to="/login" className={styles.buttons_login}>
        {t('Login')}
      </Link>
      <Link to="/register" className={styles.buttons_register}>
        {t('Register')}
      </Link>
    </div>
  );
};

export default ToolbarButtons;