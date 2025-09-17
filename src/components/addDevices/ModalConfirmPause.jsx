import { useState } from "react"
import style from "./ModalConfirmPause.module.css"



export default function ModalConfirmPause({ setVisibleAddFeedback, setStatus, StatusEnum }) {

    return (
        <>
            <div className={style.wrap}>
                <div className={style.block}>
                    <div className={style.close}  onClick={()=>setVisibleAddFeedback(false)}>
                        <img src="/img/close.svg" alt="" />
                    </div>
                    <h2 className={style.heading}>Подтверждение остановки</h2>

                    <p className={style.text}>
                    Подтверждение остановки
                    Вы подтверждаете остановку проекта? Исполнители не смогут больше добавлять в него свои предложения.
                    </p>


                    <div className={style.buttons}>
                        <div className={style.button_back} onClick={()=>setVisibleAddFeedback(false)}>Отмена</div>
                        <div className={style.button} onClick={()=> {setVisibleAddFeedback(false); setStatus(StatusEnum.PAUSED)}}>Остановить</div>
                    </div>
                </div>
            </div>
            
        </>
    )
}