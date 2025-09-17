import style from "./ModalConfirmMaster.module.css"
import { useNavigate } from "react-router-dom"


export default function ModalConfirmMaster({ setVisibleModalConfirmMaster }) {
    const navigator = useNavigate()
    return (
        <>
            <div className={style.wrap}>
                <div className={style.block}>
                    <div className={style.close}  onClick={()=>setVisibleModalConfirmMaster(false)}>
                        <img src="/img/close.svg" alt="" />
                    </div>
                    <p className={style.message}>Вы подтвердили производителя работ</p>
                    <p style={{textAlign: "center", marginBottom: "20px"}}>Подтверждая исполнителя  вы открываете с ним диалог в чате</p>

                    <div className={style.buttons}>
                        <div className={style.button} onClick={()=>{setVisibleModalConfirmMaster(false); navigator("/client/chat/111")}}>Ок</div>
                    </div>
                </div>
            </div>
            
        </>
    )
}