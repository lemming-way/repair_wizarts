import {
    useState,
    useEffect
} from 'react';
import '../../scss/ChoiceOfReplenishmentMethod.css'

import 'bootstrap/dist/css/bootstrap.min.css';

import Sidebar from "../sidebar";
import ChoiceOfReplenishmentMethodHistory from "./ChoiceOfReplenishmentMethodHistory";
import { replenishBalance } from '../../services/balance.service';
import style from './style.module.css'
import ModalVivod from './ModalVivod';
import ChoiceOfReplenishmentMethodCard from './ChoiceOfReplenishmentMethodCard';
import ClientProfileNavigator from '../full-height/ClientProfileNavigator';
import { Link, useNavigate } from 'react-router-dom';
import ChoiceOfReplenishmentMethodHistoryClient from './ChoiceOfReplenishmentMethodHistoryClient';

function ChoiceOfReplenishmentMethodClient() {

    const navigator = useNavigate()

    const [error, setError] = useState("")
    const [amount, setAmount] = useState("")
    const updateAmount = (e) => {
        const value = e.target.value
        if (isNaN(value)) {
            return
        }
        setAmount(value)
    }

    const onSubmit = (e) => {
        e.preventDefault()
        return replenishBalance(amount).then((res) => {
            window.location.replace(res.confirmation_url)
        }).catch((err) => setError(err.message))
    }

    useEffect(() => {
        document.title = 'Кошелек';
    }, []);





    const [inputPrice, setInputPrice] = useState("");
    const [inputRadio, setInputRadio] = useState("");
    const [stage, setStage] = useState(0)

    return (

        <div className={style.main_block}>

            {stage == 0 ?
            <div className="middle-block-1">
                <h1>Кошелек</h1>

                <h3>Пополнение счета</h3>

                <p>Сумма:</p>

                <div className={style.price_row}>
                    <input value={inputPrice} onChange={(e)=>setInputPrice(e.target.value)} type="text" placeholder="1500₽" />
                    <p className={style.percentage_text}>С учетом комиссии {(inputPrice * 0.9).toFixed(1)}</p>
                </div>
                <h6>Минимум 10₽ максимум 150 000 с учетом комиссии</h6>

                <ChoiceOfReplenishmentMethodCard />

                <div className={style.buttons} >
                    <button className={style.button}  href="/refill" onClick={()=>setStage(1)}>Далее </button>
                    {/* <a className={style.button}  href="/master/settings/balance">Вывести средства </a> */}
                </div>
            </div>
            : null}



            {stage == 1 ?
            <div className="middle-block-1">
                <h1>Кошелек</h1>

                <h3>Пополнение счета</h3>

                <div>
                    <div className={style.payment_row}>
                        <input type="radio" name="payment" value={0} onChange={(e)=> setInputRadio(e.target.value)} checked={inputRadio==0} />
                        <img src="/img/visa_block.png" alt="" />
                        <p>Банковская карта <br />
                        XXXX XXXX XXXX 4443</p>
                    </div>
                    <div className={style.payment_row}>
                        <input type="radio" name="payment" value={1} onChange={(e)=> setInputRadio(e.target.value)} checked={inputRadio==1} />
                        <img src="/img/empty_block.png" alt="" />
                        <p>Новая карта</p>
                    </div>
                </div>

                {inputRadio == 1 ?  
                    <div className={style.add_card}>
                        <label htmlFor="number_card">Номер карты:</label>
                        <div className={style.row2}>
                            <input type="text" id="number_card" placeholder='номер карты' />
                            <img src="/img/Daco_471065 1.png" alt="" />
                        </div>
                        
                        <div className={style.add_card__row}>
                            <div className={style.add_card__col}>
                                <label htmlFor="m_card">ММ:</label>
                                <input type="text" id="m_card" />
                            </div>
                            <div className={style.razdel}><p>/</p></div>
                            <div className={style.add_card__col}>
                                <label htmlFor="y_card">ГГ:</label>
                                <input type="text" id="y_card" />
                            </div>
                            <div style={{flex: 1}}></div>
                            <div className={style.add_card__col}>
                                <label htmlFor="cvc_card">CVC:</label>
                                <input type="text" id="cvc_card" />
                            </div>
                        </div>

                        <div className={style.row3}>
                            <p className={style.text}><span>К списанию с карты:</span><br />1500₽</p>
                            <p className={style.text}><span>Зачислится на карту:</span><br />1500₽</p>
                        </div>
                    </div>
                :null}

                

                <div className={style.buttons} >
                    <button className={style.button_back}  onClick={()=>setStage(0)}>Назад </button>
                    <button className={style.button}  onClick={()=>setStage(2)}>Оплатить </button>
                </div>
            </div>
            : null}


            {stage == 2 ?
                <div className="middle-block-1">
                    <h1>Кошелек</h1>
                    <h3>Осталось средств: 5000 ₽</h3>

                    <label htmlFor="sum_stage3" className={style.label_stage3}>Сумма</label>
                    <input type="text" name="" id="sum_stage3" className={style.input_stage3} placeholder='укажите сумму' />
                    <div className={style.buttons} >
                        <button className={style.button}  onClick={()=>setStage(2)}>Пополнить </button>
                        <button className={style.button}  onClick={()=>navigator("/client/settings/balance")}>Вывести средства </button>
                    </div>
                </div>
            : null}

            <ChoiceOfReplenishmentMethodHistoryClient />

        </div>
    )
}

export default ChoiceOfReplenishmentMethodClient;