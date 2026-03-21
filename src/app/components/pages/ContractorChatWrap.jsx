import { Outlet } from "react-router-dom";

import style from "./ContractorChatWrap.module.css"
import Sidebar from "../sidebar";

function ContractorChatWrap() {
   
    return (
        <div className={style.main_block}>
            <div style={{position: "relative", top: "70px"}}>
                <Sidebar />
            </div>
            

            <div className={style.content_block}>
                <Outlet />
            </div>
        </div>
    )
}


export default ContractorChatWrap;
