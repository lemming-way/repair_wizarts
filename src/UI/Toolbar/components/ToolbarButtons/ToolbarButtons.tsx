import React from 'react';
import {Link} from "react-router-dom";

import styles from "./ToolbarButtons.module.scss";
import { useLanguage } from '../../../../state/language';

const ToolbarButtons = () => {
  const text = useLanguage();

  return (
    <div className={styles.buttons}>
      <Link to="/login" className={styles.buttons_login}>
        {text('Login')}
      </Link>
      <Link to="/register" className={styles.buttons_register}>
        {text('Register')}
      </Link>
    </div>
  );
};

export default ToolbarButtons;
