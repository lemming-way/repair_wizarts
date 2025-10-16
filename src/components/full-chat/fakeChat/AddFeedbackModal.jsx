import { useState } from "react"
import style from "./AddFeedbackModal.module.css"



export default function AddFeedbackModal({ setVisibleAddFeedback, setVisibleFinalOrder }) {

    const [countStar, setCountStar] = useState(0)

    return (
        <>
            <div className={style.wrap}>
                <div className={style.block}>
                    <div className={style.close}  onClick={()=>setVisibleAddFeedback(false)}>
                        <img src="/img/close.svg" alt="" />
                    </div>
                    <h2 className={style.heading}>Поздравляем вы завершаете заказ, пожалуйста оставьте отзыв</h2>
                    {/* <p className={style.error}>Пожалуйста пополните баланс на 500 рублей</p> */}

                    <div className={style.stars}>
                        {[1,2,3,4,5].map((_,i) =>
                            <div className={`${i<=countStar ? style.yellow : null}`} onClick={()=> setCountStar(i)}>
                                <img src="/img/icons/yellow-star.png" alt="" />
                            </div>
                        )}
                    </div>

                    <div style={{position: "relative"}}>
                        <textarea className={style.textarea} name="" rows={8} id="" placeholder="В тексте не должно быть оскорблений и мата."></textarea>
                    </div>
                    

                    <div className={style.block_photo}>
                        <p className={style.heading_h3}>Добавить фотографии</p>
                        <div className={style.add_photo}>
                            <img src="/img/icons/camera.png" alt="" />    
                        </div>    
                    </div>

                    <div className={style.buttons}>
                        <div className={style.button} onClick={()=> {setVisibleAddFeedback(false); setVisibleFinalOrder(true)}}>Отправить</div>
                        <div className={style.button_back} onClick={()=>setVisibleAddFeedback(false)}>Назад</div>
                    </div>
                </div>
            </div>
            
        </>
    )
}