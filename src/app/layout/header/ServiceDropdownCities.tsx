import { useState, useRef, useEffect } from 'react';

import styles from './ServiceDropdown.module.scss';
import { useLanguage } from 'app/state/language';
import { useGlobalState, setGlobal } from 'app/state/global';
import { useCities } from 'app/state/site-data';
import arrowDown from "app/img/header/icons/arrow-down-icon.svg";

const ServiceDropdownCities = () => {
  const text = useLanguage();
  const { cities } = useCities();
  const currentCity = useGlobalState('currentCity');

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

  const citiesArray = Object.entries(cities)
    .map(([id, city]) => ({ id, ...city }))
    .filter(city => !search || city.name.toLowerCase().includes(search.toLowerCase()));

  const setCity = (cityId) => {
    if (cityId && cities[cityId] && cityId !== currentCity) {
      setGlobal('currentCity', cityId);
      if (Number.isFinite(cities[cityId].latitude) && Number.isFinite(cities[cityId].longitude)) {
        setGlobal( 'map:location', {
          latitude: cities[cityId].latitude,
          longitude: cities[cityId].longitude
        } );
      }
    }
  };

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
        <span style={{ fontWeight: 400 }}>{text('City')}</span>
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
              placeholder={text('select region or city')} 
            />
            {citiesArray.map(city => (
              <div key={city.id} className={styles.sity} onClick={() => setCity(city.id)}>
                {city.name} {/* <span className={styles.small}>{menuItem[1]}</span> */}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceDropdownCities;
