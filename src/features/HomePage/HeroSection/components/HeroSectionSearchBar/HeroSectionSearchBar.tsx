import React, {useState} from 'react';
import styles from './HeroSectionSearchBar.module.scss';

const HeroSectionSearchBar = () => {
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
    <form className={styles.searchForm} onSubmit={submitFormHandler}>
      <input
        className={styles.searchForm_input}
        type="text"
        name="services"
        placeholder="Найти услугу по ремонту"
        onChange={(e) => setService(e.target.value)}
        value={service}
      />
      <button className={styles.searchForm_button} type="submit">
        Найти
      </button>
    </form>
  );
};

export default HeroSectionSearchBar;