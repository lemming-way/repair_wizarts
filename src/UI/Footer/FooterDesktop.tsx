import FooterInfo from "./components/FooterInfo";
import styles from './FooterDesktop.module.scss';
import FooterMobile from "./FooterMobile/FooterMobile";
import ListItem from "../../components/ListItem/ListItem";
import { useLanguage } from '../../context/LanguageContext';

function App() {
  const { t } = useLanguage();
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
        <div className={styles.footer_mobile}>
          <FooterMobile/>
        </div>
        <div className={styles.footer_footerContainer_politics}>
          <ul>
            <ListItem link="/" name={t("Privacy Policy")} />
            <ListItem link="/" name={t("User Agreement")} />
          </ul>
        </div>
      </div>
    </footer>
  )
}


export default App;
