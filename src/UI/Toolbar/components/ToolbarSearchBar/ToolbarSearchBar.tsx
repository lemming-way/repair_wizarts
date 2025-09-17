import React, {useState} from 'react';
import styles from './ToolbarSearchBar.module.scss';

const ToolbarSearchBar = () => {
  const [service, setService] = useState<string>('');

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
        placeholder="Поиск"
        onChange={(e) => setService(e.target.value)}
        value={service}
      />
      <button className={styles.toolbarSearchBar_button} type="submit">
        Найти
      </button>
    </form>
  );
};

export default ToolbarSearchBar;