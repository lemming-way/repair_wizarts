import React, { useState } from 'react';

import arrowRight from '../../../../img/header/icons/arrow-right-icon.svg';
import styles from '../ServiceDropDownMobile/ServiceDropDownMobile.module.scss';
import ServiceCategoriesDropdown from './components/ServiceCategoriesDropdown/ServiceCategoriesDropdown';
import { useServices } from '../../../../state/site-data';

const ServiceDropdownMobile = () => {
  
  const { sections, subsections } = useServices();
  const [openItem, setOpenItem] = useState<string | null>(null);

  return (
    <div className={styles.serviceDropdown}>
      <ul className={styles.serviceDropdown_list}>
        {Object.entries(sections).map(([id, section]) => (
          <li key={id}>
            <div className={styles.serviceDropdown_list_item}>
              <span>{section.name}</span>
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

            {openItem === id && section.subsections.length > 0 && (
              <div className={styles.serviceDropdown_list_item_dropdown}>
                <ServiceCategoriesDropdown subsections={section.subsections.map(
                  subId => ({
                    id: subId,
                    name: subsections[subId].name,
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
