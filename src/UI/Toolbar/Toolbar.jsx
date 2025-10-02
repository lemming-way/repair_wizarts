import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

import MobileMenu from './MobileMenu';
import DropdownSetout from '../../components/dropdownSetout';
import ServiceDropdown from './components/ServiceDropdown/ServiceDropdown';
import ServiceDropdownCities from './components/ServiceDropdownCities/ServiceDropdownCities';
import ToolbarButtons from './components/ToolbarButtons/ToolbarButtons';
import styles from './Toolbar.module.scss';
import ListItem from '../../components/ListItem/ListItem';
import './header.scss';
import { useLanguage } from '../../state/language';
import logo from '../../img/header/new-logotype.svg';
import { selectUI } from '../../slices/ui.slice';
import { selectUser } from '../../slices/user.slice';

// Исправила и буду исправлять порядок импортов во всем проекте . Лучше импортировать в следующем порядке:
// 1: импорты React
// 2: импорты зависимостей
// 3: компонентов
// 4: стилей

const Toolbar = () => {
  const [visibleSetout, setVisibleSetout] = useState(false);
  const [menuActive, setMenuActive] = useState(false);
  const text = useLanguage();
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

  useEffect(() => {
    const onDocClick = (e) => {
      if (!e.target.closest('.yosetout')) {
        setVisibleSetout(false);
      }
    };
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
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
          {ui.isAuthorized ? (
            <div className="header__profile">
              {ui.isMaster ? (
                <Link
                  to={'/client/requests/create/title'}
                  className="header__button"
                >
                   {text('give_task')}
                </Link>
              ) : (
                <Link
                  to={'/client/requests/create/title'}
                  className="header__button"
                >
                    {text('order_on_exchange')}
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

                <div className="bldropdown">
                  {visibleSetout ? <DropdownSetout /> : null}
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
                  <Link to="/master/wallet">{text('replenish_balance')}</Link>
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
