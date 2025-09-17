import { useState, useRef } from "react"
import style from "./ModalDelete.module.css"



export default function ModalDelete({ setVisibleDelete }) {

   

    return (
        <>
            <div className={style.wrap}>
                <div className={style.block}>
                    <div className={style.close}  onClick={()=>setVisibleDelete(false)}>
                        <img src="/img/close.svg" alt="" />
                    </div>

                    <h2 className={style.heading}>Удаление кошелька </h2>
                    <p>Удалить кошелек?</p>
                    <div className={style.buttons_row}>
                        <button className={style.button_back} onClick={()=>setVisibleDelete(false)}>Отмена</button>
                        <button className={style.button}>Удалить</button>
                    </div>
     
                </div>
            </div>
            
        </>
    )
}