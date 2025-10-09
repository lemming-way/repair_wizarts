import React from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

import { useLanguage } from '../state/language';
import { selectServices } from "../slices/services.slice";

function App() {
    const services = useSelector(selectServices)
    const text = useLanguage();

    return (
        <footer id="footer">
            <div className="container">
                <ul>
                    <li>
                        <a href="tel:+79697148750">{text("Phone")}: +7 (969) 7148750</a>
                    </li>
                    <li>
                        <a href="#">{text("Address")}: г. СПБ. Каховского 7</a>
                    </li>
                    <li>
                        <a href="#">{text("Write your own address")}</a>
                    </li>
                    <li>
                        <a href="#">{text("Open daily 10:00 - 20:00,")}</a>
                    </li>
                    <li>
                        <a href="#">{text("without breaks and days off")}</a>
                    </li>
                </ul>
                <div className="contfff">
                    <ul>
                        {services.service_types.map((v) => (
                            <li key={v.id}>
                                <Link to={"/devices/" + v.id}>{v.name}</Link>
                            </li>
                        ))}
                    </ul>
                    <ul>
                        <li>
                            <Link to="/articles">{text("Articles")}</Link>
                        </li>
                        <li>
                            <Link to="/reviews">{text("Reviews")}</Link>
                        </li>
                    </ul>
                </div>
            </div>
        </footer>
    );
}


export default App;
