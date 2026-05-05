import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Rating } from 'react-simple-star-rating';
import { useLanguage } from '../state/language';

import Badge from './Badge';
import { useUser } from 'app/state/user';
function Sidebar() {
  const text = useLanguage();
  const location = useLocation();

  // Получаем основные данные пользователя
  const { user } = useUser();

  // 2. Вызываем хук для получения данных о рейтинге  todo: добавить реальную статистику
  const { averageRating, feedbackCount, isLoading } = { averageRating: 0, feedbackCount: 0, isLoading: false };

  const [menuActive, setMenuActive] = useState(false);
  const [active, isActive] = useState(true);

  function suke() {
    setMenuActive(!menuActive);
    isActive(!active);
  }

  // Формируем имя и аватар
  const userAvatar = user.avatar || '/img/user_avatar.png';
  const userName = user.fullname || text('First Last');

  return (
    <div>
      <div className="fixed-content">
        <div className="left-content" style={{ left: menuActive ? '0' : null }}>
          <div className="dffds">
            <div className="img-content">
              <img src={userAvatar} alt={text("User's avatar")} style={{width: '110px', 'max-height': '110px'}} />
              <h3>{userName}</h3>
            </div>
            <div className="stars">
              {/* 3. Отображаем динамические данные рейтинга */}
              {isLoading ? (
                <p>{text('Loading rating...')}</p>
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
                location.pathname.includes('/contractor/wallet') ? 'active' : ''
              }
            >
              <img src="/img/img-exit.png" alt="" />
              <Link to="/contractor/wallet"> {text('Wallet')}</Link>
            </li>
            <li
              className={
                location.pathname.includes('/contractor/settings') ? 'active' : ''
              }
            >
              <img src="/img/img-contact.png" alt="" />
              <Link to="/contractor/settings"> {text('Settings')}</Link>
            </li>
            <li
              style={{ position: 'relative' }}
              className={
                location.pathname.includes('/chat')
                  ? 'active'
                  : ''
              }
            >
              <img src="/img/img-massage.png" alt="" />
              <Badge />
              <Link to="/chats">{text('Chat')}</Link>
            </li>
            <li
              style={{ position: 'relative' }}
              className={
                location.pathname.includes('/contractor/orders') ? 'active' : ''
              }
            >
              <img src="/img/img-list.png" alt="" />
              <Badge />
              <Link to="/contractor/orders"> {text('My applications')}</Link>
            </li>
            <li
              style={{ position: 'relative' }}
              className={
                location.pathname.includes('/contractor/feedback') ? 'active' : ''
              }
            >
              <img src="/img/img-white-star.png" alt="" />
              <Badge />
              <Link to="/contractor/feedback"> {text('My reviews')}</Link>
            </li>
            <li
              style={{ position: 'relative' }}
              className={
                location.pathname.includes('/contractor/requests') ? 'active' : ''
              }
            >
              <img src="/img/img-list-2.png " alt="" />
              <Link to="/contractor/requests"> {text('Order exchange')}</Link>
            </li>
          </ul>

          <Link to="/login" className="sidebar__link_exit">
            <div className="sidebar__link_exit__row">
              <img src="/img/img-exit-2.png" alt="" />
              <span>{text('Logout')}</span>
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
