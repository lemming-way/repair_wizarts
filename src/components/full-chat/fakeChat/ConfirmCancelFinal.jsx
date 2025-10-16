import style from "./ConfirmOrder.module.css"



export default function ConfirmCancelFinal({ setVisibleCancelOrderFinal }) {

    return (
        <>
            <div className={style.wrap}>
                <div className={style.block}>
                    <div className={style.close}  onClick={()=>setVisibleCancelOrderFinal(false)}>
                        <img src="/img/close.svg" alt="" />
                    </div>
                    <p className={style.message}>
                    Заказ успешно выполнен
                    </p>

                    <div className={style.buttons}>
                        <div className={style.button} onClick={()=>setVisibleCancelOrderFinal(false)}>ОК</div>
                    </div>
                </div>
            </div>
            
        </>
    )
}