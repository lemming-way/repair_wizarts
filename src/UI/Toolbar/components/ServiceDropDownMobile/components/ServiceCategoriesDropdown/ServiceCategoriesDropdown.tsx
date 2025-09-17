import React from 'react';
import styles from './ServiceCategoriesDropdown.module.scss';

const ServiceCategoriesDropdown = () => {
  const data: string[] = ['Ремонт iPhone', 'Ремонт iPad', 'Ремонт MacBook'];

  return (
    <div className={styles.serviceCategoriesDropdown}>
      <ul className={styles.serviceCategoriesDropdown_list}>
        {data.map((item, index) => (
          <li
            className={styles.serviceCategoriesDropdown_list_item}
            key={index}
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ServiceCategoriesDropdown;