import { useState } from 'react';
import { Link } from 'react-router-dom';

import DropdownCountry from "./dropdownCountry";
import DropdownService from "./dropdownService";
import DropdownSetout from "./dropdownSetout";
import Menu from "./menu/Menu";
import { useLanguage } from '../state/language';
import { useUser, UserRole } from '../state/user';
import { useUnreadMessagesQuery } from '../hooks/useUnreadMessagesQuery';

function Header() {
    const [visibleCountry, setVisibleCountry] = useState(false)
    const [visibleSetout, setVisibleSetout] = useState(false)
    const [menuActive, setMenuActive] = useState(false)
    const { user } = useUser()
    const { unreadCount } = useUnreadMessagesQuery()
    const text = useLanguage();

    return (
        <>
            <header >
                <div className="container">
                    <Link to="/" className='a-logo'>
                        <img className='logo' src="/img/logo.svg" alt="" />
                    </Link>
                    <ul className="header__list">
                        <li className="bldropdown">
                            <DropdownService>
                                <div onClick={() => {
                                    setVisibleCountry(false)
                                    setVisibleSetout(false)
                                }}>
                                    <span className="header__link">{text("Services")}</span>
                                    <img src="/img/afdsfads.png" alt="" />
                                </div>
                            </DropdownService>
                        </li>
                        <li className="dropdown">
                            <div onClick={() => {
                                setVisibleCountry(!visibleCountry)
                                setVisibleSetout(false)
                            }}>
                                <span className="header__link">{text("City")}</span>
                                <img src="/img/afdsfads.png" alt="" />
                            </div>
                            <DropdownCountry />
                        </li>
                        <li>
                            <Link to="/articles" className="header__link">{text("Articles")}</Link>
                        </li>
                        <li>
                            <Link to="/reviews" className="header__link">{text("Reviews")}</Link>
                        </li>
                        <li>
                            <Link to="/contact" className="header__link">{text("Contacts")}</Link>
                        </li>
                    </ul>
                    <div className="header__profile">
                        {!!user.id ? (
                            <div className="header__profile">
                                <Link to={"/client/requests/create/title"} className="header__button">{text("Give task")}</Link>
                                <a href="tel:+79697148750" style={{height: "26px", width: "26px", marginRight: "12px"}}>
                                    <img className="" src="/img/ellipsewqrew.png" alt="" />
                                </a>
                                <Link to={user.role === UserRole.Contractor ? "/contractor/chat" : "/client/chat"}
                                    className='header__chat-link'
                                    style={{display: 'flex'}}
                                    onClick={() => {
                                        setVisibleCountry(false)
                                        setVisibleSetout(false)
                                    }}
                                >
                                    <img className="" src="/img/hfjsa.png" alt="" />
                                    {unreadCount > 0 && <div className='chat-message-counter'>{unreadCount}</div>}
                                </Link>
                                <div
                                    className='yosetout'
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => {
                                        setVisibleSetout(!visibleSetout)
                                        setVisibleCountry(false)
                                    }}
                                >
                                    <img
                                        src={user.avatar || '/img/icons/avatar.png'}
                                        width="40px"
                                        height="40px"
                                        alt=""
                                        style={{ borderRadius: "20px", objectFit: "cover" }}
                                    />
                                    <img src="/img/dropdownuser.png" alt="" />
                                    {/* {visibleSetout ? <DropdownSetout /> : null} */}
                                    <div className="bldropdown">
                                        <DropdownSetout />
                                    </div>
                                    {/* </Link> */}
                                </div>
                                {user.role === UserRole.Contractor && user.contractor?.[0] && (  // todo: Здесь баланс нужно получать по-другому
                                    <>
                                        <p className='contractor__moneys'>
                                            {parseFloat(user.contractor[0].balance).toFixed(2)}₽
                                        </p>
                                        <div className='contractor__moneys__full'>
                                            <Link to="/contractor/wallet">{text("Top up balance")}</Link>
                                        </div>
                                    </>
                                )}
                                
                            </div>
                        ) : (
                            <div className='header__profile'>
                                <Link to="/login" className='login__link__pourhoie'>
                                    {text("Login")}
                                </Link>
                                <Link to="/register" className='regis__link__pourhoie'>
                                    {text("Register")}
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
                <div className="burger-btn" onClick={() => setMenuActive(!menuActive)}>
                    <span />
                </div>
                <Menu active={menuActive} setActive={setMenuActive} />
            </header>
        </>

    );
}

export default Header;
