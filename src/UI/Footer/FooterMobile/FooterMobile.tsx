import React from 'react';
import ListItem from "../../../components/ListItem/ListItem";
import FooterInfo from "../components/FooterInfo";
import styles from './FooterMobile.module.scss';
import { useLanguage } from '../../../context/LanguageContext';

const FooterMobile = () => {
  const { t } = useLanguage();

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
            <ListItem link="/" name={t("News")} />
            <ListItem link="/" name={t("Blog")} />
            <ListItem link="/" name={t("Promotions and Discounts")} />
            <ListItem link="/" name={t("Customer Reviews")} />
          </ul>

          <ul>
            <ListItem link="/" name={t("About Us")} />
            <ListItem link="/" name={t("How We Work")} />
            <ListItem link="/" name={t("Warranty")} />
            <ListItem link="/" name={t("Vacancies")} />
            <ListItem link="/" name={t("Contacts")} />
          </ul>
        </div>
      </div>
    </div>
  );
};

export default FooterMobile;