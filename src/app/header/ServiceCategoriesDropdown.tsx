import React from 'react';

import styles from './ServiceCategoriesDropdown.module.scss';
const ServiceCategoriesDropdown = ({ subcategories }) => {

  return (
    <div className={styles.serviceCategoriesDropdown}>
      <ul className={styles.serviceCategoriesDropdown_list}>
        {subcategories.map(item => (
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
