import { Outlet } from "react-router-dom";

import style from "./ContractorSettingsWrap.module.css"
import Sidebar from "../sidebar";

function ContractorSettingsWrap() {
   

    return (
        <div className={`${style.main_block} ${window.location.pathname === "/contractor/requests" ? style.requests_block : null}`}>
            <Sidebar />

            <div className={style.content_block}>
                <Outlet />
            </div>
        </div>
    )
}


export default ContractorSettingsWrap;
