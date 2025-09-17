import React from "react";
import { useSelector } from "react-redux";
import { selectServices } from "../../slices/services.slice";
import styles from './FooterDesktop.module.scss';
import FooterInfo from "./components/FooterInfo";
import ListItem from "../../components/ListItem/ListItem";
import FooterMobile from "./FooterMobile/FooterMobile";
function App() {
    const services = useSelector(selectServices)

  return (
    <footer className={`${styles.footer} ${window.location.pathname.includes("/master") ? styles.footer_master : null}`}>
      <div className={styles.footer_footerContainer}>
        <div className={styles.footer_footerContainer_inner}>
          <FooterInfo/>

          {/*<div className="contfff">*/}
          {/*  <ul>*/}
          {/*    {services.service_types.map((v) => (*/}
          {/*      <li key={v.id}>*/}
          {/*        <Link to={"/devices/" + v.id}>{v.name}</Link>*/}
          {/*      </li>*/}
          {/*    ))}*/}
          {/*  </ul>*/}
          {/*</div>*/}

          {/*Заказчик попросил убрать*/}

          {/*<ul>*/}
          {/*  <ListItem link="/" name="Ремонт iPhone"/>*/}
          {/*  <ListItem link="/" name="Ремонт iPad"/>*/}
          {/*  <ListItem link="/" name="Ремонт MacBook"/>*/}
          {/*</ul>*/}

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
        <div className={styles.footer_mobile}>
          <FooterMobile/>
        </div>
        <div className={styles.footer_footerContainer_politics}>
          <ul>
            <ListItem link="/" name="Политика обработки персональных данных"/>
            <ListItem link="/" name="Пользовательское соглашение"/>
          </ul>
        </div>
      </div>
    </footer>
  )
}


export default App;
