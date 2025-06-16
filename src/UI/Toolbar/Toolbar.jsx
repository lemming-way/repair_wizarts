import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import SERVER_PATH from '../../constants/SERVER_PATH';
import { selectUI } from '../../slices/ui.slice';
import { selectUser } from '../../slices/user.slice';
import DropdownSetout from '../../components/dropdownSetout';
import ListItem from '../../components/ListItem/ListItem';
import ToolbarButtons from './components/ToolbarButtons/ToolbarButtons';
import MobileMenu from './MobileMenu';
import ServiceDropdown from './components/ServiceDropdown/ServiceDropdown';
import ServiceDropdownCities from './components/ServiceDropdownCities/ServiceDropdownCities';
import logo from '../../img/header/new-logotype.svg';
import styles from './Toolbar.module.scss';
import './header.scss';
import { useLanguage } from '../../context/LanguageContext';

// Исправила и буду исправлять порядок импортов во всем проекте . Лучше импортировать в следующем порядке:
// 1: импорты React
// 2: импорты зависимостей
// 3: компонентов
// 4: стилей

const Toolbar = () => {
  const [visibleCountry, setVisibleCountry] = useState(false);
  const [visibleSetout, setVisibleSetout] = useState(false);
  const [menuActive, setMenuActive] = useState(false);
  const { t, language, setLanguage } = useLanguage();
  const ui = useSelector(selectUI);
  const user =
    Object.values(useSelector(selectUser)?.data?.user || {})[0] || {};

  const [isOpen, setIsOpen] = useState(false);
  const toggleMenu = () => {
    console.log('click');
    console.log(isOpen);
    setIsOpen((prevState) => !prevState);
  };

  useEffect(() => {
    document.querySelector('main').addEventListener('click', function () {
      setIsOpen(false);
    });
  }, []);
  console.log(ui.isAuthorized);
  return (
    <header>
      <div className={`${styles.toolbar} appContainer test`}>
        {/*Заменила лого по требованию ТЗ*/}
        <Link to="/" className={styles.toolbar_logo}>
          <img className={styles.toolbar_logo_img} src={logo} alt="Logo" />
        </Link>
        {/*Добавила поиск услуг*/}
        {/* <ToolbarSearchBar /> */}
        <ul className={styles.toolbar_lists}>
          <li className={styles.toolbar_lists_item}>
            {/*Вынесла в отдельный компонент, что бы лучше ориентироваться по коду*/}
            <ServiceDropdown />
          </li>
          {/* город */}
          <li className={styles.toolbar_lists_item}>
            <ServiceDropdownCities />
          </li>
          {/*Что бы сократить код и переиспользовать в будущем создала компонент ListItem*/}
          <ListItem
            link="/articles"
            className={styles.toolbar_lists_item_link}
            name={t('articles')}
          />
          <ListItem
            link="/reviews"
            className={styles.toolbar_lists_item_link}
            name={t('reviews')}
          />
          <ListItem
            link="/contact"
            className={styles.toolbar_lists_item_link}
            name={t('contacts')}
          />
          {/* <ListItem link="/orders" className={styles.toolbar_lists_item_link} name="Мои заказы"/> */}
        </ul>
        <div className="header__profile">
          {ui.isAuthorized ? (
            <div className="header__profile">
              {ui.isMaster ? (
                <Link
                  to={'/client/requests/create/title'}
                  className="header__button"
                >
                   {t('give_task')}
                </Link>
              ) : (
                <Link
                  to={'/client/requests/create/title'}
                  className="header__button"
                >
                    {t('order_on_exchange')}
                </Link>
              )}

              <a className="header__icons" href="tel:+79697148750">
                <img src="/img/icons/phone.svg" alt="" />
              </a>
              <Link
                to={ui.isMaster ? '/master/chat' : '/client/chat'}
                className="header__icons"
                style={{ display: 'flex', position: 'relative' }}
                onClick={() => {
                  setVisibleCountry(false);
                  setVisibleSetout(false);
                }}
              >
                <img className="" src="/img/icons/message.svg" alt="" />
                {/* {messages.count > 0 && <div className='chat-message-counter'>{messages.count}</div>} */}
                <div className="chat-message-counter">1</div>
              </Link>
              <div
                className="yosetout"
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  setVisibleSetout(!visibleSetout);
                  setVisibleCountry(false);
                }}
              >
                <img
                  src={user.u_photo ? user.u_photo : '/img/icons/avatar.png'}
                  width="40px"
                  height="40px"
                  alt=""
                  style={{
                    borderRadius: '20px',
                    objectFit: 'cover',
                    border: '2px solid white',
                    scale: '1.2',
                    marginLeft: '5px',
                    marginRight: '5px',
                  }}
                />
                <div className="dropdownuser_arrow-wrap">
                  <img
                    src="/img/dropdownuser.png"
                    className="dropdownuser_arrow"
                    alt=""
                  />
                </div>

                {/* {visibleSetout ? <DropdownSetout /> : null} */}
                <div className="bldropdown">
                  <DropdownSetout />
                </div>
                {/* </Link> */}
              </div>
              <>
                {/* <p className="master__moneys">
                  <>
                    {ui.isMaster ? (
                      <>parseFloat(user.master[0].balance).toFixed(2)₽</>
                    ) : null}
                  </>
                </p> */}
                <div className="master__moneys__full">
                  <Link to="/master/wallet">{t('replenish_balance')}</Link>
                </div>
              </>
            </div>
          ) : (
            // Вынесла в отдельный компонент кнопки, чтобы сократить код
            <div className="header__visible-mobile">
              <ToolbarButtons />
            </div>
          )}
        </div>
      </div>

      <div
        className={styles.toolbar_burger}
        onClick={() => setMenuActive(!menuActive)}
      ></div>

      {/*Вынесла в отдельный компонент кнопки, чтобы сократить код*/}
      {/* мобильное меню в левом бургере */}
      <div className={styles.toolbar_mobile}>
        <div
          className={
            menuActive
              ? `${styles.toolbar_mobile_menu} ${styles.toolbar_mobile_menu_active}`
              : `${styles.toolbar_mobile_menu}`
          }
        >
          <MobileMenu setMenuActive={setMenuActive} />
        </div>
      </div>

      {/* правое бургер в мобильной */}
      {/* временно добавил display none, пока нет авторизации */}
      <div
        className={[
          styles.toolbar_burger2,
          ui.isAuthorized
            ? styles.toolbar_burger2_visibility_none
            : styles.toolbar_burger2_visibility_block,
        ].join(' ')}
        onClick={toggleMenu}
      >
        <div className={styles.toolbar_burger2_icon}></div>
      </div>
      {isOpen && (
        <div className={styles.toolbar_burger2_menu}>
          <Link onClick={() => setIsOpen(false)} to="/login">
          {t('login')}
          </Link>
          <Link onClick={() => setIsOpen(false)} to="/register">
          {t('register')}
          </Link>
        </div>
      )}

      {/* modile левое меню */}
      {/* <div className={styles.toolbar_mobile2}>
          <div className={menuActive2 ?
            `${styles.toolbar_mobile_menu} ${styles.toolbar_mobile_menu_active}`
            :
            `${styles.toolbar_mobile_menu}`
          }>
            <MobileMenu/>
          </div>
      </div> */}
    </header>
  );
};

export default Toolbar;
