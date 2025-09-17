import React from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { selectServices } from "../slices/services.slice";

function App() {
    const services = useSelector(selectServices)

    return (
        <footer id="footer">
            <div className="container">
                <ul>
                    <li>
                        <a href="">Телефон: +7 (969) 7148750</a>
                    </li>
                    <li>
                        <a href="#">Адрес: г. СПБ. Каховского 7 </a>
                    </li>
                    <li>
                        <a href="#">(Свой адрес писать все трусы)</a>
                    </li>
                    <li>
                        <a href="#">Работаем ежедневно 10:00 - 20:00,</a>
                    </li>
                    <li>
                        <a href="#">без перерывов и выходных</a>
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
                            <Link to="/articles">Статьи</Link>
                        </li>
                        <li>
                            <Link to="/reviews">Отзывы</Link>
                        </li>
                    </ul>
                </div>
            </div>
        </footer>
    )
}


export default App;
