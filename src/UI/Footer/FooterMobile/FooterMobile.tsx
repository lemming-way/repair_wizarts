import React from 'react';

import styles from './FooterMobile.module.scss';
import ListItem from "../../../components/ListItem/ListItem";
import { useLanguage } from '../../../state/language';
import FooterInfo from "../components/FooterInfo";

const FooterMobile = () => {
  const text = useLanguage();

  return (
    <div className={styles.mobileFooter}>
      <FooterInfo/>

      <div className={styles.mobileFooter_mainBlock}>
        {/*Заказчик попросил убрать*/}

        {/*<div className={styles.mobileFooter_mainBlock_services}>*/}
        {/*  <ul>*/}
        {/*    <ListItem link="/" name="Ремонт iPhone"/>*/}
        {/*    <ListItem link="/" name="Ремонт iPad"/>*/}
        {/*    <ListItem link="/" name="Ремонт MacBook"/>*/}
        {/*  </ul>*/}
        {/*</div>*/}

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
