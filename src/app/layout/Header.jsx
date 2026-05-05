import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import MobileMenu from './header/MobileMenu';
import DropdownSetout from './header/dropdownSetout';
import ServiceDropdown from './header/ServiceDropdown';
import ServiceDropdownCities from './header/ServiceDropdownCities';
import ToolbarButtons from './header/ToolbarButtons';
import styles from './header/Toolbar.module.scss';
import ListItem from './ListItem';
import './header/header.scss';
import logo from '../img/header/new-logotype.svg';
import { useLanguage } from '../state/language';
import { useUser, UserRole } from '../state/user';

// Исправила и буду исправлять порядок импортов во всем проекте . Лучше импортировать в следующем порядке:
// 1: импорты React
// 2: импорты зависимостей
// 3: компонентов
// 4: стилей

const Toolbar = () => {
  const [visibleSetout, setVisibleSetout] = useState(false);
  const [menuActive, setMenuActive] = useState(false);
  const text = useLanguage();
  const { user } = useUser();

  const isContractor = user.role === UserRole.Contractor;

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

  useEffect(() => {
    const onDocClick = (e) => {
      if (!e.target.closest('.yosetout')) {
        setVisibleSetout(false);
      }
    };
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, []);
  return (
    <header className={styles['toolbar-header']}>
      <div className={`${styles.toolbar} appContainer`}>
        <Link to="/" className={styles.toolbar_logo}>
          <img className={styles.toolbar_logo_img} src={logo} alt="Logo" />
        </Link>
        <ul className={styles.toolbar_lists}>
          {!isContractor && (
            <>
              {/*Добавила поиск услуг*/}
              {/* <ToolbarSearchBar /> */}
              <li className={styles.toolbar_lists_item}>
                <ServiceDropdown />
              </li>
              {/* город */}
              <li className={styles.toolbar_lists_item}>
                <ServiceDropdownCities />
              </li>
            </>
          )}
          <ListItem
            link="/articles"
            className={styles.toolbar_lists_item_link}
            name={text('articles')}
          />
          <ListItem
            link="/reviews"
            className={styles.toolbar_lists_item_link}
            name={text('reviews')}
          />
          <ListItem
            link="/contact"
            className={styles.toolbar_lists_item_link}
            name={text('contacts')}
          />
          {/* <ListItem link="/orders" className={styles.toolbar_lists_item_link} name="Мои заказы"/> */}
        </ul>
        <div className="header__profile">
          {!!user.id ? (
            <div className="header__profile">
              {!isContractor && (
                <Link
                  to={'/client/requests/create/data'}
                  className="header__button"
                >
                    {text('order_on_exchange')}
                </Link>
              )}

              <a className="header__icons" href="tel:+79697148750">
                <img src="/img/icons/phone.svg" alt="" />
              </a>
                <Link
                  to="/chats"
                  className="header__icons"
                  style={{ display: 'flex', position: 'relative' }}
                  onClick={() => {
                    setVisibleSetout(false);
                  }}
                >
                <img className="" src="/img/icons/message.svg" alt="" />
                {/* {messages.count > 0 && <div className='chat-message-counter'>{messages.count}</div>} */}
                <div className="chat-message-counter">1</div>
              </Link>
              <div
                className={visibleSetout ? 'yosetout yosetout--open' : 'yosetout'}
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  setVisibleSetout(!visibleSetout);
                }}
              >
                <img
                  src={user.avatar || '/img/user_avatar.png'}
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

                <div className="bldropdown">
                  {visibleSetout ? <DropdownSetout /> : null}
                </div>
                {/* </Link> */}
              </div>
              <>
                {/* <p className="contractor__moneys">
                  <>
                    {ui.isContractor ? (
                      <>parseFloat(user.contractor[0].balance).toFixed(2)₽</>
                    ) : null}
                  </>
                </p> */}
                <div className="contractor__moneys__full">
                  <Link to="/contractor/wallet">{text('replenish_balance')}</Link>
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
          !!user.id
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
          {text('login')}
          </Link>
          <Link onClick={() => setIsOpen(false)} to="/register">
          {text('register')}
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
