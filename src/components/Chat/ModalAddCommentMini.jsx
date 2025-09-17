import { useState } from "react"
import style from "./ModalAddComment.module.css"



export default function ModalAddCommentMini({ setVisibleModalAddComment, setVisibleFinalOrder }) {

    const [countStar, setCountStar] = useState(-1)

    return (
        <>
            <div className={style.wrap}>
                <div className={style.block}>
                    <div className={style.close}  onClick={()=>setVisibleModalAddComment(false)}>
                        <img src="/img/close.svg" alt="" />
                    </div>
                    <h2 className={style.heading}>Ответ на отзыв</h2>
                    {/* <p className={style.error}>Пожалуйста пополните баланс на 500 рублей</p> */}

                    <div style={{position: "relative", marginBottom: "20px"}}>
                        <textarea className={style.textarea} name="" rows={8} id="" placeholder="В тексте не должно быть оскорблений и мата."></textarea>
                    </div>
                    

                    <div className={style.buttons}>
                        <div className={style.button} onClick={()=> {setVisibleModalAddComment(false); }}>Отправить</div>
                        <div className={style.button_back} onClick={()=>setVisibleModalAddComment(false)}>Назад</div>
                    </div>
                </div>
            </div>
            
        </>
    )
}