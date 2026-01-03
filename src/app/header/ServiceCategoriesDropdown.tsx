import React from 'react';

import styles from './ServiceCategoriesDropdown.module.scss';
const ServiceCategoriesDropdown = ({ subsections }) => {

  return (
    <div className={styles.serviceCategoriesDropdown}>
      <ul className={styles.serviceCategoriesDropdown_list}>
        {subsections.map(item => (
          <li
            className={styles.serviceCategoriesDropdown_list_item}
            key={item.id}
          >
            {item.name}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ServiceCategoriesDropdown;
