import { Link } from "react-router-dom"

import style from "./ClientProfileNavigator.module.css"
// import { useNavigate, useParams } from 'react-router-dom'
// import "./ClientProfileNavigator.css"

export default function ClientProfileNavigator({numberElementMenu, offsetMenu}) {

   
    return (
        <>               
            <div className={style.navigator_block} >
                <Link style={{translate: `${-170*offsetMenu}px`,padding: "20px 30px 17px 30px"}} className={`${style.link}  ${window.location.pathname === "/client/settings" ? "active2" : null}`} to="/client/settings">Профиль</Link>
                <Link style={{translate: `${-170*offsetMenu}px`,padding: "20px 30px 17px 30px"}} className={`${style.link}  ${window.location.pathname === "/client/settings/picture" ? "active2" : null}`} to='/client/settings/picture'>Фотография</Link>
                <Link style={{translate: `${-170*offsetMenu}px`,padding: "20px 30px 17px 30px"}} className={`${style.link}  ${window.location.pathname === "/client/settings/wallet" ? "active2" : null}`} to='/client/settings/wallet'>Кошелёк</Link>
                <Link style={{translate: `${-170*offsetMenu}px`,padding: "20px 30px 17px 30px"}} className={`${style.link}  ${window.location.pathname === "/client/settings/finance" ? "active2" : null}`} to='/client/settings/finance'>Финансы</Link>
                <Link style={{translate: `${-170*offsetMenu}px`,padding: "20px 30px 17px 30px"}} className={`${style.link}  ${window.location.pathname === "/client/settings/balance" ? "active2" : null}`} to='/client/settings/balance'>Баланс</Link>
            </div>

            {/* <Swiper
                style={{marginLeft: 0}}
                slidesPerView={5}
                spaceBetween={5}
                navigation={true}
                modules={[Navigation]}
                initialSlide = {numberElementMenu}
                className={style.swiper}
                breakpoints={{
                    0: {
                        slidesPerView: 2
                    },
                    540: {
                        slidesPerView: 3
                    },
                    710: {
                        slidesPerView: 4
                    },
                    870: {
                        slidesPerView: 5
                    }
                }}
            >

                {[<Link  className={`${style.link} ${window.location.pathname === "/client/settings" ? "active2" : null}`} to="/client/settings">Профиль</Link>,
                <Link  className={`${style.link} ${window.location.pathname === "/client/settings/picture" ? "active2" : null}`} to='/client/settings/picture'>Фотография</Link>,
                <Link  className={`${style.link} ${window.location.pathname === "/client/settings/wallet" ? "active2" : null}`} to='/client/settings/wallet'>Кошелёк</Link>,
                <Link  className={`${style.link} ${window.location.pathname === "/client/settings/finance" ? "active2" : null}`} to='/client/settings/finance'>Финансы</Link>,
                <Link  className={`${style.link} ${window.location.pathname === "/client/settings/balance" ? "active2" : null}`} to='/client/settings/balance'>Баланс</Link>
           ].map((obj, index) =>
                    <SwiperSlide key={index} className="sliderr">
                        {obj}
                    </SwiperSlide>
                )}
            </Swiper> */}
        </>
    )
}