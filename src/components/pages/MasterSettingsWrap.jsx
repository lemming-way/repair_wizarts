import style from "./MasterSettingsWrap.module.css"
import { Outlet } from "react-router-dom";
import Sidebar from "../sidebar";

function MasterSettingsWrap() {
   

    return (
        <div className={`${style.main_block} ${window.location.pathname == "/master/requests" ? style.requests_block : null}`}>
            <Sidebar />

            <div className={style.content_block}>
                <Outlet />
            </div>
        </div>
    )
}


export default MasterSettingsWrap;
