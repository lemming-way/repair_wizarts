import React, { useState } from 'react';
import '../../scss/style.css'
import DropdownService from "../dropdownService";
import {Link} from 'react-router-dom'



const Menu = ({ active, setActive }) => {
    const [visibleCountry, setVisibleCountry] = useState(false)
    const [visibleService, setVisibleService] = useState(false)
    const [menuActive, setMenuActive] = useState(false)
    return (
        <div className={active ? 'menu active' : 'menu'} onClick={() => setActive(false)}>
            <div className="menu__content" onClick={e => e.stopPropagation()}>
                {/* <div className="header__profile">
                    <Link to="/login" onClick={() => setActive(false)} className='login__link__pourhoie'>
                        Вход
                    </Link>
                    <Link to="/pick-login" onClick={() => setActive(false)} className='regis__link__pourhoie regis__link__pourhoiemenu'>
                        Регистрация
                    </Link>
                </div> */}
                <ul>
                    <li onClick={() => setActive(false)}>
                        <a href="#footer">Услуги</a>
                    </li>
                    <li onClick={() => setActive(false)}>
                        <a href="#">Город</a>
                    </li>
                    <li onClick={() => setActive(false)}>
                        <a href="#">Статьи</a>
                    </li>
                    <li onClick={() => setActive(false)}>
                        <a href="#">Отзывы</a>
                    </li>
                    <li onClick={() => setActive(false)}>
                        <a href="#">Контакты</a>
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default Menu;