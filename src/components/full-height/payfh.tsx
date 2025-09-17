import React, { useEffect } from "react";
import Sidebar from "../sidebar";
import '../../scss/pay.css'
import ChoiceOfReplenishmentMethodHistory from "../ChoiceOfReplenishmentMethod/ChoiceOfReplenishmentMethodHistory";


function App() {

    useEffect(() => {
        document.title = 'Настройки';
    }, []);

    return (
        <div className='main nal df'>
            <div className="block-info-2 df">
                <div>
                    <h1>Кошелек <span className="middl__pr abel">10000₽</span></h1>
                    <h3>Пополнение счета</h3>

                    <h5>Введите номер своего мобильного телефона, подключенный <br/> к «Мобильному банку»
                        Сбербанка, <br/>
                        и нажмите «Продолжить» <br/> для подтверждения
                        номера телефона.</h5>

                    <input type="text" className="block__info__2__input" placeholder="Поле ввода"/>

                    <div className="visa-2">
                        <hr/>
                        <div className="main-text df">

                            <div className="text">
                                <h4>К списанию с карты:</h4>
                                <p>1500₽</p>
                            </div>

                            <div className="text">
                                <h4>Зачислится на кошелек:</h4>
                                <p>1500₽</p>
                            </div>

                        </div>
                        &nbsp;
                    </div>


                    <div className="btn-content">
                        <a href="/user/refill" className="btn_1">Назад</a>
                        <a href="/replenishment" className="btn_2">Оплатить</a>
                    </div>
                </div>

                <ChoiceOfReplenishmentMethodHistory/>
            </div>
        </div>
    )
}


export default App;
