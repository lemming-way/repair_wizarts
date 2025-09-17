import React, {useEffect, useState} from "react";
import Sidebar from "../sidebar";
import '../../scss/refill.css'
import ChoiceOfReplenishmentMethodHistory from "./ChoiceOfReplenishmentMethodHistory";


function App() {


    useEffect(() => {
        document.title = 'Кошелек';
    }, []);

    let visa_content = document.querySelector('.visa-content')
    let visa_2 = document.querySelector('.visa-2')

    // const [classname, setClassName] = useState("")
   const [show, setShow] = useState(true)

    const visa_content_two = (value: any) => {
        return (
            <>
                <div className="visa-content">
                    <div className="input_1">
                        <h2>Номер карты:</h2>
                        <input type="text" className="visa-number-input" placeholder="4203 6598 3214 2365"/>
                    </div>

                    <div className="three-input df">
                        <div className="input_2">
                            <h4>ММ:</h4>
                            <input type="number" placeholder="12"/>
                        </div>
                        <div className="slash">/</div>
                        <div className="input_3">
                            <h4>ГГ:</h4>
                            <input type="number" placeholder="25"/>
                        </div>

                        <div className="input_4">
                            <h4>CVC:</h4>
                            <input type="password" placeholder="•••"/>
                        </div>
                    </div>

                    <div className="main-text-refill df">

                        <div className="text">
                            <h4>К списанию с карты:</h4>
                            <p>1500₽</p>
                        </div>

                        <div className="text">
                            <h4>Зачислится на кошелек:</h4>
                            <p>1500₽</p>
                        </div>

                    </div>
                </div>
            </>
        )
    }
    const vise_content__three = (value: any) => {
        return (
            <>
                <div className="visa-2">
                    <hr/>
                    <div className="main-text-refill df">

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
            </>
        )
    }

    return (
        <div className='main nal df'>
            <Sidebar/>
            <div className="block-info-2 df">
                <div>
                    <h1>Кошелек </h1>
                    <h3>Пополнение счета</h3>

                    <div className="radio-content df">
                        <input value="male"
                                  type="radio"  id="it" name="yesorno" onClick={() =>setShow(true)}/>
                        <label htmlFor="it" className="df">
                            <img src="./img/img-visa.png" alt="VISA"/>
                            <h2>Банковская карта <br/> XXXX XXXX XXXX 4443</h2>
                        </label>
                    </div>

                    <div className="radio-content-2 df">
                        <input type="radio" id="add" name="yesorno" onClick={() =>setShow(false)}/>
                        <label htmlFor="add" className="df">
                            <img src="./img/img-add.png" alt="VISA"/>
                            <h2>Новая карта</h2>
                        </label>
                    </div>

                    {show ? visa_content_two('asdas') : null}
                    {!show ? vise_content__three('asdas') : null}


                    <div className="btn-content">
                        <a href="/replenishment" className="btn_1">Назад</a>
                        <a href="/pay" className="btn_2">Оплатить</a>
                    </div>
                </div>
                <ChoiceOfReplenishmentMethodHistory/>
            </div>
        </div>
    )
}


export default App;
