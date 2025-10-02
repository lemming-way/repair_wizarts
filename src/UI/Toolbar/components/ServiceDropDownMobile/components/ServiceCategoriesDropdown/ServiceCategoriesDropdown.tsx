import React from 'react';

import styles from './ServiceCategoriesDropdown.module.scss';
const ServiceCategoriesDropdown = ({ subsections }) => {

  return (
    <div className={styles.serviceCategoriesDropdown}>
      <ul className={styles.serviceCategoriesDropdown_list}>
        {subsections.map((item, index) => (
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
