import React, {useState,} from "react";
import { useSelector } from "react-redux";
import { selectUser } from "../slices/user.slice";
import{Link, useLocation} from "react-router-dom";
import SidebarMenu from "./menu/SidebarMenu";
import { getFeedback } from "../services/feedback.service";
import { Rating } from "react-simple-star-rating";
import SERVER_PATH from "../constants/SERVER_PATH";
import AlertMessage from "./AlertMessage/AlertMessage";

function Sidebar() {
    const location = useLocation()

    const user = useSelector(selectUser)

    const [menuActive, setMenuActive] = useState(false)
    const [active, isActive] = useState(true)
    function suke(){
        setMenuActive(!menuActive)
        isActive(!active)
    }
    return (
        <div>
            <div className="fixed-content">

                {/* {menuActive && <> */}
                    <div className="left-content" style={{left: menuActive ? "0" : null}}>
                        <div className="dffds">
                            <div className="img-content">
                                <img 
                                    // src={SERVER_PATH + user.avatar} 
                                    src="/img/profil_img/1.png"
                                    alt=""/>
                                <h3>{user.name} {user.lastname}</h3>
                            </div>
                            <div className="stars">
                                <p>{user.master?.[0]?.rating} <Rating readonly initialValue={user.master?.[0]?.rating} size="22" /> {user.master?.[0]?.number_of_feedbacks}</p>
                            </div>
                        </div>
                        <ul className="ul-wrap" style={{paddingLeft: 0}}>
                            <li className={location.pathname.includes("/master/wallet") ? "active" : ""}><img src="/img/img-exit.png" alt=""/><Link to="/master/wallet"> Кошелек</Link></li>
                            <li className={location.pathname.includes("/master/settings") ? "active" : ""} ><img src="/img/img-contact.png" alt=""/><Link  to="/master/settings"> Настройки</Link></li>
                            <li style={{position: "relative"}}className={location.pathname.includes("/master/chat") || location.pathname.includes("/168789461") ? "active" : ""} ><img src="/img/img-massage.png" alt=""/><AlertMessage /><Link to="/master/chat">Чат</Link></li>
                            <li style={{position: "relative"}}className={location.pathname.includes("/master/orders") ? "active" : ""}><img src="/img/img-list.png" alt=""/><AlertMessage /><Link to='/master/orders'> Мои заявки</Link></li>
                            <li style={{position: "relative"}}className={location.pathname.includes("/master/feedback") ? "active" : ""}><img src="/img/img-white-star.png" alt=""/><AlertMessage /><Link to="/master/feedback"> Мои отзывы</Link></li>
                            <li style={{position: "relative"}} className={location.pathname.includes("/master/requests") ? "active" : ""}><img src="/img/img-list-2.png " alt=""/><Link to="/master/requests"> Биржа заказов</Link></li>
                        </ul>

                        <Link to="/login" className="sidebar__link_exit">
                            <div className="sidebar__link_exit__row">
                                <img src="/img/img-exit-2.png" alt=""/>
                                <span>Выйти</span>
                            </div>
                        </Link>
                    </div>
                {/* </>} */}

            </div>
            <div className={active ? 'sideburger-btn': 'sideburgeractive sideburger-btn'}  onClick={() => suke()}>
                <span/>
            </div>
            {/* старый сайдбар - правый верхний бургер */}
            {/* <SidebarMenu active={menuActive} setActive={setMenuActive}/> */}
        </div>
    );
}


export default Sidebar;