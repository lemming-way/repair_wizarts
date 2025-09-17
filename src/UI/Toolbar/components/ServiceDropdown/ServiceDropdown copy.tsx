import React, {useState} from 'react';
import Dropdown from "react-multilevel-dropdown";
import arrowDown from "../../../../img/header/icons/arrow-down-icon.svg";
import styles from './ServiceDropdown.module.scss';


const ServiceDropdown = () => {
  const menu: string[] = ['Ремонт телефонов', 'Ремонт планшетов', 'Ремонт ноутбуков', 'Ремонт компьютеров', 'Ремонт часов', 'Аксессуары'];
  const submenuData: string[] = ['Ремонт iPhone', 'Ремонт iPad', 'Ремонт MacBook'];

  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dropdown
      title={
        <>
          <span>Услуги</span>
          <img
            src={arrowDown}
            alt=""
            style={{
              transform: isOpen ? 'rotate(-90deg)' : 'rotate(0deg)',
              transition: 'transform 1s ease',
              marginLeft: '5px',
            }}
          />
        </>
      }
      isActive={isOpen}
      menuClassName={styles.serviceDropdown}
      wrapperClassName={styles.serviceDropdown_wrapper}
      buttonClassName={styles.serviceDropdown_button}
      onClick={() => setIsOpen(!isOpen)}
      position="left"
    >
      
      {menu.map((menu, index) => (
        <Dropdown.Item className={styles.serviceDropdown_item} key={index}>
          <span className={styles.serviceDropdown_item_menu}>{menu}</span>
          <Dropdown.Submenu position="right-top" className={styles.Submenu_submenu}>
            {submenuData.map((submenu, index) => (
              <Dropdown.Item className={styles.serviceDropdown_item} key={index}>
                <span>{submenu}</span>
              </Dropdown.Item>
            ))}
          </Dropdown.Submenu>
        </Dropdown.Item>
      ))}
    </Dropdown>
  );
};

export default ServiceDropdown;