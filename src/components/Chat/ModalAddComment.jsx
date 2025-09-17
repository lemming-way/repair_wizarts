import { useState } from "react"
import style from "./ModalAddComment.module.css"



export default function ModalAddComment({ setVisibleModalAddComment, setVisibleFinalOrder }) {

    const [countStar, setCountStar] = useState(-1)

    return (
        <>
            <div className={style.wrap}>
                <div className={style.block}>
                    <div className={style.close}  onClick={()=>setVisibleModalAddComment(false)}>
                        <img src="/img/close.svg" alt="" />
                    </div>
                    <h2 className={style.heading}>Оценка и комментарии</h2>
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
                        <div style={{display: "flex", gap: "10px"}}>
                            <div className={style.add_photo}>
                                <img src="/img/icons/camera.png" alt="" />    
                            </div>  
                            <p className={style.photo_text}>Это необязательно, но с ними отзыв станет более наглядным. Скриншоты переписки не пройдут проверку.</p>
                        </div>
  

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