import React from "react";
import './more-info.css'
import {
    Link,
} from "react-router-dom";

function RegisterMaster() {
    return (
        <section className="more__info">
            <h1>Дополнительная информация </h1>
            <form>
                <input type="text" placeholder="Название организации" />
                <div className="sex">
                    <p>Пол:</p>
                    <input className="input" checked type="radio" id="man" name="sex" />
                    <label htmlFor="man">Мужской</label>
                    <input type="radio" id="woman" name="sex" />
                    <label htmlFor="woman">Женский</label>
                </div>
                <input type="text" placeholder="Вид деятельности" />
                <input type="text" placeholder="Основной бизнес" />
                <input type="text" placeholder="Основное направление" />
                <div className="model">
                    <p>Бизнес модель:</p>
                    <div className="labels">
                        <div className="label">
                            <input className="input" checked type="radio" id="master" name="model" />
                            <label htmlFor="master">Частный мастер</label>
                        </div>
                        <div className="label">
                            <input type="radio" id="service" name="model" />
                            <label htmlFor="service">Сервис</label>
                        </div>
                    </div>
                </div>
                <div>
                    <select id="uslugi" className="fsafweqpuhwe">
                        <option value="hide">Список услуг</option>
                        <option value="remont phone">Ремонт телефонов</option>
                        <option value="remont idad">Ремонт планшетов </option>
                        <option value="remont laptop">Ремонт ноутбуков</option>
                    </select>
                    <div className="erpqwerty erpqwertyfoooone">
                        <p>Пожалуйста, выберети нужный ответ, <br /> человек! Тот, что у вас есть на уме!</p>
                        <img src="../img/warringnmessage.png" alt="" />
                    </div>
                </div>

                <div>
                    <select id="rayon" className="fsafweqpuhwe">
                        <option value="hide">Район</option>
                        <option value="remont phone">Москва</option>
                        <option value="remont idad">Москва</option>
                        <option value="remont laptop">Москва</option>
                    </select>
                    <div className="erpqwerty erpqwertyfootwo">
                        <p>Пожалуйста, выберети нужный ответ, <br /> человек! Тот, что у вас есть на уме!</p>
                        <img src="../img/warringnmessage.png" alt="" />
                    </div>
                </div>
                <div>
                    <select id="metro" className="fsafweqpuhwe">
                        <option value="hide">Станция метро</option>
                        <option value="remont phone">Metro</option>
                        <option value="remont idad">Metro</option>
                        <option value="remont laptop">Metro</option>
                    </select>
                    <div className="erpqwerty erpqwertyfooothree">
                        <p>Пожалуйста, выберети нужный ответ, <br /> человек! Тот, что у вас есть на уме!</p>
                        <img src="../img/warringnmessage.png" alt="" />
                    </div>
                </div>
                <div>
                    <select id="address" className="fsafweqpuhwe">
                        <option value="hide">Адрес</option>
                        <option value="remont phone">Адрес</option>
                        <option value="remont idad">Адрес</option>
                        <option value="remont laptop">Адрес</option>
                    </select>
                    <div className="erpqwerty erpqwertyfooofour">
                        <p>Пожалуйста, выберети нужный ответ, <br /> человек! Тот, что у вас есть на уме!</p>
                        <img src="../img/warringnmessage.png" alt="" />
                    </div>
                </div>
                <Link to="/login/profile">
                    <button>Регистрация</button>
                </Link>
            </form>
        </section>
    )
}

export default RegisterMaster;