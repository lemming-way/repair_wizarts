import style from "./Dispute.module.css"



export default function DisputeModal({ setVisibleDispute, setVisibleDisputeFinal }) {

    return (
        <>
            <div className={style.wrap}>
                <div className={style.block}>
                    <div className={style.close}  onClick={()=>setVisibleDispute(false)}>
                        <img src="/img/close.svg" alt="" />
                    </div>
                    <h2 className={style.heading}>Открытие спора </h2>

                    <div className={style.textarea_wrap}>
                        <textarea rows={8} className={style.textarea} name="" id="" placeholder="Опишите вашу проблему, ваш заказ переместится в техническую поддержку"></textarea>
                    </div>

                    <div className={style.buttons}>
                        <div className={style.button} onClick={()=>{setVisibleDispute(false);setVisibleDisputeFinal(true)}}>Отправить</div>
                        <div className={style.add_photo}>
                            <img src="/img/icons/camera.png" alt="" />    
                        </div>  
                    </div>
                </div>
            </div>
            
        </>
    )
}