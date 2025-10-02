import React, {useState} from 'react';

import styles from './ToolbarSearchBar.module.scss';
import { useLanguage } from '../../../../state/language';

const ToolbarSearchBar = () => {
  const [service, setService] = useState<string>('');
  const text = useLanguage();

  const submitFormHandler = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // запрос
    } catch (e) {
      // ошибки
    }
  };

  return (
    <form onSubmit={submitFormHandler} className={styles.toolbarSearchBar}>
      <input
        className={styles.toolbarSearchBar_input}
        type="text"
        name="services"
        placeholder={text('Search')}
        onChange={(e) => setService(e.target.value)}
        value={service}
      />
      <button className={styles.toolbarSearchBar_button} type="submit">
        {text('Find')}
      </button>
    </form>
  );
};

export default ToolbarSearchBar;
