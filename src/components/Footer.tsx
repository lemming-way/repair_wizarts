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
                        <a
                            href="https://yandex.ru/maps/?text=%D0%A1%D0%B0%D0%BD%D0%BA%D1%82-%D0%9F%D0%B5%D1%82%D0%B5%D1%80%D0%B1%D1%83%D1%80%D0%B3%2C%20%D1%83%D0%BB.%20%D0%9A%D0%B0%D1%85%D0%BE%D0%B2%D1%81%D0%BA%D0%BE%D0%B3%D0%BE%2C%207"
                            target="_blank"
                            rel="noreferrer"
                        >
                            {text("Address")}: г. СПБ. Каховского 7
                        </a>
                    </li>
                    <li>
                        <span>{text("Write your own address")}</span>
                    </li>
                    <li>
                        <span>{text("Open daily 10:00 - 20:00,")}</span>
                    </li>
                    <li>
                        <span>{text("without breaks and days off")}</span>
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
