import React from 'react';
import ListItem from "../../../components/ListItem/ListItem";
import FooterInfo from "../components/FooterInfo";
import styles from './FooterMobile.module.scss';

const FooterMobile = () => {
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
            <ListItem link="/" name="Новости"/>
            <ListItem link="/" name="Блог"/>
            <ListItem link="/" name="Акции и скидки"/>
            <ListItem link="/" name="Отзывы клиентов"/>
          </ul>

          <ul>
            <ListItem link="/" name="О компании"/>
            <ListItem link="/" name="Как мы работаем"/>
            <ListItem link="/" name="Гарантия"/>
            <ListItem link="/" name="Вакансии"/>
            <ListItem link="/" name="Контакты"/>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default FooterMobile;