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
                        <a href="https://maps.google.com/?q=Санкт-Петербург,+Каховского+7" target="_blank" rel="noopener noreferrer" aria-label="View address on map: Санкт-Петербург, Каховского 7">{text("Address")}: г. СПБ. Каховского 7</a>
                    </li>
                    <li>
                        <button
                        onClick={() => navigator.clipboard.writeText('г. СПБ. Каховского 7')}
                        aria-label="Copy address to clipboard"
                        style={{ background: 'none', border: 'none', color: 'inherit', textDecoration: 'underline', cursor: 'pointer', padding: 0 }}
                      >
                        {text("Write your own address")}
                      </button>
                    </li>
                    <li>
                        <span aria-label="Business hours: Open daily from 10 AM to 8 PM">{text("Open daily 10:00 - 20:00,")}</span>
                    </li>
                    <li>
                        <span aria-label="Additional schedule information: No breaks or days off">{text("without breaks and days off")}</span>
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
