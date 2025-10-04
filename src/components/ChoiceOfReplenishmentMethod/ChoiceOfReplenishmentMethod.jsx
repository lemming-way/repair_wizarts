import {
    useState,
    useEffect
} from 'react';

import '../../scss/ChoiceOfReplenishmentMethod.css'
import { useNavigate } from 'react-router-dom';

import ChoiceOfReplenishmentMethodCard from './ChoiceOfReplenishmentMethodCard';
import ChoiceOfReplenishmentMethodHistory from "./ChoiceOfReplenishmentMethodHistory";
import style from './style.module.css'
import { useLanguage } from '../../state/language'

function ChoiceOfReplenishmentMethod() {

    const navigator = useNavigate()
    const text = useLanguage()
    // const [error, setError] = useState("")
    // const [amount, setAmount] = useState("")
    // const updateAmount = (e) => {
    //     const value = e.target.value
    //     if (isNaN(value)) {
    //         return
    //     }
    //     setAmount(value)
    // }
    // const onSubmit = (e) => {
    //     e.preventDefault()
    //     return replenishBalance(amount).then((res) => {
    //         window.location.replace(res.confirmation_url)
    //     }).catch((err) => setError(err.message))
    // }

    useEffect(() => {
        document.title = text('Wallet');
    }, [text]);





    const [inputPrice, setInputPrice] = useState("");
    const [inputRadio, setInputRadio] = useState("");
    const [stage, setStage] = useState(0)

    return (

                <div className="main-block df">

                    {stage === 0 ?
                    <div className="middle-block-1">
                        <h1>{text('Wallet')}</h1>

                        <h3>{text('Top up balance')}</h3>

                        <p>{text('Amount:')}</p>

                        <div className={style.price_row}>
                            <input value={inputPrice} onChange={(e)=>setInputPrice(e.target.value)} type="text" placeholder={text('Top-up amount placeholder')} />
                            <p className={style.percentage_text}>{text('Including commission')} {(inputPrice * 0.9).toFixed(1)}</p>
                        </div>
                        <h6>{text('Top-up limits notice')}</h6>

                        <ChoiceOfReplenishmentMethodCard />

                        <div className={style.buttons} >
                            <button className={style.button}  href="/refill" onClick={()=>setStage(1)}>{text('Next')} </button>
                            {/* <a className={style.button}  href="/master/settings/balance">Вывести средства </a> */}
                        </div>
                    </div>
                    : null}



                    {stage === 1 ?

                    <div className="middle-block-1">
                        <h1>{text('Wallet')}</h1>

                        <h3>{text('Top up balance')}</h3>

                        <div>
                            <div className={style.payment_row}>
                                <input type="radio" name="payment" value={0} onChange={(e)=> setInputRadio(e.target.value)} checked={inputRadio===0} />
                                <img src="/img/visa_block.png" alt="" />
                                <p>{text('Bank card')} <br />
                                XXXX XXXX XXXX 4443</p>
                            </div>
                            <div className={style.payment_row}>
                                <input type="radio" name="payment" value={1} onChange={(e)=> setInputRadio(e.target.value)} checked={inputRadio===1} />
                                <img src="/img/empty_block.png" alt="" />
                                <p>{text('New card')}</p>
                            </div>
                        </div>

                        {inputRadio === 1 ?  
                            <div className={style.add_card}>
                                <label htmlFor="number_card">{text('Card number:')}</label>
                                <div className={style.row2}>
                                    <input type="text" id="number_card" placeholder={text('Card number placeholder')} />
                                    <img src="/img/Daco_471065 1.png" alt="" />
                                </div>
                                
                                <div className={style.add_card__row}>
                                    <div className={style.add_card__col}>
                                        <label htmlFor="m_card">{text('MM:')}</label>
                                        <input type="text" id="m_card" />
                                    </div>
                                    <div className={style.razdel}><p>/</p></div>
                                    <div className={style.add_card__col}>
                                        <label htmlFor="y_card">{text('YY:')}</label>
                                        <input type="text" id="y_card" />
                                    </div>
                                    <div style={{flex: 1}}></div>
                                    <div className={style.add_card__col}>
                                        <label htmlFor="cvc_card">{text('CVC:')}</label>
                                        <input type="text" id="cvc_card" />
                                    </div>
                                </div>

                                <div className={style.row3}>
                                    <p className={style.text}><span>{text('Amount to be debited from the card:')}</span><br />1500₽</p>
                                    <p className={style.text}><span>{text('Amount to be credited to the card:')}</span><br />1500₽</p>
                                </div>
                            </div>
                        :null}



                        <div className={style.buttons} >
                            <button className={style.button_back}  onClick={()=>setStage(0)}>{text('Back')} </button>
                            <button className={style.button}  onClick={()=>setStage(2)}>{text('Pay')} </button>
                        </div>
                    </div>
                    : null}


                    {stage === 2 ?
                        <div className="middle-block-1">
                            <h1>{text('Wallet')}</h1>
                            <h3>{text('Funds remaining:')} 5000 ₽</h3>

                            <label htmlFor="sum_stage3" className={style.label_stage3}>{text('Amount')}</label>
                            <input type="text" name="" id="sum_stage3" className={style.input_stage3} placeholder={text('Enter amount placeholder')} />
                            <div className={style.buttons} >
                                <button className={style.button}  onClick={()=>setStage(2)}>{text('Top up')} </button>
                                <button className={style.button}  onClick={()=>navigator("/master/settings/balance")}>{text('Withdraw funds')} </button>
                            </div>
                        </div>
                    : null}

                    <ChoiceOfReplenishmentMethodHistory />

                </div>
    )
}

export default ChoiceOfReplenishmentMethod;
