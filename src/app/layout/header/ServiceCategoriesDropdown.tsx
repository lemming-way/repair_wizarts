import React from 'react';
import { Link } from 'react-router-dom';

import styles from './ServiceCategoriesDropdown.module.scss';
const ServiceCategoriesDropdown = ({ subcategories, onNavigate }) => {

  return (
    <div className={styles.serviceCategoriesDropdown}>
      <ul className={styles.serviceCategoriesDropdown_list}>
        {subcategories.map(item => (
          <li
            className={styles.serviceCategoriesDropdown_list_item}
            key={item.id}
          >
            <Link to={`/categories/${item.id}`} onClick={onNavigate}>
              {item.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ServiceCategoriesDropdown;
