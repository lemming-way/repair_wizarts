import React from 'react';
import styles from './ServiceCategoriesDropdown.module.scss';
import { useLanguage } from '../../../../../../context/LanguageContext';
const ServiceCategoriesDropdown = ({ subsections }) => {
  const { t } = useLanguage();

  const data: string[] = [t('iPhone repair'), t('iPad repair'), t('MacBook repair')];

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
