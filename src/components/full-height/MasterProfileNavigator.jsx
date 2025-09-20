import style from './MasterProfileNavigator.module.css';
import { Link } from 'react-router-dom';
// import { useNavigate, useParams } from 'react-router-dom'
// import "./ClientProfileNavigator.css"

export default function MasterProfileNavigator({
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
            window.location.pathname === '/master/settings' ? 'active2' : null
          }`}
          to="/master/settings"
        >
          Общие
        </Link>
        <Link
          style={{
            translate: `${-170 * offsetMenu}px`,
            padding: '20px 30px 17px 30px',
          }}
          className={`${style.link}  ${
            window.location.pathname === '/master/settings/profile'
              ? 'active2'
              : null
          }`}
          to="/master/settings/profile"
        >
          Профиль
        </Link>
        <Link
          style={{
            translate: `${-170 * offsetMenu}px`,
            padding: '20px 30px 17px 30px',
          }}
          className={`${style.link}  ${
            window.location.pathname === '/master/settings/services'
              ? 'active2'
              : null
          }`}
          to="/master/settings/services"
        >
          Прайс
        </Link>
        <Link
          style={{
            translate: `${-170 * offsetMenu}px`,
            padding: '20px 30px 17px 30px',
          }}
          className={`${style.link}  ${
            window.location.pathname === '/master/settings/finance'
              ? 'active2'
              : null
          }`}
          to="/master/settings/finance"
        >
          Финансы
        </Link>
        <Link
          style={{
            translate: `${-170 * offsetMenu}px`,
            padding: '20px 30px 17px 30px',
          }}
          className={`${style.link}  ${
            window.location.pathname === '/master/settings/balance'
              ? 'active2'
              : null
          }`}
          to="/master/settings/balance"
        >
          Баланс
        </Link>
        <Link
          style={{
            translate: `${-170 * offsetMenu}px`,
            padding: '20px 30px 17px 30px',
          }}
          className={`${style.link}  ${
            window.location.pathname === '/master/settings/photo'
              ? 'active2'
              : null
          }`}
          to="/master/settings/photo"
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
              window.location.pathname == '/master/settings' ? 'active2' : null
            }`}
            to="/master/settings"
          >
            Профиль
          </Link>,
          <Link
            className={`${style.link} ${
              window.location.pathname == '/master/settings/picture'
                ? 'active2'
                : null
            }`}
            to="/master/settings/picture"
          >
            Фотография
          </Link>,
          <Link
            className={`${style.link} ${
              window.location.pathname == '/master/settings/wallet'
                ? 'active2'
                : null
            }`}
            to="/master/settings/wallet"
          >
            Кошелёк
          </Link>,
          <Link
            className={`${style.link} ${
              window.location.pathname == '/master/settings/finance'
                ? 'active2'
                : null
            }`}
            to="/master/settings/finance"
          >
            Финансы
          </Link>,
          <Link
            className={`${style.link} ${
              window.location.pathname == '/master/settings/balance'
                ? 'active2'
                : null
            }`}
            to="/master/settings/balance"
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
