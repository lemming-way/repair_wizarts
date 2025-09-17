import React, { useState } from 'react';
import arrowRight from '../../../../img/header/icons/arrow-right-icon.svg';
import styles from '../ServiceDropDownMobile/ServiceDropDownMobile.module.scss';
import ServiceCategoriesDropdown from './components/ServiceCategoriesDropdown/ServiceCategoriesDropdown';
import { useSelector } from 'react-redux';
import { useLanguage } from '../../../../context/LanguageContext';
const ServiceDropdownMobile = () => {
  const { t } = useLanguage();
  
  const categories = useSelector(
    (state: any) => state.categories.categories || [],
  );
  // Для скоращения кода и пройтись по циклу сохранила данные в массиве
  const data: string[] = [
    t('Phone repair'),
    t('Tablet repair'),
    t('Laptop repair'),
    t('Computer repair'),
    t('Watch repair'),
    t('Accessories'),
  ];
  const [openItem, setOpenItem] = useState<number | null>(null);

  // Что бы отображался dropdown для подкатегории услуг и кнопка аниммировала только по клику на конкетный элемент
  const toggleItem = (index: number) => {
    setOpenItem(openItem === index ? null : index);
  };

  return (
    <div className={styles.serviceDropdown}>
      <ul className={styles.serviceDropdown_list}>
        {categories.map((category, index) => (
          <li key={category.id}>
            <div className={styles.serviceDropdown_list_item}>
              <span>{category.name}</span>
              <img
                className={styles.serviceDropdown_list_item_arrow}
                src={arrowRight}
                alt=""
                style={{
                  transform:
                    openItem === index ? 'rotate(90deg)' : 'rotate(0deg)',
                  transition: 'transform 0.3s ease',
                }}
                onClick={() => toggleItem(index)}
              />
            </div>

            {openItem === index && category?.subsections?.length > 0 && (
              <div className={styles.serviceDropdown_list_item_dropdown}>
                <ServiceCategoriesDropdown subsections={category.subsections} />
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ServiceDropdownMobile;
