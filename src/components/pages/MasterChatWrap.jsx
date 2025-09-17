import style from "./MasterChatWrap.module.css"
import { Outlet } from "react-router-dom";
import Sidebar from "../sidebar";

function MasterChatWrap() {
   
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


export default MasterChatWrap;
