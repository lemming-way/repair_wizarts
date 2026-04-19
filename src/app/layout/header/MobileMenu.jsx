import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import ServiceDropDownMobile from './ServiceDropDownMobile';
import styles from './MobileMenu.module.scss';
import ListItem from '../ListItem';
import { useLanguage } from 'app/state/language';
import { useUser, UserRole } from 'app/state/user';
import logo from 'app/img/header/new-logotype.svg';


const MobileMenu = ({ setMenuActive }) => {
  const [openServices, setOpenServices] = useState(false);
  const [openItemCity, setOpenItemCity] = useState(false);
  const text = useLanguage();
  const { user } = useUser();
  const isClient = user.role === UserRole.Client;
  const isContractor = user.role === UserRole.Contractor;
  const menu = [
    [text('Moscow'), text('and Moscow region')],
    [text('Saint Petersburg'), text('and Leningrad region')],
  ];
  const [search, setSearch] = useState('');

  return (
    <div className={styles.mobileMenu}>
      <Link to="/" className={styles.logo_sidebar}>
        <img className={styles.toolbar_logo_img} src={logo} alt="Logo" />
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
          {openServices && <ServiceDropDownMobile />}
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
