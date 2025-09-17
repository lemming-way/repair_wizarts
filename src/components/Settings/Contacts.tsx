import React, { useEffect } from "react";
import '../../scss/Contacts.css'
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
                        <Link to="/price">
                            <img src="./img/left-active.png" alt=""/>
                        </Link>
                        <img src="./img/right-disable.png" alt=""/>
                    </div>
                </div>

                <div className="mini-wrap mini-wrap_links df">
                    <Link className="just" to='/finance'><h3>Финансы</h3></Link>
                    <Link className="just" to='/address'><h3>Адрес</h3></Link>
                    <Link className="just" to='/price'><h3>Загрузка прайса</h3></Link>
                    <Link className="just active2" to='/contacts'><h3>Контакты</h3></Link>
                </div>

                <div className="block-info-12">


                    <div className="photo-taking df">
                        <label htmlFor="upfile">
                            <img src="./img/img-small-photo.png" alt=""/>
                        </label>
                        <input type="file" id="upfile" style={{display: "none"}}/>
                        <div className="block-btn df">
                            <button className="btn-8">Изменить</button>
                            <button className="btn-9">Удалить</button>
                        </div>
                    </div>
                    <button className="done" style={{marginTop: '30px'}}>Сохранить</button>

                </div>

                {/* <button className="goooSaveButton">Сохранить</button> */}

            </div>
        </div>
    )
}


export default Profile;
