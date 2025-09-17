import React, { useEffect } from "react";
import '../../scss/profile.css'
import '../../scss/register-master.scss'
import Sidebar from "../sidebar";
import "swiper/css";
import "swiper/css/navigation";
import '../../scss/address.css'
import {Link} from "react-router-dom";


function Profile() {

    useEffect(() => {
        document.title = 'Настройки';
    }, []);


    return (
        <div className="main nal df">
            <Sidebar/>
            <div className="block-info-10">

                <div className="setting df">
                    <div>
                        <h1>Настройки</h1>
                    </div>
                    <div>
                        <Link to="/finance">
                            <img src="./img/left-active.png" alt=""/>
                        </Link>
                        <Link to="/price">
                            <img src="./img/img-right.png" alt=""/>
                        </Link>
                    </div>
                </div>

                <div className="mini-wrap mini-wrap_links df">
                    <Link className="just" to='/service'><h3>Услуги</h3></Link>
                    <Link className="just" to='/finance'><h3>Финансы</h3></Link>
                    <Link className="just active2" to='/address'><h3>Адрес</h3></Link>
                    <Link className="just" to='/price'><h3>Загрузка прайса</h3></Link>
                </div>

                <div className="main-optionsdfsadfsads">
                        <select id="uslugivasdf">
                            <option value="hide">Выбор вида услуг</option>
                            <option value="remont phone">Ремонт телефонов</option>
                            <option value="remont idad">Ремонт планшетов</option>
                            <option value="remont laptop">Ремонт ноутбуков</option>
                        </select>
                        <select id="uslugivasdf">
                            <option value="hide">Выбор устройства</option>
                            <option value="remont phone">Iphone 13</option>
                            <option value="remont idad">Iphone X</option>
                            <option value="remont laptop">Iphone </option>
                        </select>
                        <select id="uslugivasdf">
                            <option value="hide">Выбор вида ремонта</option>
                            <option value="remont phone">Ремонт телефонов</option>
                            <option value="remont idad">Ремонт планшетов</option>
                            <option value="remont laptop">Ремонт ноутбуков</option>
                        </select>
                        <select id="uslugivasdf">
                            <option value="hide">Выбор вида ремонта</option>
                            <option value="remont phone">Ремонт телефонов</option>
                            <option value="remont idad">Ремонт планшетов</option>
                            <option value="remont laptop">Ремонт ноутбуков</option>
                        </select>
                    </div>

                    <button className="goooSaveButton">Сохранить</button>

            </div>
        </div>
    )
}


export default Profile;
