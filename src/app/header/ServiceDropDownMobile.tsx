import React, { useState } from 'react';

import arrowRight from '../../img/header/icons/arrow-right-icon.svg';
import styles from './ServiceDropDownMobile.module.scss';
import ServiceCategoriesDropdown from './ServiceCategoriesDropdown';
import { useServices } from '../../state/site-data';

const ServiceDropdownMobile = () => {
  
  const { categories, subcategories } = useServices();
  const [openItem, setOpenItem] = useState<string | null>(null);

  return (
    <div className={styles.serviceDropdown}>
      <ul className={styles.serviceDropdown_list}>
        {Object.entries(categories).map(([id, category]) => (
          <li key={id}>
            <div className={styles.serviceDropdown_list_item}>
              <span>{category.name}</span>
              <img
                className={styles.serviceDropdown_list_item_arrow}
                src={arrowRight}
                alt=""
                style={{
                  transform:
                    openItem === id ? 'rotate(90deg)' : 'rotate(0deg)',
                  transition: 'transform 0.3s ease',
                }}
                onClick={() => setOpenItem(openItem === id ? null : id)}
              />
            </div>

            {openItem === id && category.subcategories.length > 0 && (
              <div className={styles.serviceDropdown_list_item_dropdown}>
                <ServiceCategoriesDropdown subcategories={category.subcategories.map(
                  subId => ({
                    id: subId,
                    name: subcategories[subId].name,
                  })
                )} />
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ServiceDropdownMobile;
