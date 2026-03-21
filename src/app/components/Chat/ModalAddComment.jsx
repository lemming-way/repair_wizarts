import { useState } from "react"

import style from "./ModalAddComment.module.css"
import { useLanguage } from "../../state/language"



export default function ModalAddComment({ setVisibleModalAddComment, setVisibleFinalOrder }) {
    const text = useLanguage();
    const [countStar, setCountStar] = useState(-1)

    return (
        <>
            <div className={style.wrap}>
                <div className={style.block}>
                    <div className={style.close}  onClick={()=>setVisibleModalAddComment(false)}>
                        <img src="/img/close.svg" alt="" />
                    </div>
                    <h2 className={style.heading}>{text("Rating and comments")}</h2>
                    {/* <p className={style.error}>{text("Please top up your balance by 500 rubles")}</p> */}

                    <div className={style.stars}>
                        {[1,2,3,4,5].map((_,i) =>
                            <div className={`${i<=countStar ? style.yellow : null}`} onClick={()=> setCountStar(i)}>
                                <img src="/img/icons/yellow-star.png" alt="" />
                            </div>
                        )}
                    </div>

                    <div style={{position: "relative"}}>
                        <textarea className={style.textarea} name="" rows={8} id="" placeholder={text("The text should not contain insults or profanity.")}></textarea>
                    </div>
                    

                    <div className={style.block_photo}>
                        <p className={style.heading_h3}>{text("Add photos")}</p>
                        <div style={{display: "flex", gap: "10px"}}>
                            <div className={style.add_photo}>
                                <img src="/img/icons/camera.png" alt="" />    
                            </div>  
                            <p className={style.photo_text}>{text("This is optional, but with them the review will become more visual. Screenshots of correspondence will not pass verification.")}</p>
                        </div>
  

                    </div>

                    <div className={style.buttons}>
                        <div className={style.button} onClick={()=> {setVisibleModalAddComment(false); }}>{text("Send")}</div>
                        <div className={style.button_back} onClick={()=>setVisibleModalAddComment(false)}>{text("Back")}</div>
                    </div>
                </div>
            </div>
            
        </>
    )
}