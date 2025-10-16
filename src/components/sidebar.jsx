import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Rating } from 'react-simple-star-rating';

import AlertMessage from './AlertMessage/AlertMessage';
import { useUserRating } from '../hooks/useUserRating';
import { useUserQuery } from '../hooks/useUserQuery';
function Sidebar() {
  const location = useLocation();

  // Получаем основные данные пользователя
  const { user: queriedUser } = useUserQuery();
  const user = queriedUser || {};

  // 2. Вызываем хук для получения данных о рейтинге
  const { averageRating, feedbackCount, isLoading } = useUserRating();

  const [menuActive, setMenuActive] = useState(false);
  const [active, isActive] = useState(true);

  function suke() {
    setMenuActive(!menuActive);
    isActive(!active);
  }

  // Формируем имя и аватар
  const userAvatar = user?.u_photo || '/img/profil_img/1.png';
  const userName =
    `${user?.u_name || ''} ${user?.u_family || ''}`.trim() ||
    'Имя Фамилия';

  return (
    <div>
      <div className="fixed-content">
        <div className="left-content" style={{ left: menuActive ? '0' : null }}>
          <div className="dffds">
            <div className="img-content">
              <img src={userAvatar} alt="Аватар пользователя" />
              <h3>{userName}</h3>
            </div>
            <div className="stars">
              {/* 3. Отображаем динамические данные рейтинга */}
              {isLoading ? (
                <p>Загрузка рейтинга...</p>
              ) : (
                <p>
                  {averageRating.toFixed(1)} {/* Показываем средний рейтинг */}
                  <Rating
                    readonly
                    initialValue={averageRating}
                    size="22"
                    allowFraction // Позволяет отображать дробные звезды
                  />
                  ({feedbackCount}) {/* Показываем количество отзывов */}
                </p>
              )}
            </div>
          </div>
          <ul className="ul-wrap" style={{ paddingLeft: 0 }}>
            <li
              className={
                location.pathname.includes('/master/wallet') ? 'active' : ''
              }
            >
              <img src="/img/img-exit.png" alt="" />
              <Link to="/master/wallet"> Кошелек</Link>
            </li>
            <li
              className={
                location.pathname.includes('/master/settings') ? 'active' : ''
              }
            >
              <img src="/img/img-contact.png" alt="" />
              <Link to="/master/settings"> Настройки</Link>
            </li>
            <li
              style={{ position: 'relative' }}
              className={
                location.pathname.includes('/master/chat') ||
                location.pathname.includes('/168789461')
                  ? 'active'
                  : ''
              }
            >
              <img src="/img/img-massage.png" alt="" />
              <AlertMessage />
              <Link to="/master/chat">Чат</Link>
            </li>
            <li
              style={{ position: 'relative' }}
              className={
                location.pathname.includes('/master/orders') ? 'active' : ''
              }
            >
              <img src="/img/img-list.png" alt="" />
              <AlertMessage />
              <Link to="/master/orders"> Мои заявки</Link>
            </li>
            <li
              style={{ position: 'relative' }}
              className={
                location.pathname.includes('/master/feedback') ? 'active' : ''
              }
            >
              <img src="/img/img-white-star.png" alt="" />
              <AlertMessage />
              <Link to="/master/feedback"> Мои отзывы</Link>
            </li>
            <li
              style={{ position: 'relative' }}
              className={
                location.pathname.includes('/master/requests') ? 'active' : ''
              }
            >
              <img src="/img/img-list-2.png " alt="" />
              <Link to="/master/requests"> Биржа заказов</Link>
            </li>
          </ul>

          <Link to="/login" className="sidebar__link_exit">
            <div className="sidebar__link_exit__row">
              <img src="/img/img-exit-2.png" alt="" />
              <span>Выйти</span>
            </div>
          </Link>
        </div>
      </div>
      <div
        className={
          active ? 'sideburger-btn' : 'sideburgeractive sideburger-btn'
        }
        onClick={() => suke()}
      >
        <span />
      </div>
    </div>
  );
}

export default Sidebar;
