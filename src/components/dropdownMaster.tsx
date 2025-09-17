import React from "react";
import { Link } from "react-router-dom";

import './scss/setout.css'

function DropdownService() {
    function reload() {
        // window.location.reload
        console.log('helou');
    }
    return (
        <div className="bldropdownfff-content">
            <div className="recent">
                <Link to="/login/profile" className="repair__phone">
                    <h4
                        onClick={window.location.reload}
                    >Я клиент</h4>
                </Link>
            </div>
            <div className="recent">
                <Link to="/login/profile" className="repair__phone">
                    <h4
                        onClick={window.location.reload}
                    >Личный кабинет </h4>
                </Link>
            </div>
            <div className="recent">
                <Link
                    to="/"
                    className="repair__phonffe"
                >
                    <img src="/img/logout.png" alt="" />
                    <h4>Выйти </h4>
                </Link>
            </div>

        </div>
    )
}


export default DropdownService;