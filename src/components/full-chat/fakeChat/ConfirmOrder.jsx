import style from "./ConfirmOrder.module.css"



export default function ConfirmOrder({ setVisibleConfirmOrder, setVisibleConfirmOrderFinal }) {

    return (
        <>
            <div className={style.wrap}>
                <div className={style.block}>
                    <div className={style.close}  onClick={()=>setVisibleConfirmOrder(false)}>
                        <img src="/img/close.svg" alt="" />
                    </div>
                    <p className={style.message}>
                    Вы подтверждаете что заказ успешно выполнен?
                    </p>

                    <div className={style.buttons}>
                        <div className={style.button} onClick={()=>{setVisibleConfirmOrder(false); setVisibleConfirmOrderFinal(true)}}>Да</div>
                        <div className={style.button_back} onClick={()=>setVisibleConfirmOrder(false)}>Нет</div>
                    </div>
                </div>
            </div>
            
        </>
    )
}