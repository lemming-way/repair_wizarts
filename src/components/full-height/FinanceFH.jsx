import React, {useEffect} from "react";
import Sidebar from "../sidebar";


import { Link } from "react-router-dom";
import Popup from "reactjs-popup";
import {click} from "@testing-library/user-event/dist/click";

function App() {
    useEffect(() => {
        document.title = 'Настройки';
    }, []);

    function Delete(classNames){
        document.querySelector(classNames).value = ''
    }

    function Changed(classInp, classBtn){
        let input = document.querySelector(classInp).value
        let a = document.querySelector(classBtn)

        a.classList.remove('btn_6PopUpOPen')

        if(input !== '') {
            a.classList.remove('btn_4')
            a.classList.add('btn_6PopUpOPen')
        } else if(input === '') {
            a.classList.remove('btn_6PopUpOPen')
            a.classList.add('btn_4')
        }
    }
    return (
        <div className="main nal df">
            <div className="block-info-7">

                <div className="setting df">
                    <div>
                        <h1>Настройки</h1>
                    </div>
                    <div>
                        <Link to="/user/wallet">
                            <img src="../img/left-active.png" alt=""/>
                        </Link>
                        <img src="../img/right-disable.png" alt=""/>

                    </div>
                </div>

                <div className="mini-wrap mini-wrap_links df">
                    <Link  className="just" to="/user/profile"><h3>Профиль</h3></Link>
                    <Link  className="just" to='/user/wallet'><h3 >Кошелек </h3></Link>
                    <Link  className="just active2" to='/user/finance'><h3 >Финансы</h3></Link>
                </div>

                <div className="inputs-wrap">

                    <h3>WebMoney</h3>
                    <div className="wedmoney-content df">
                        <div className="df">
                            <img  src="../img/img-wedMoney.png" alt=""/>
                            <input onChange={()=> Changed('.webmoney', '.btnForCorrentOne')} className="webmoney" type="text"/>
                        </div>
                        <div>
                            <Popup
                                trigger={<button className="btn_4 btnForCorrentOne">Сохранить</button>}
                                modal
                                nested
                            >
                                {close => (
                                    <div className="modal-content">
                                        <span onClick={close}><img className="close" src="../img/img-delete.png" alt="" /></span>
                                        <div className="containerPopUp">
                                            <h3 className="finance__popup__title abel">
                                                Подтвердите добавление
                                                кошелька WebMoney
                                            </h3>
                                            <p className="finance__popup__subtitle abel">
                                                На ваш телефон +7******9999 будет совершён звонок и автоответчик сообщит
                                                вам код активации. Введите код, который вы услышите при звонке, и
                                                подтвердите добавление номера кошелька Qiwi. Плата за звонок не
                                                взимается.
                                            </p>
                                            <div className="popUpBtn">
                                                <button className="btn_6PopUpBack " onClick={close}>Отмена</button>
                                                <button className="btn_6PopUp" onClick={close}>Получить звонок</button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </Popup>
                            <button className="btn_5"  onClick={() => Delete('.webmoney')}>Удалить</button>
                        </div>
                    </div>

                    <h3>QIWI Кошелек</h3>
                    <div className="wedmoney-content df">
                        <div className="df">
                            <img src="../img/img-ceneter-qivi.png" alt=""/>
                            <input onChange={()=> Changed('.qiwiCard', '.btnForCorrentTwo')} className="qiwiCard" type="text"/>
                        </div>
                        <div>
                            <Popup
                                trigger={<button className="btn_4 btnForCorrentTwo">Сохранить</button>}
                                modal
                                nested
                            >
                                {close => (
                                    <div className="modal-content">
                                        <span onClick={close}><img className="close" src="../img/img-delete.png" alt="" /></span>
                                        <div className="containerPopUp">
                                            <h3 className="finance__popup__title abel">
                                                Подтвердите добавление
                                                кошелька Qiwi
                                            </h3>
                                            <p className="finance__popup__subtitle abel">
                                                На ваш телефон +7******9999 будет совершён звонок и автоответчик сообщит
                                                вам код активации. Введите код, который вы услышите при звонке, и
                                                подтвердите добавление номера кошелька Qiwi. Плата за звонок не
                                                взимается.
                                            </p>
                                            <div className="popUpBtn">
                                                <button className="btn_6PopUpBack " onClick={close}>Отмена</button>
                                                <button className="btn_6PopUp" onClick={close}>Получить звонок</button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </Popup>
                            <button className="btn_5"  onClick={() => Delete('.qiwiCard')}>Удалить</button>
                        </div>
                    </div>

                    <h3>Банковская карта</h3>
                    <div className="wedmoney-content df">
                        <div className="df">
                            <img src="../img/img-center-visa.png" alt=""/>
                            <input placeholder="•••• •••• •••• ••••" onChange={()=> Changed('.bankcard', '.btnForCorrentThree')} className="bankcard" type="password" />
                        </div>
                        <div>
                            {/*POPUP*/}
                            <Popup
                                trigger={<button className="btn_4 btnForCorrentThree">Сохранить</button>}
                                modal
                                nested
                            >
                                {close => (
                                    <div className="modal-content">
                                        <span onClick={close}><img className="close" src="../img/img-delete.png" alt="" /></span>
                                        <div className="containerPopUp">
                                            <h3 className="finance__popup__title abel">
                                                Подтвердите добавление
                                                банковской карты
                                            </h3>
                                            <p className="finance__popup__subtitle abel">
                                                На ваш телефон +7******9999 будет совершён звонок и автоответчик сообщит
                                                вам код активации. Введите код, который вы услышите при звонке, и
                                                подтвердите добавление номера кошелька Qiwi. Плата за звонок не
                                                взимается.
                                            </p>
                                            <div className="popUpBtn">
                                                <button className="btn_6PopUpBack " onClick={close}>Отмена</button>
                                                <button className="btn_6PopUp" onClick={close}>Получить звонок</button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </Popup>
                            <button className="btn_5" onClick={() => Delete('.bankcard')}>Удалить</button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}


export default App;
