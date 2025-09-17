import { useNavigate } from "react-router-dom"
import style from "./ModalDelete.module.css"



export default function ModalOfferGo({ setVisibleModalGo }) {

    const navigator = useNavigate()
    return (
        <>
            <div className={style.wrap}>
                <div className={style.block}>
                    <div className={style.close}  onClick={()=>setVisibleModalGo(false)}>
                        <img src="/img/close.svg" alt="" />
                    </div>
                    <p className={style.message}>Ваше индивидуальное предложение отправлено</p>

                    <div className={style.buttons}>
                        <div className={style.button} onClick={()=>{setVisibleModalGo(false); navigator("/master/requests")}}>Хорошо</div>
                    </div>
                </div>
            </div>
            
        </>
    )
}