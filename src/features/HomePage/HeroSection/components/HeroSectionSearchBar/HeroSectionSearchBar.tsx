import React, { useState } from 'react';
import styles from './HeroSectionSearchBar.module.scss';
import { useNavigate } from 'react-router-dom';

const HeroSectionSearchBar = () => {
  const [service, setService] = useState<string>('');
  const navigate = useNavigate();
  const submitFormHandler = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/devices/9/244?search=${service}`);
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
