import { Outlet } from "react-router-dom";

import style from "./ContractorLayout.module.css"
import Sidebar from "./ContractorSidebar";

function ContractorLayout() {
   
    return (
        <div className={style.main_block}>
            <Sidebar />

            <div className={style.content_block}>
                <Outlet />
            </div>
        </div>
    )
}


export default ContractorLayout;
