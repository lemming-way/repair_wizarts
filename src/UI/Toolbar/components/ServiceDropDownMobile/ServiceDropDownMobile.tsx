import React, {useState} from 'react';
import arrowRight from '../../../../img/header/icons/arrow-right-icon.svg';
import styles from '../ServiceDropDownMobile/ServiceDropDownMobile.module.scss';
import ServiceCategoriesDropdown from "./components/ServiceCategoriesDropdown/ServiceCategoriesDropdown";

const ServiceDropdownMobile = () => {
  // Для скоращения кода и пройтись по циклу сохранила данные в массиве
  const data: string[] = ['Ремонт телефонов', 'Ремонт планшетов', 'Ремонт ноутбуков', 'Ремонт компьютеров', 'Ремонт часов', 'Аксессуары'];
  const [openItem, setOpenItem] = useState<number | null>(null);

  // Что бы отображался dropdown для подкатегории услуг и кнопка аниммировала только по клику на конкетный элемент
  const toggleItem = (index: number) => {
    setOpenItem(openItem === index ? null : index);
  };

  return (
    <div className={styles.serviceDropdown}>
      <ul className={styles.serviceDropdown_list}>
        {data.map((item, index) => (
          <li key={index}>
            <div className={styles.serviceDropdown_list_item}>
              <span>{item}</span>
              <img
                className={styles.serviceDropdown_list_item_arrow}
                src={arrowRight}
                alt=""
                style={{ transform: openItem === index ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 1s ease' }}
                onClick={() => toggleItem(index)}
              />
            </div>
            {openItem === index &&
              <div className={styles.serviceDropdown_list_item_dropdown}>
                <ServiceCategoriesDropdown />
              </div>
            }
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ServiceDropdownMobile;