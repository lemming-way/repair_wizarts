import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import ServiceDropDownMobile from './components/ServiceDropDownMobile/ServiceDropDownMobile';
import styles from './MobileMenu.module.scss';
import ListItem from '../../components/ListItem/ListItem';
import ListItemElectronic from '../../components/ListItem/ListItemElectronic';
import { useLanguage } from '../../context/LanguageContext';
import logo from '../../img/header/new-logotype.svg';


const MobileMenu = ({ setMenuActive }) => {
  const [openItem, setOpenItem] = useState(false);
  const [openElectronic, setOpenElectronic] = useState(false);
  const [openItemCity, setOpenItemCity] = useState(false);
  const { t } = useLanguage();
  const menu = [
    [t('Moscow'), t('and Moscow region')],
    [t('Saint Petersburg'), t('and Leningrad region')],
  ];
  const [search, setSearch] = useState('');

  return (
    <div className={styles.mobileMenu}>
      <Link to="/" className={styles.logo_sidebar}>
        <img className={styles.toolbar_logo_img} src={logo} alt="Logo" />
      </Link>

      <ul className={styles.mobileMenu_lists}>
        <ListItem
          link="#"
          name={t('Services')}
          className={styles.mobileMenu_lists_item}
          item={true}
          openItem={openElectronic}
          onClick={() => setOpenElectronic(!openElectronic)}
        />
        {openElectronic && (
          <ListItemElectronic
            link="#footer"
            name={t('Electronics')}
            item={true}
            openItem={openItem}
            className={styles.mobileMenu_lists_item_electronic}
            onClick={() => setOpenItem(!openItem)}
          />
        )}
        {openItem && <ServiceDropDownMobile />}
        <ListItem
          link="#"
          name={t('City')}
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
              placeholder={t('select region or city')}
            />

            {menu.map((menu, index) => (
              <div
                key={index}
                className={styles.sity}
                style={{ fontSize: '15px' }}
              >
                {menu[0]}
                <span style={{ marginLeft: 'auto' }} className={styles.small}>
                  {menu[1]}
                </span>
              </div>
            ))}
          </div>
        )}

        <ListItem
          onClick={() => setMenuActive(false)}
          link="/articles"
          name={t('Articles')}
        />
        <ListItem
          onClick={() => setMenuActive(false)}
          link="/reviews"
          name={t('Reviews')}
        />
        <ListItem
          onClick={() => setMenuActive(false)}
          link="/contact"
          name={t('Contacts')}
        />
        <ListItem
          onClick={() => setMenuActive(false)}
          link="/client/requests/my_orders"
          name={t('My orders')}
        />
      </ul>
    </div>
  );
};

export default MobileMenu;
