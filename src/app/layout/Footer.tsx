import FooterInfo from "./footer/FooterInfo";
import styles from './footer/FooterDesktop.module.scss';
import FooterMobile from "./footer/FooterMobile";
import ListItem from "./ListItem";
import { useLanguage } from '../state/language';

function FooterDesktop() {
  const text = useLanguage();
  return (
    <footer className={`${styles.footer} ${window.location.pathname.includes("/contractor") ? styles.footer_contractor : null}`}>
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
        <div className={styles.footer_mobile}>
          <FooterMobile/>
        </div>
        <div className={styles.footer_footerContainer_politics}>
          <ul>
            <ListItem link="/" name={text("Privacy Policy")} />
            <ListItem link="/" name={text("User Agreement")} />
          </ul>
        </div>
      </div>
    </footer>
  )
}


export default FooterDesktop;
