import React from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

import { useLanguage } from "../context/LanguageContext"; // путь поправьте под свой
import { selectServices } from "../slices/services.slice";

function App() {
    const services = useSelector(selectServices)
    const { t } = useLanguage();

    return (
        <footer id="footer">
            <div className="container">
                <ul>
                    <li>
                        <a href="tel:+79697148750">{t("Phone")}: +7 (969) 7148750</a>
                    </li>
                    <li>
                        <a href="#">{t("Address")}: г. СПБ. Каховского 7</a>
                    </li>
                    <li>
                        <a href="#">{t("Write your own address")}</a>
                    </li>
                    <li>
                        <a href="#">{t("Open daily 10:00 - 20:00,")}</a>
                    </li>
                    <li>
                        <a href="#">{t("without breaks and days off")}</a>
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
                            <Link to="/articles">{t("Articles")}</Link>
                        </li>
                        <li>
                            <Link to="/reviews">{t("Reviews")}</Link>
                        </li>
                    </ul>
                </div>
            </div>
        </footer>
    );
}


export default App;
