import React from 'react';
import {Link} from "react-router-dom";
import styles from "./ToolbarButtons.module.scss";

const ToolbarButtons = () => {
  return (
    <div className={styles.buttons}>
      <Link to="/login" className={styles.buttons_login}>
        Вход
      </Link>
      <Link to="/register" className={styles.buttons_register}>
        Регистрация
      </Link>
    </div>
  );
};

export default ToolbarButtons;