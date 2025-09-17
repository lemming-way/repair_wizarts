import '../../scss/style.css'


const Menu = ({ active, setActive }) => {
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
                        <button>Город</button>
                    </li>
                    <li onClick={() => setActive(false)}>
                        <button>Статьи</button>
                    </li>
                    <li onClick={() => setActive(false)}>
                        <button>Отзывы</button>
                    </li>
                    <li onClick={() => setActive(false)}>
                        <button>Контакты</button>
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default Menu;