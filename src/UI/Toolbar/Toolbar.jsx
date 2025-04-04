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

// Исправила и буду исправлять порядок импортов во всем проекте . Лучше импортировать в следующем порядке:
// 1: импорты React
// 2: импорты зависимостей
// 3: компонентов
// 4: стилей

const Toolbar = () => {
  const [visibleCountry, setVisibleCountry] = useState(false);
  const [visibleSetout, setVisibleSetout] = useState(false);
  const [menuActive, setMenuActive] = useState(false);

  const ui = useSelector(selectUI);
  const user = useSelector(selectUser);

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

  return (
    <header>
      <div className={`${styles.toolbar} appContainer`}>
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
            name="Статьи"
          />
          <ListItem
            link="/reviews"
            className={styles.toolbar_lists_item_link}
            name="Отзывы"
          />
          <ListItem
            link="/contact"
            className={styles.toolbar_lists_item_link}
            name="Контакты"
          />
          {/* <ListItem link="/orders" className={styles.toolbar_lists_item_link} name="Мои заказы"/> */}
        </ul>
        {/* <div className="header__profile"> */}
        {ui.isAuthorized ? (
          <div className="header__profile">
            {ui.isMaster ? (
              <Link
                to={'/client/requests/create/title'}
                className="header__button"
              >
                Дать задание
              </Link>
            ) : (
              <Link
                to={'/client/requests/create/title'}
                className="header__button"
              >
                Заказать на бирже
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
                src={
                  user.avatar
                    ? SERVER_PATH + user.avatar
                    : '/img/icons/avatar.png'
                }
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
              <p className="master__moneys">
                <>
                  {ui.isMaster ? (
                    <>parseFloat(user.master[0].balance).toFixed(2)₽</>
                  ) : null}
                </>
              </p>
              <div className="master__moneys__full">
                <Link to="/master/wallet">Пополнить баланс</Link>
              </div>
            </>
          </div>
        ) : (
          // Вынесла в отдельный компонент кнопки, чтобы сократить код
          <div className="header__visible-mobile">
            <ToolbarButtons />
          </div>
        )}
        {/* </div> */}
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
      <div className={styles.toolbar_burger2} onClick={toggleMenu}>
        <div className={styles.toolbar_burger2_icon}></div>
      </div>
      {isOpen && (
        <div className={styles.toolbar_burger2_menu}>
          <Link onClick={() => setIsOpen(false)} to="/login">
            Вход
          </Link>
          <Link onClick={() => setIsOpen(false)} to="/register">
            Регистрация
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
