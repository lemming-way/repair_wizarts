import React from 'react';

import styles from './FooterMobile.module.scss';
import ListItem from '../ListItem';
import { useLanguage } from 'app/state/language';
import FooterInfo from "./FooterInfo";

const FooterMobile = () => {
  const text = useLanguage();

  return (
    <div className={styles.mobileFooter}>
      <FooterInfo/>

      <div className={styles.mobileFooter_mainBlock}>
        <div className={styles.mobileFooter_mainBlock_corpInfo}>
          <ul>
            <ListItem link="/" name={text("News")} />
            <ListItem link="/" name={text("Blog")} />
            <ListItem link="/" name={text("Promotions and Discounts")} />
            <ListItem link="/" name={text("Customer Reviews")} />
          </ul>

          <ul>
            <ListItem link="/" name={text("About Us")} />
            <ListItem link="/" name={text("How We Work")} />
            <ListItem link="/" name={text("Warranty")} />
            <ListItem link="/" name={text("Vacancies")} />
            <ListItem link="/" name={text("Contacts")} />
          </ul>
        </div>
      </div>
    </div>
  );
};

export default FooterMobile;
