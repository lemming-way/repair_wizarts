import React, { useState } from 'react';
import '../../scss/style.css'
import DropdownService from "../dropdownService";
import { Link, useLocation } from "react-router-dom";
import { Rating } from 'react-simple-star-rating';

const Menu = ({ active, setActive }) => {
    const [visibleCountry, setVisibleCountry] = useState(false)
    const [visibleService, setVisibleService] = useState(false)
    const [menuActive, setMenuActive] = useState(false)
    const location = useLocation()

    return (
        <div className={active ? 'menu active afwerweq' : 'menu'} onClick={() => setActive(false)}>
            <div className="menu__content" onClick={e => e.stopPropagation()}>
                <div className="left-contedsafsant">
                    {/* <div className="dffasdfsadds">
                        <div className="img-content">
                            <img src="/img/profile__image.png" alt="" />
                            <h3>Алексей Иванов</h3>
                        </div>
                        <div className="stars">
                            <p>4.6 <img src="/img/img-star.png" alt="" /><img src="/img/img-star.png" alt="" /><img
                                src="/img/img-star.png" alt="" /><img src="/img/img-star.png" alt="" /><img
                                    src="/img/img-star.png" alt="" /> 11</p>
                        </div>
                    </div> */}

                    <div className="dffds">
                        <div className="img-content">
                            <img 
                                // src={SERVER_PATH + user.avatar} 
                                src="/img/profil_img/1.png"
                                alt=""/>
                            <h3>Алексей Иванов</h3>
                           </div>
                        {/* <div className="stars">
                            <p>{user.master?.[0]?.rating} <Rating readonly initialValue={user.master?.[0]?.rating} size="22" /> {user.master?.[0]?.number_of_feedbacks}</p>
                        </div> */}
                    </div>

                    <ul className="ul-wdsafsdafasdrap">
                        <li className={location.pathname.includes("/replenishment") ? "active imawe" : "imawe"}><img src="/img/img-exit.png" alt="" /><Link to="/replenishment"> Кошелек</Link></li>
                        <li className={location.pathname.includes("/settings") ? "active imawe" : "imawe"} ><img src="/img/img-contact.png" alt="" /><Link to="/settings"> Настройки</Link></li>
                        <li className={location.pathname.includes("/16854163") || location.pathname.includes("/168789461") ? "active imawe" : "imawe"} ><img src="/img/img-massage.png" alt="" /><Link to="/chat/16854163">Чат</Link></li>
                        <li className={location.pathname.includes("/applications/my") ? "active imawe" : " imawe"}><img src="/img/img-list.png" alt="" /><Link to='/applications/my'> Мои заявки</Link></li>
                        <li className={location.pathname.includes("/pick-master/14325664") ? "active imawe" : "imawe"}><img src="/img/img-white-star.png" alt="" /><Link to="/pick-master/14325664"> Мои отзывы</Link></li>
                        <li className={location.pathname.includes("/orders/my") ? "active imawe" : "imawe"}><img src="/img/img-list-2.png " alt="" /><Link to="/orders/my"> Мои заказы</Link></li>
                        
                        
                        {/* <li className={location.pathname.includes("/replenishment") ? "active imawe" : " imawe"}><img src="/img/img-exit.png" alt="" /><Link to="/replenishment"> Кошелек</Link></li>
                        <li className={location.pathname.includes("/settings") ? "active imawe" : " imawe"} ><img src="/img/img-contact.png" alt="" /><Link to="/settings"> Настройки</Link></li>
                        <li className={location.pathname.includes("/16854163") || location.pathname.includes("/168789461") ? "active imawe" : " imawe"}  ><img src="/img/img-massage.png" alt="" /><Link to="/chat/16854163"> Чат</Link></li>
                        <li className={location.pathname.includes("/applications/my") ? "active imawe" : " imawe"}><img src="/img/img-list.png" alt="" /><Link to='/applications/my'> Мои заявки</Link></li>
                        <li className="imawe"><img src="/img/img-white-star.png" alt="" /><Link to=""> Мои отзывы</Link></li>
                        <li className={location.pathname.includes("/orders") ? "active imawe" : " imawe"}><img src="/img/img-list-2.png " alt="" /><Link to="/orders"> Мои заказы</Link></li> */}
                    </ul>

                    <div className="iconfsdafsda godownout imawe df">
                        <img src="/img/img-exit-2.png" alt="" />
                        <h2 className="outsidebar">Выйти</h2>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Menu;