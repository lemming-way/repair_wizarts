import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import ServiceDropDownMobile from './ServiceDropDownMobile';
import styles from './MobileMenu.module.scss';
import ListItem from '../ListItem';
import { useLanguage } from 'app/state/language';
import { useUser, UserRole } from 'app/state/user';
import { useCities } from 'app/state/site-data';
import { setGlobal, useGlobalState } from 'app/state/global';


const MobileMenu = ({ setMenuActive }) => {
  const [openServices, setOpenServices] = useState(false);
  const [openItemCity, setOpenItemCity] = useState(false);
  const text = useLanguage();
  const { user } = useUser();
  const isClient = user.role === UserRole.Client;
  const isContractor = user.role === UserRole.Contractor;
  const { cities } = useCities();
  const currentCity = useGlobalState('currentCity');
  const [search, setSearch] = useState('');
  const cityList = Object.entries(cities)
    .map(([id, city]) => ({ id, ...city }))
    .filter(city => !search || city.name.toLowerCase().includes(search.toLowerCase()));

  const setCity = (cityId) => {
    if (!cityId || !cities[cityId] || cityId === String(currentCity)) return;
    setGlobal('currentCity', cityId);
    if (Number.isFinite(cities[cityId].latitude) && Number.isFinite(cities[cityId].longitude)) {
      setGlobal('map:location', {
        latitude: cities[cityId].latitude,
        longitude: cities[cityId].longitude,
      });
    }
  };

  return (
    <div className={styles.mobileMenu}>
      <Link to="/" className={styles.logo_sidebar}>
        <img className={styles.toolbar_logo_img} src="/img/image.png" alt="Elitegig" />
      </Link>

      <ul className={styles.mobileMenu_lists}>
        {!isContractor && <>
          <ListItem
            link="#"
            name={text('Services')}
            className={styles.mobileMenu_lists_item}
            item={true}
            openItem={openServices}
            onClick={() => setOpenServices(!openServices)}
          />
          {openServices && <ServiceDropDownMobile onNavigate={() => setMenuActive(false)} />}
          <ListItem
            link="#"
            name={text('City')}
            className={styles.mobileMenu_lists_item}
            item={true}
            openItem={openItemCity}
            onClick={() => setOpenItemCity(!openItemCity)}
          />
          {openItemCity && (
            <div className={styles.menu_cities_modile}>
              <input
                type="text"
                name=""
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                id=""
                style={{ fontSize: '15px' }}
                placeholder={text('select region or city')}
              />

              {cityList.map(city => (
                <div
                  key={city.id}
                  className={`${styles.sity} ${String(currentCity) === city.id ? styles.sity_selected : ''}`}
                  style={{ fontSize: '15px' }}
                  onClick={() => setCity(city.id)}
                  aria-selected={String(currentCity) === city.id}
                >
                  {city.name}
                </div>
              ))}
            </div>
          )}
        </>}

        <ListItem
          onClick={() => setMenuActive(false)}
          link="/articles"
          name={text('Articles')}
        />
        <ListItem
          onClick={() => setMenuActive(false)}
          link="/reviews"
          name={text('Reviews')}
        />
        <ListItem
          onClick={() => setMenuActive(false)}
          link="/contact"
          name={text('Contacts')}
        />
        {isClient &&
          <ListItem
            onClick={() => setMenuActive(false)}
            link="/client/requests/my_orders"
            name={text('My orders')}
          />
        }
      </ul>
    </div>
  );
};

export default MobileMenu;
