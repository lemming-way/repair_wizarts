import style from "./ConfirmOrder.module.css"



export default function CancelOrder_v4({ setVisibleCancelOrder, setVisibleCancelOrderFinal }) {

    return (
        <>
            <div className={style.wrap}>
                <div className={style.block}>
                    <div className={style.close}  onClick={()=>setVisibleCancelOrder(false)}>
                        <img src="/img/close.svg" alt="" />
                    </div>
                    <p className={style.message}>
                    Подтвердить отмену заказа?
                    </p>

                    <div className={style.buttons}>
                        <div className={style.button} onClick={()=>{setVisibleCancelOrder(false); setVisibleCancelOrderFinal(true)}}>Подтверждаю</div>
                        <div className={style.button_back} onClick={()=>{setVisibleCancelOrder(false)}}>Отменить</div>
                    </div>
                </div>
            </div>
            
        </>
    )
}