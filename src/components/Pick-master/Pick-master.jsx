import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import offerService from "../../services/offer.service";
import FrameMaster from './frame-masters'
import './pick-master.css'
import Popup from "reactjs-popup";
import MediaQuery from 'react-responsive';
import SERVER_PATH from "../../constants/SERVER_PATH";



function PickMaster(props) {
    const { id } = useParams()

    const [offers, setOffers] = useState([])

    useEffect(() => {
        (async () => {
            const offers = await offerService.getOffers(id)
            setOffers(offers)
            setSelected(offers[0])
        })()
    }, [])

    useEffect(() => {
        document.title = 'Выбор мастера';
    }, []);
    
    const [selected, setSelected] = useState(null)
    const [master, setMaster] = useState({ })

    useEffect(() => {
        if (selected?.master_username) {
            (async () => {
                const response = await fetch(SERVER_PATH + "api/user/master/" + selected.master_username)
                const master = await response.json()

                setMaster(master)
            })()
        }
    }, [selected?.master_username])

    return (
        <>
            <section className="page_1">
                <div className="frame df font_abel mobile-frame">
                    <MediaQuery query="(min-device-width: 1415px)">
                        <FrameMaster setSelected={setSelected} offers={offers} />
                    </MediaQuery>
                    {/* <MediaQuery query="(max-device-width: 500px)">
                        <Sidebar />
                    </MediaQuery> */}
                    <div className="big_frame__fex mobile-big_frame__fex">



                        <div className="frame_2 mobile-frame_2">
                            <div className="nav_right df mobile-nav_right">
                                <div className="nav_left-alecsandr_2 df font_abel mobile-nav_left-alecsandr_2">
                                    <div className="df mygustsstfoiugwre">
                                        <Link to="/frame-master"  className="backtoframemessagesLink">
                                            <img src="../img/charback.png" alt="" />
                                        </Link>
                                        <div className="alecsandr_img-4 mobile-alecsandr_img-4">
                                            <img src="../img/profil_img/1.png" alt="no photo" />
                                        </div>
                                    </div>

                                    <div className="alecsandr_info align">
                                        <div className="alecsandr_text-2 mobile-alecsandr_text-2">
                                            <h2>{master.name} {master.lastname}</h2>
                                            <h2>{master.business_model}</h2>
                                        </div>

                                        <div className="grade_text df align mobile-grade_text">
                                            <h2>5</h2>
                                            <div className="grade_img df align mobile-grade_img">
                                                <img src="../img/profil_img/3.png" alt="no photo" />
                                                <img src="../img/profil_img/3.png" alt="no photo" />
                                                <img src="../img/profil_img/3.png" alt="no photo" />
                                                <img src="../img/profil_img/3.png" alt="no photo" />
                                                <img src="../img/profil_img/3.png" alt="no photo" />
                                            </div>
                                            <h3>5</h3>
                                        </div>
                                    </div>
                                </div>
                                <div className="alecsandr_info-text mobile-alecsandr_info-text">
                                    <div className="info_cards df align">
                                        <div className="info_cards-text_1">
                                            <h2>Город:</h2>
                                            <h2>Район:</h2>
                                            <h2>Станция метро:</h2>
                                        </div>

                                        <div className="info_cards-text_2">
                                            <h2>{master.address}</h2>
                                            <h2>Васильеостовский</h2>
                                            <h2>Приморская</h2>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="w">
                                <div className="frame_3">
                                    <div className="nav_bottom df align font_inter mobile-nav_bottom">
                                        <div className="nav_bottom-text_active df align">
                                            <div className="nav_bottom-text_img">
                                                <img src="../img/profil_img/5.png" alt="no photo" />
                                            </div>
                                            <h2><span>5</span>Продавец Новичок</h2>
                                        </div>

                                        <div className="nav_bottom-text">
                                            <h2><span>13</span>заказов выполнено</h2>
                                        </div>

                                        <div className="nav_bottom-text">
                                            <h2><span>23</span>отзывов получено</h2>
                                        </div>

                                        <div className="nav_bottom-text">
                                            <h2><span>100%</span>заказов успешно сдано</h2>
                                        </div>
                                    </div>
                                </div>
                                <div className="frame_4">
                                    <div className="registration_date df align mobile-registration_date">
                                        <div className="regist_date-1 df mobile-regist_date-1">
                                            <div className="registration_date-info df">
                                                <div className="registration_text-1 mobile__registation-text-1">
                                                    <h2>На сайте: </h2>
                                                </div>
                                                <div className="registration_text-2">
                                                    <h2>с 2021 года</h2>
                                                </div>
                                            </div>
                                            <div className="registration_date-info df">
                                                <div className="registration_text-1">
                                                    <h2>Статус:</h2>
                                                </div>
                                                <div className="registration_text-2">
                                                    <h2><span>Онлайн</span></h2>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="regist_date-2 df mobile-regist_date-2">
                                            <div className="registration_date-info df">
                                                <div className="registration_text-1">
                                                    <h2>Оценка:</h2>
                                                </div>
                                                <div className="registration_text-2">
                                                    <h2><span>5.00</span></h2>
                                                </div>
                                            </div>
                                            <div className="registration_date-info df">
                                                <div className="registration_text-2 mobile-registration_text-2">
                                                    <h2><span className="big">54%</span> повторных заказов 2</h2>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="frame_5 mobile-frame_5">
                            <div className="pro_repair font_abel mobile-pro_repair">
                                <table>
                                    <tbody>
                                        <tr>
                                            <td><span>Имя организации:</span></td>
                                            <td>
                                                <p>{master.organization_name}</p>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td><span>Список услуг:</span></td>
                                            <td>
                                                <p>Диагностика, ремонт (Из списка)</p>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td><span>Выбор устойств:</span></td>
                                            <td>
                                                <p>IPhone, Macbook (Из списка)</p>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td><span>Вид ремонта:</span></td>
                                            <td>
                                                <p>Пайка IPhone, переклейка экрана (Из списка)</p>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td><span>Ваша деятельность:</span></td>
                                            <td>
                                                <p>{master.specialty || "Не указан"}</p>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td><span>Основной бизнес:</span></td>
                                            <td>
                                                <p>{master.main_business || "Не указан"}</p>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td><span>Время: </span></td>
                                            <td>
                                                <p>4 часа</p>
                                            </td>
                                        </tr>
                                    </tbody>
                                    
                                </table>
                            </div>
                        </div>

                        <div className="frame_6 font_abel">
                            <div className="customer_message">
                                <div className="customer_message_text">
                                    <div className="mobile-textarea textareaffpgeri" placeholder="Сообщение для клиента ">{selected?.message}</div>
                                </div>
                            </div>
                            <div className="customer_message-but mobile-customer_message-but">
                                <Popup
                                    trigger={<button className="btnn mobile-btnn">Выбрать мастера</button>}
                                    modal
                                    nested
                                >
                                    {close => (
                                        <div className="modal-content">
                                            <span onClick={close}><img className="close" src="../img/img-delete.png" alt="" /></span>
                                            <div className="containerPopUp">
                                                <h3 className="finance__popup__title abel">
                                                    Вы подтверждаете выбор исполнителя?
                                                </h3>
                                                <p className="finance__popup__subtitle abel" style={{ textAlign: "center" }}>
                                                    Подверждая исполнителя вы вы открываете с ним диалог в чате
                                                </p>
                                                <div className="popUpBtn">
                                                    <button className="btn_6PopUpBack " onClick={close}>Нет</button>
                                                    <Link to="/fchat/16854163"><button className="btn_6PopUp" onClick={close}>Да</button></Link>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </Popup>
                                <Link to="/reviews-master">
                                    <button className="btn mobile-btn">Посмотреть отзывы</button>
                                </Link>
                            </div>
                        </div>

                    </div>
                </div>
            </section>
        </>
    );
}


export default PickMaster;