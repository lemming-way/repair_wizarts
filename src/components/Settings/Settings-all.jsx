import { useEffect, useState, useRef } from "react";
import { updateUserPhoto, updateUser } from "../../services/user.service";
import { useDispatch, useSelector } from "react-redux";
import { selectUser } from "../../slices/user.slice";
import '../../scss/settings-all.css'
import Sidebar from "../sidebar";
import "swiper/css";
import "swiper/css/navigation";
import SettingNav from "./Setting-nav";
import VerificationInput from "../VerificationInput";
import { Link, useNavigate } from "react-router-dom";
import { selectUI, setAuthorization } from "../../slices/ui.slice";
import { deleteUser } from "../../services/user.service";
import Popup from "reactjs-popup";
import SERVER_PATH from "../../constants/SERVER_PATH";
import Navigation from './Navigation';
import MasterProfileNavigator from "../full-height/MasterProfileNavigator";
import style from "./settings_all.module.css"
import { Outlet } from "react-router-dom";
// import { useNavigate } from "react-router-dom";

function App() {

    const navigate = useNavigate()

    const listLinks = [
        "/master/settings",
        "/master/settings/profile",
        "/master/settings/services",
        "/master/settings/finance",
        "/master/settings/balance",
    ]

    const [numberElementMenu, setNumberElementMenu] = useState(1)
    const [offsetMenu, setOffsetMenu] = useState(1)

    function NavigateLeft () {
        var n = numberElementMenu
        if (n-1 < 0) {
            return
        }
        const newNumber = n-1
        setNumberElementMenu(newNumber)
        navigate(listLinks[newNumber])
    }
    function NavigateRight () {
        var n = numberElementMenu
        if (n+1 > listLinks.length - 1) {
            return
        }
        const newNumber = n+1
        setNumberElementMenu(newNumber)
        navigate(listLinks[newNumber])
    }

    useEffect(() => {
        const n = listLinks.indexOf(window.location.pathname)
        setNumberElementMenu(n)
        
        if (window.innerWidth > 700) {
            setOffsetMenu(0)
        }
        else if (n > 3) {
            setOffsetMenu(3);
        }
        else {
            setOffsetMenu(n)
        }
    });

    return (
        // block-info-6
            <>
                <div className="setting  df" style={{border: "none"}}>
                    <div>
                        <h1>Настройки</h1>
                    </div>
                    <div className={style.arrows_block}>
                        <img src="/img/img-right.png" style={{rotate: "180deg", opacity: numberElementMenu == 0 ? 0.5 : 1}} alt="" onClick={NavigateLeft} />
                        <img src="/img/img-right.png" style={{opacity: numberElementMenu == listLinks.length-1 ? 0.5 : 1}} alt="" onClick={NavigateRight} />
                    </div>
                </div>

                {/* <Navigation /> */}
                <MasterProfileNavigator numberElementMenu={numberElementMenu} offsetMenu={offsetMenu} />
                <Outlet />


            </>

)
}


export default App;
