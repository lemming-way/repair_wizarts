import '../../scss/style.css'
import { useLanguage } from '../../state/language'


const Menu = ({ active, setActive }) => {
    const text = useLanguage()
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
                        <a href="#footer">{text('Services')}</a>
                    </li>
                    <li onClick={() => setActive(false)}>
                        <button>{text('City')}</button>
                    </li>
                    <li onClick={() => setActive(false)}>
                        <button>{text('Articles')}</button>
                    </li>
                    <li onClick={() => setActive(false)}>
                        <button>{text('Reviews')}</button>
                    </li>
                    <li onClick={() => setActive(false)}>
                        <button>{text('Contacts')}</button>
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default Menu;
