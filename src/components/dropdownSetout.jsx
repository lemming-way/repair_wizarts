import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { removeToken } from "../services/token.service";
import { selectUser, wipeUser } from "../slices/user.slice";
import { selectUI, setAuthorization, setMaster } from "../slices/ui.slice";
import "../scss/setout.css";
import { setUserMode } from "../services/user.service";

function DropdownService() {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const user = useSelector(selectUser)
    const ui = useSelector(selectUI)

    const switchMode = () => {
        if (user.master[0]) {
            setUserMode(!ui.isMaster)
            dispatch(setMaster(!ui.isMaster))
            return
        }

        setUserMode(false)
        dispatch(setMaster(false))
    }

    const logout = (e) => {
        dispatch(wipeUser())
        dispatch(setAuthorization(false))
        removeToken()
        navigate("/")
    }

    return (
        <div className="bldropdownfff-content">
            <div className="fix_hover_drop"></div>
            {ui.isMaster ? (
                <div className="client__dropdown">
                    <div className="recent">
                        <Link to="/client/settings" onClick={switchMode} className="repair__phone">
                            <h4>Я клиент</h4>
                        </Link>
                    </div>
                    <div className="recent">
                        <Link to="/master/wallet" className="repair__phone">
                            <h4>Личный кабинет </h4>
                        </Link>
                    </div>
                    <div className="recent ">
                        <span
                            className="repair__phonffe dropdown_menu_toolbar_fix"
                            onClick={logout}
                        >
                            <img src="/img/logout.png" alt="" />
                            <h4>Выйти </h4>
                        </span>
                    </div>
                </div>
            ) : (
                <div className="master__dropdown">
                    <div className="recent">
                        <Link to="/master/wallet" onClick={switchMode} className="repair__phone">
                            <h4>Стать мастером</h4>
                        </Link>
                    </div>
                    <div className="recent">
                        <Link to="/client/settings" className="repair__phone">
                            <h4
                            >Настройки</h4>
                        </Link>
                    </div>
                    <div className="recent">
                        <Link to="/client/requests" className="repair__phone">
                            <h4>Мои заказы</h4>
                        </Link>
                    </div>
                    <div className="recent">
                        <Link to="/client/requests/my_orders#order" className="repair__phone">
                            <h4>Все заказы </h4>
                        </Link>
                    </div>
                    <div className="recent ">
                        <span
                            className="repair__phonffe dropdown_menu_toolbar_fix"
                            onClick={logout}
                        >
                            <img src="/img/logout.png" alt="" />
                            <h4>Выйти </h4>
                        </span>
                    </div>
                </div>
            )}
        </div>
    )
}


export default DropdownService;