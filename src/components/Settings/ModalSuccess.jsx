import { useState, useRef } from "react"
import style from "./ModalSuccess.module.css"



export default function ModalSuccess({ setVisibleSuccess }) {

   

    return (
        <>
            <div className={style.wrap}>
                <div className={style.block}>
                    <div className={style.close}  onClick={()=>setVisibleSuccess(false)}>
                        <img src="/img/close.svg" alt="" />
                    </div>
                    <img src="/img/success.png" alt="" />
                    <h2 className={style.heading}>Платежные реквизиты добавлены</h2>
     
                </div>
            </div>
            
        </>
    )
}