import React from "react";
import { Link } from "react-router-dom";

import './scss/setout.css'
import { useLanguage } from '../state/language';

function DropdownService() {
    const text = useLanguage();  // получаем функцию t для перевода

    function reload() {
        // window.location.reload
        console.log('helou');
    }
    return (
        <div className="bldropdownfff-content">
            <div className="recent">
                <Link to="/login/profile" className="repair__phone">
                    <h4
                        onClick={() => window.location.reload()}
                    >
                        {text("I am a client")}
                    </h4>
                </Link>
            </div>
            <div className="recent">
                <Link to="/login/profile" className="repair__phone">
                    <h4
                        onClick={() => window.location.reload()}
                    >
                        {text("Personal account")}
                    </h4>
                </Link>
            </div>
            <div className="recent">
                <Link to="/" className="repair__phonffe">
                    <img src="/img/logout.png" alt={text("Logout")} />
                    <h4>{text("Logout")}</h4>
                </Link>
            </div>
        </div>
    )
}


export default DropdownService;
