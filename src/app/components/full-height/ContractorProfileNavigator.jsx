import { Link } from 'react-router-dom';

import style from './ContractorProfileNavigator.module.css';
// import { useNavigate, useParams } from 'react-router-dom'
// import "./ClientProfileNavigator.css"

export default function ContractorProfileNavigator({
  numberElementMenu,
  offsetMenu,
}) {
  return (
    <>
      <div className={style.navigator_block}>
        <Link
          style={{
            translate: `${-170 * offsetMenu}px`,
            padding: '20px 30px 17px 30px',
          }}
          className={`${style.link}  ${
            window.location.pathname === '/contractor/settings' ? 'active2' : null
          }`}
          to="/contractor/settings"
        >
          Общие
        </Link>
        <Link
          style={{
            translate: `${-170 * offsetMenu}px`,
            padding: '20px 30px 17px 30px',
          }}
          className={`${style.link}  ${
            window.location.pathname === '/contractor/settings/profile'
              ? 'active2'
              : null
          }`}
          to="/contractor/settings/profile"
        >
          Профиль
        </Link>
        <Link
          style={{
            translate: `${-170 * offsetMenu}px`,
            padding: '20px 30px 17px 30px',
          }}
          className={`${style.link}  ${
            window.location.pathname === '/contractor/settings/prices'
              ? 'active2'
              : null
          }`}
          to="/contractor/settings/prices"
        >
          Прайс
        </Link>
        <Link
          style={{
            translate: `${-170 * offsetMenu}px`,
            padding: '20px 30px 17px 30px',
          }}
          className={`${style.link}  ${
            window.location.pathname === '/contractor/settings/finance'
              ? 'active2'
              : null
          }`}
          to="/contractor/settings/finance"
        >
          Финансы
        </Link>
        <Link
          style={{
            translate: `${-170 * offsetMenu}px`,
            padding: '20px 30px 17px 30px',
          }}
          className={`${style.link}  ${
            window.location.pathname === '/contractor/settings/balance'
              ? 'active2'
              : null
          }`}
          to="/contractor/settings/balance"
        >
          Баланс
        </Link>
        <Link
          style={{
            translate: `${-170 * offsetMenu}px`,
            padding: '20px 30px 17px 30px',
          }}
          className={`${style.link}  ${
            window.location.pathname === '/contractor/settings/photo'
              ? 'active2'
              : null
          }`}
          to="/contractor/settings/photo"
        >
          Фотография
        </Link>
      </div>

      {/* <Swiper
        style={{ marginLeft: 0 }}
        slidesPerView={5}
        spaceBetween={5}
        navigation={true}
        modules={[Navigation]}
        initialSlide={numberElementMenu}
        className={style.swiper}
        breakpoints={{
          0: {
            slidesPerView: 2,
          },
          540: {
            slidesPerView: 3,
          },
          710: {
            slidesPerView: 4,
          },
          870: {
            slidesPerView: 5,
          },
        }}
      >
        {[
          <Link
            className={`${style.link} ${
              window.location.pathname == '/contractor/settings' ? 'active2' : null
            }`}
            to="/contractor/settings"
          >
            Профиль
          </Link>,
          <Link
            className={`${style.link} ${
              window.location.pathname == '/contractor/settings/picture'
                ? 'active2'
                : null
            }`}
            to="/contractor/settings/picture"
          >
            Фотография
          </Link>,
          <Link
            className={`${style.link} ${
              window.location.pathname == '/contractor/settings/wallet'
                ? 'active2'
                : null
            }`}
            to="/contractor/settings/wallet"
          >
            Кошелёк
          </Link>,
          <Link
            className={`${style.link} ${
              window.location.pathname == '/contractor/settings/finance'
                ? 'active2'
                : null
            }`}
            to="/contractor/settings/finance"
          >
            Финансы
          </Link>,
          <Link
            className={`${style.link} ${
              window.location.pathname == '/contractor/settings/balance'
                ? 'active2'
                : null
            }`}
            to="/contractor/settings/balance"
          >
            Баланс
          </Link>,
        ].map((obj, index) => (
          <SwiperSlide key={index} className="sliderr">
            {obj}
          </SwiperSlide>
        ))}
      </Swiper> */}
    </>
  );
}
