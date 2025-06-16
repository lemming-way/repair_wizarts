import { useState, useRef, useEffect } from 'react';
import arrowDown from "../../../../img/header/icons/arrow-down-icon.svg";
import styles from './ServiceDropdown.module.scss';
import { useLanguage } from '../../../../context/LanguageContext';

const ServiceDropdownCities = () => {
  const { t } = useLanguage();
 
  const menu = [
    [t('Moscow'), t('and Moscow region')],
    [t('Saint Petersburg'), t('and Leningrad region')]
  ];

  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  let closeTimeout: NodeJS.Timeout;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div
      className={styles.serviceDropdown_wrapper}
      ref={dropdownRef}
      onMouseEnter={() => {
        clearTimeout(closeTimeout);
        setIsOpen(true);
      }}
      onMouseLeave={() => {
        closeTimeout = setTimeout(() => setIsOpen(false), 300);
      }}
    >
      <button
        className={styles.serviceDropdown_button}
        onClick={() => setIsOpen(prev => !prev)}
        style={{'color': 'white', 'background': 'none', 'border': 'none', 'fontSize': '16px'}}
      >
        <span style={{ fontWeight: 400 }}>{t('City')}</span>
        <img
          src={arrowDown}
          alt=""
          style={{
            transform: isOpen ? 'rotate(-90deg)' : 'rotate(0deg)',
            transition: 'transform 0.3s ease',
            marginLeft: '5px',
          }}
        />
      </button>
      
      {isOpen && (
        <div className={styles.serviceDropdown} style={{"backgroundColor": "transparent"}}>
          <div className={styles.menu_cities}>
            <input 
              type="text" 
              value={search} 
              onChange={(event) => setSearch(event.target.value)} 
              placeholder={t('select region or city')} 
            />
            {menu.map((menuItem, index) => (
              <div key={index} className={styles.sity}>
                {menuItem[0]} <span className={styles.small}>{menuItem[1]}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceDropdownCities;
