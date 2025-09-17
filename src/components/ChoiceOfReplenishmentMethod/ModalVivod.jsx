import { useState } from "react"
import style from "./ModalVivod.module.css"



export default function ModalVivod({ setInputModalVivod }) {

    const [countStar, setCountStar] = useState(0)

    return (
        <>
            <div className={style.wrap}>
                <div className={style.block}>
                    <div className={style.close}  onClick={()=>setInputModalVivod(false)}>
                        <img src="/img/close.svg" alt="" />
                    </div>

                    <div className={style.wrap_block}>
                        <img src="/img/businessman.png" alt="" />
                        <div style={{display: "flex", flexDirection: 'column', alignItems: "center", gap: "20px"}}>
                            <h2 className={style.heading}>Подтверждения вывода средств</h2>
                            <p>Дата ближайшего вывода - 04-11-2024</p>
                            <div className={style.buttons}>
                                <div className={style.button} onClick={()=>setInputModalVivod(false)}>Ок</div>
                                <div className={style.button_back} onClick={()=>setInputModalVivod(false)}>Отмена</div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
            
        </>
    )
}