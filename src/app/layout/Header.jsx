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
  const financeLink = isContractor ? '/contractor/wallet' : '/client/settings/wallet';
  const balanceValue = Number(
    user.details?.balance ?? user.balance ?? user.contractor?.[0]?.balance ?? 0
  );
  const formattedBalance = Number.isFinite(balanceValue)
    ? new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 2 }).format(balanceValue)
    : '0';

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
          <img className={styles.toolbar_logo_img} src="/img/image.png" alt="Elitegig" />
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
          {!isContractor && (
            <Link
              to="/client/requests/create/data"
              className="header__button"
            >
              {text('order_on_exchange')}
            </Link>
          )}
          {!!user.id ? (
            <div className="header__account">
              <a className="header__icons" href="tel:+79697148750">
                <img src="/img/icons/phone.svg" alt="" />
              </a>
                <Link
                  to="/chats"
                  className="header__icons"
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
                onClick={() => {
                  setVisibleSetout(!visibleSetout);
                }}
              >
                <img
                  src={user.avatar || '/img/user_avatar.png'}
                  className="header__avatar"
                  alt=""
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
              <Link
                to={financeLink}
                className="header-finance"
                title={text('replenish_balance')}
              >
                <span className="header-finance__icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none">
                    <path d="M4 7.5h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-11a2 2 0 0 1 2-2h12" />
                    <path d="M16 11h5v5h-5a2.5 2.5 0 0 1 0-5Z" />
                    <circle cx="16.5" cy="13.5" r=".7" fill="currentColor" stroke="none" />
                  </svg>
                </span>
                <span className="header-finance__content">
                  <strong>{formattedBalance} ₽</strong>
                  <small>{text('Finance')}</small>
                </span>
              </Link>
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
