import React, {useState} from 'react';
import ListItem from "../../components/ListItem/ListItem";
import ListItemElectronic from '../../components/ListItem/ListItemElectronic';
import ServiceDropDownMobile from "./components/ServiceDropDownMobile/ServiceDropDownMobile";
import styles from './MobileMenu.module.scss'
import logo from '../../img/header/new-logotype.svg';
import { Link } from 'react-router-dom';

const MobileMenu = ({setMenuActive}) => {
  const [openItem, setOpenItem] = useState(false);
  const [openElectronic, setOpenElectronic] = useState(false);
  const [openItemCity, setOpenItemCity] = useState(false);
  const menu = [['Москва', "и Московская область"], ['Санкт-Петербург', "и Ленинградская область"]];
  const [search, setSearch] = useState("");

  return (
    <div className={styles.mobileMenu}>

        <Link to="/" className={styles.logo_sidebar} >
          <img className={styles.toolbar_logo_img} src={logo} alt="Logo" />
        </Link>

      <ul className={styles.mobileMenu_lists}>
        <ListItem link="#" name="Услуги" className={styles.mobileMenu_lists_item} item={true} openItem={openElectronic} onClick={() => setOpenElectronic(!openElectronic)} />
          {openElectronic && <ListItemElectronic link="#footer" name="Электроника" item={true} openItem={openItem} className={styles.mobileMenu_lists_item_electronic} onClick={() => setOpenItem(!openItem)}/>}
          {openItem && <ServiceDropDownMobile />}
        <ListItem link="#" name="Город" className={styles.mobileMenu_lists_item} item={true} openItem={openItemCity} onClick={() => setOpenItemCity(!openItemCity)} />
          {openItemCity && 
            
            <div className={styles.menu_cities_modile}>
              <input type="text" name="" value={search} onChange={(event) => setSearch(event.target.value)} id="" style={{fontSize: "15px"}} placeholder='выберите регион или город' />
      
              {menu.map((menu, index) => (
                  <div key={index} className={styles.sity} style={{fontSize: "15px"}}>{menu[0]}<span style={{marginLeft: "auto"}} className={styles.small}>{menu[1]}</span></div>
              ))}
          </div>
          }

        <ListItem onClick={()=> setMenuActive(false)} link="/articles" name="Статьи"/>
        <ListItem onClick={()=> setMenuActive(false)} link="/reviews" name="Отзывы"/>
        <ListItem onClick={()=> setMenuActive(false)} link="/contact" name="Контакты"/>
        <ListItem onClick={()=> setMenuActive(false)} link="/client/requests/my_orders" name="Мои заказы"/>
      </ul>
    </div>
  );
};

export default MobileMenu;