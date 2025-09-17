import React, { useEffect, useState } from "react";
import '../../scss/Price.css'
import '../../scss/register-master.scss'
import Sidebar from "../sidebar";
import "swiper/css";
import "swiper/css/navigation";
import '../../scss/address.css'
import { Link } from "react-router-dom";


function Profile() {

    const [expanded, isexpanded] = useState(true)
    const [expandedRemont, isexpandedRemont] = useState(true)
    const [expandedList, isexpandeList] = useState(true)
    const [expandedVid, isexpandeVid] = useState(true)



    useEffect(() => {
        document.title = 'Настройки';
    }, []);

    return (
        <div className="main nal df">
            <Sidebar />
            <div className="block-info-10">

                <div className="setting df">
                    <div>
                        <h1>Настройки</h1>
                    </div>
                    <div>
                        <Link to="/address">
                            <img src="./img/left-active.png" alt="" />
                        </Link>
                        <Link to="/contacts">
                            <img src="./img/img-right.png" alt="" />
                        </Link>
                    </div>
                </div>

                <div className="mini-wrap mini-wrap_links df">
                    <Link className="just" to='/finance'><h3>Финансы</h3></Link>
                    <Link className="just" to='/address'><h3>Адрес</h3></Link>
                    <Link className="just active2" to='/price'><h3>Загрузка прайса</h3></Link>
                    <Link className="just" to='/master/settings/pictures'><h3>Фото</h3></Link>
                </div>

                <div className="mini-main-3 df">

                    <div className="main-options df">

                        <div className="downloadPrices">
                            <h2>Загрузка прайса </h2>
                            <div className="donpr">
                                <div>
                                    <div className="selectBox" onClick={() => isexpandeVid(!expandedVid)}>
                                        <select id="uslugivasdf" style={{ padding: "9px 31px" }}>
                                            <option>Вид услуги </option>
                                        </select>
                                        <div className="overSelect"></div>
                                    </div>
                                    <div id="checkboxes" style={!expandedVid ? { display: 'block', position: 'absolute', width: '17%', zIndex: 1 } : { display: 'none' }}>
                                        <label htmlFor="one"><input type="checkbox" id="one" />Использовать стандартный список </label>
                                        <label htmlFor="two"><input type="checkbox" id="two" />Загрузить свой список</label>
                                    </div>
                                </div>
                            </div>

                            <div className="donpr">
                                <div>
                                    <div className="selectBox" onClick={() => isexpandeList(!expandedList)}>
                                        <select id="uslugivasdf" style={{ padding: "9px 31px" }}>
                                            <option>Список услуг </option>
                                        </select>
                                        <div className="overSelect"></div>
                                    </div>
                                    <div id="checkboxes" style={!expandedList ? { display: 'block', position: 'absolute', width: '17%', zIndex: 1 } : { display: 'none' }}>
                                        <label htmlFor="one"><input type="checkbox" id="one" />Использовать стандартный список </label>
                                        <label htmlFor="two"><input type="checkbox" id="two" />Загрузить свой список</label>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <div className="selectBox" onClick={() => isexpanded(!expanded)}>
                                    <select id="uslugivasdf" style={{ padding: "9px 31px" }}>
                                        <option>Выбор вида ремонта</option>
                                    </select>
                                    <div className="overSelect"></div>
                                </div>
                                <div id="checkboxes" style={!expanded ? { display: 'block', position: 'absolute', width: '17%' } : { display: 'none' }}>
                                    <label htmlFor="one"><input type="checkbox" id="one" />Использовать стандартный список </label>
                                    <label htmlFor="two"><input type="checkbox" id="two" />Загрузить свой список</label>
                                </div>
                            </div>
                        </div>
                        <button className="goooSaveButton">Сохранить</button>

                    </div>

                    <div className="big-input-wrap">
                        <h1>Вид ремонта</h1>

                        <div className="urlbiginutwrap">
                            <h3>Вид услуги &gt; </h3>
                            <h3>Список услуг  &gt; </h3>
                            <h3>Выбор вида ремонта</h3>
                        </div>

                        <div className="addbiginputwrap">
                            <div className="donpr">
                                <div>
                                    <div className="selectBox" onClick={() => isexpandedRemont(!expandedRemont)}>
                                        <select id="uslugivasdf" className="oneofuniqueselect" style={{ padding: "9px 31px" }}>
                                            <option>замена экрана</option>
                                        </select>
                                        <div className="overSelect"></div>
                                    </div>
                                    <div id="checkboxes" style={!expandedRemont ? { display: 'block', position: 'absolute', width: '19%' } : { display: 'none' }}>
                                        <label htmlFor="one"><input type="checkbox" id="one" />Использовать стандартный список </label>
                                        <label htmlFor="two"><input type="checkbox" id="two" />Загрузить свой список</label>
                                    </div>
                                </div>
                            </div>
                            <div className="addbiginput__timeandprice">
                                <input type="text" placeholder="время" />
                                <input type="number" placeholder=" Цена " />
                            </div>
                            <button className="addbiginput__button">Добавить услугу</button>
                        </div>

                    </div>

                </div>
            </div>
        </div>
    )
}


export default Profile;
