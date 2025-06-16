import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { selectUser } from '../slices/user.slice';
import { selectUnreadMessages } from '../slices/messages.slice';
import { selectUI } from '../slices/ui.slice';
import DropdownCountry from "./dropdownCountry";
import DropdownService from "./dropdownService";
import DropdownSetout from "./dropdownSetout";
import Menu from "./menu/Menu";
import SERVER_PATH from '../constants/SERVER_PATH';
import { useLanguage } from "../context/LanguageContext"; // поправьте путь под себя

function Header() {
    const [visibleCountry, setVisibleCountry] = useState(false)
    const [visibleSetout, setVisibleSetout] = useState(false)
    const [menuActive, setMenuActive] = useState(false)

    const ui = useSelector(selectUI)
    const user = useSelector(selectUser)
    const messages = useSelector(selectUnreadMessages)
    const { t } = useLanguage();
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
                                    <span className="header__link">{t("Services")}</span>
                                    <img src="/img/afdsfads.png" alt="" />
                                </div>
                            </DropdownService>
                        </li>
                        <li className="dropdown">
                            <div onClick={() => {
                                setVisibleCountry(!visibleCountry)
                                setVisibleSetout(false)
                            }}>
                                <span className="header__link">{t("City")}</span>
                                <img src="/img/afdsfads.png" alt="" />
                            </div>
                            <DropdownCountry />
                        </li>
                        <li>
                            <Link to="/articles" className="header__link">{t("Articles")}</Link>
                        </li>
                        <li>
                            <Link to="/reviews" className="header__link">{t("Reviews")}</Link>
                        </li>
                        <li>
                            <Link to="/contact" className="header__link">{t("Contacts")}</Link>
                        </li>
                    </ul>
                    <div className="header__profile">
                        {ui.isAuthorized ? (
                            <div className="header__profile">
                                <Link to={"/client/requests/create/title"} className="header__button">{t("Give task")}</Link>
                                <a href="tel:+79697148750" style={{height: "26px", width: "26px", marginRight: "12px"}}>
                                    <img className="" src="/img/ellipsewqrew.png" alt="" />
                                </a>
                                <Link to={ui.isMaster ? "/master/chat" : "/client/chat"}
                                    className='header__chat-link'
                                    style={{display: 'flex'}}
                                    onClick={() => {
                                        setVisibleCountry(false)
                                        setVisibleSetout(false)
                                    }}
                                >
                                    <img className="" src="/img/hfjsa.png" alt="" />
                                    {messages.count > 0 && <div className='chat-message-counter'>{messages.count}</div>}
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
                                        src={SERVER_PATH + user.avatar}
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
                                {ui.isMaster && user.master[0] && (
                                    <>
                                        <p className='master__moneys'>
                                            {parseFloat(user.master[0].balance).toFixed(2)}₽
                                        </p>
                                        <div className='master__moneys__full'>
                                            <Link to="/master/wallet">{t("Top up balance")}</Link>
                                        </div>
                                    </>
                                )}
                                
                            </div>
                        ) : (
                            <div className='header__profile'>
                                <Link to="/login" className='login__link__pourhoie'>
                                    {t("Login")}
                                </Link>
                                <Link to="/register" className='regis__link__pourhoie'>
                                    {t("Register")}
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
