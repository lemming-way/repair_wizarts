import { useState } from "react"
import style from "./EmailSettings.module.css"



export default function EmailSettings({ setVisibvleEmailSettings }) {

    const [turn, setTurn] = useState("")
    const [timer, setTimer] = useState("")

    return (
        <>
            <div className={style.wrap}>
                <div className={style.block}>
                    <div className={style.close}  onClick={()=>setVisibvleEmailSettings(false)}>
                        <img src="/img/close.svg" alt="" />
                    </div>
                    <p className={style.message}>Будьте вкурсе новых заказов в любых направлениях</p>

                    <div className={style.settings_block}>
                        <div className={style.radio_block}>
                            <input type="radio" id="all_alarm" checked={turn=="turn_on"} value={"turn_on"} onChange={(e)=>setTurn(e.target.value)} name="turn" />
                            <label htmlFor="all_alarm">Получать уведомления (рекомендуемо)</label>
                        </div>
                        <div className={style.time_block}>
                            <div className={style.radio_block}>
                                <input type="radio" checked={timer=="h1"} disabled={turn!="turn_on"} value={"h1"} onChange={(e)=>setTimer(e.target.value)} id="h1" name="timer" />
                                <label htmlFor="h1">Раз в час</label>
                            </div>
                            <div className={style.radio_block}>
                                <input type="radio" checked={timer=="h3"} disabled={turn!="turn_on"} value={"h3"} onChange={(e)=>setTimer(e.target.value)} id="h3" name="timer" />
                                <label htmlFor="h3">Раз в 3 часа</label>
                            </div>
                            <div className={style.radio_block}>
                                <input type="radio" checked={timer=="h12"} disabled={turn!="turn_on"} value={"h12"} onChange={(e)=>setTimer(e.target.value)} id="h12" name="timer" />
                                <label htmlFor="h12">Раз в 12 часов</label>
                            </div>
                            <div className={style.radio_block}>
                                <input type="radio" checked={timer=="h24"} disabled={turn!="turn_on"} value={"h24"} onChange={(e)=>setTimer(e.target.value)} id="h24" name="timer" />
                                <label htmlFor="h24">Раз в сутки</label>
                            </div>
                            <div className={style.radio_block}>
                                <input type="radio" checked={timer=="w1"} disabled={turn!="turn_on"} value={"w1"} onChange={(e)=>setTimer(e.target.value)} id="w1" name="timer" />
                                <label htmlFor="w1">Раз в неделю</label>
                            </div>
                        </div>
                        <div className={style.radio_block}>
                            <input type="radio" id="turn_off" checked={turn=="turn_off"} value={"turn_off"} onChange={(e)=>setTurn(e.target.value)}  name="turn" />
                            <label htmlFor="turn_off">Не получасть уведомления</label>
                        </div>
                    </div>

                    <div className={style.buttons}>
                        <button className={style.button_back} onClick={()=>setVisibvleEmailSettings(false)}>Отмена</button>
                        <button className={style.button} onClick={()=>setVisibvleEmailSettings(false)}>Готово</button>
                    </div>
                </div>
            </div>
            
        </>
    )
}