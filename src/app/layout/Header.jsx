import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';

import MobileMenu from './header/MobileMenu';
import DropdownSetout from './header/dropdownSetout';
import ServiceDropdown from './header/ServiceDropdown';
import ServiceDropdownCities from './header/ServiceDropdownCities';
import ToolbarButtons from './header/ToolbarButtons';
import styles from './header/Toolbar.module.scss';
import ListItem from './ListItem';
import './header/header.scss';
import { useLanguage } from '../state/language';
import { logout, useUser, UserRole } from '../state/user';

// Исправила и буду исправлять порядок импортов во всем проекте . Лучше импортировать в следующем порядке:
// 1: импорты React
// 2: импорты зависимостей
// 3: компонентов
// 4: стилей

const Toolbar = () => {
  const [visibleSetout, setVisibleSetout] = useState(false);
  const profileMenuRef = useRef(null);
  const [profileMenuPosition, setProfileMenuPosition] = useState({ top: 70, right: 15 });
  const [menuActive, setMenuActive] = useState(false);
  const text = useLanguage();
  const { user } = useUser();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const isContractor = user.role === UserRole.Contractor;
  const financeLink = isContractor ? '/contractor/wallet' : '/client/settings/wallet';
  const balanceValue = Number(
    user.details?.balance ?? user.balance ?? user.contractor?.[0]?.balance ?? 0
  );
  const formattedBalance = Number.isFinite(balanceValue)
    ? new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 2 }).format(balanceValue)
    : '0';

  const [isOpen, setIsOpen] = useState(false);
  const handleLogout = async () => {
    setIsOpen(false);
    await logout(queryClient);
    navigate('/');
  };
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
                ref={profileMenuRef}
                className={visibleSetout ? 'yosetout yosetout--open' : 'yosetout'}
                onClick={(event) => {
                  event.stopPropagation();
                  if (!visibleSetout && profileMenuRef.current) {
                    const rect = profileMenuRef.current.getBoundingClientRect();
                    setProfileMenuPosition({
                      top: rect.bottom + 8,
                      right: window.innerWidth - rect.right,
                    });
                  }
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
      {(isContractor || !user.id) && (
        <div
          className={[
            styles.toolbar_burger2,
            styles.toolbar_burger2_visibility_block,
          ].join(' ')}
          onClick={toggleMenu}
        >
          <div className={styles.toolbar_burger2_icon}></div>
        </div>
      )}
      {(isContractor || !user.id) && <div
        className={`${
          !!user.id
            ? styles.toolbar_burger2_profile_menu
            : styles.toolbar_burger2_menu
        } ${isOpen ? styles.toolbar_burger2_menu_active : ''}`}
      >
        {!!user.id ? (
          <>
            <div className={styles.toolbar_burger2_profile_header}>
              <img src={user.avatar || '/img/user_avatar.png'} alt="" />
              <strong>{[user.name, user.lastname].filter(Boolean).join(' ')}</strong>
              {isContractor && (
                <div className={styles.toolbar_burger2_profile_rating}>
                  <em>{user.contractor?.[0]?.rating ?? '0.0'}</em>
                  <span>★★★★★</span>
                  <em>({user.contractor?.[0]?.number_of_feedbacks ?? 0})</em>
                </div>
              )}
            </div>
            <Link onClick={() => setIsOpen(false)} to={financeLink}>
              <img src="/img/img-exit.png" alt="" />
              <span>{text('Wallet')}</span>
            </Link>
            <Link onClick={() => setIsOpen(false)} to={isContractor ? '/contractor/settings' : '/client/settings'}>
              <img src="/img/img-contact.png" alt="" />
              <span>{text('Settings')}</span>
            </Link>
            <Link onClick={() => setIsOpen(false)} to="/chats">
              <img src="/img/img-massage.png" alt="" />
              <span>{text('Chat')}</span>
              <b>1</b>
            </Link>
            <Link onClick={() => setIsOpen(false)} to={isContractor ? '/contractor/orders' : '/client/requests'}>
              <img src="/img/img-list.png" alt="" />
              <span>{isContractor ? 'Мои заявки' : text('My orders')}</span>
              <b>1</b>
            </Link>
            {isContractor && (
              <Link onClick={() => setIsOpen(false)} to="/contractor/feedback">
                <img src="/img/img-white-star.png" alt="" />
                <span>Мои отзывы</span>
                <b>1</b>
              </Link>
            )}
            <Link onClick={() => setIsOpen(false)} to={isContractor ? '/contractor/requests' : '/client/requests/my_orders'}>
              <img src="/img/img-list-2.png" alt="" />
              <span>{isContractor ? text('Order exchange') : text('All orders')}</span>
            </Link>
            <button
              type="button"
              className={styles.toolbar_burger2_logout}
              onClick={handleLogout}
            >
              <img src="/img/img-exit-2.png" alt="" />
              <span>{text('Logout')}</span>
            </button>
          </>
        ) : (
          <>
            <Link onClick={() => setIsOpen(false)} to="/login">{text('login')}</Link>
            <Link onClick={() => setIsOpen(false)} to="/register">{text('register')}</Link>
          </>
        )}
      </div>}

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
      {visibleSetout &&
        createPortal(
          <div
            className="bldropdown profile-dropdown-portal yosetout"
            style={profileMenuPosition}
            onClick={() => setVisibleSetout(false)}
          >
            <DropdownSetout />
          </div>,
          document.body
        )}
    </header>
  );
};

export default Toolbar;
