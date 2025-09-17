import style from "./FinalOrder.module.css"

export default function FinalOrder({ setVisibleFinalOrder }) {

    return (
        <>
            <div className={style.wrap}>
                <div className={style.block}>
                    <div className={style.close}  onClick={()=>setVisibleFinalOrder(false)}>
                        <img src="/img/close.svg" alt="" />
                    </div>
                    <h2 className={style.heading}>Поздравляем, вы завершили заказ</h2>
                    {/* <p className={style.error}>Пожалуйста пополните баланс на 500 рублей</p> */}

                    <div className={style.text}>
                        <p>Колличество заявок на сайте  1</p>
                        <p>Колличество повторных заявок на сайте  1</p>
                        <p>Колличество заказов на сайте  1</p>
                        <p>Колличество повторных заказов на сайте  0</p>
                        <p>Колличество открытых споров 0 </p>
                    </div>

                    <div className={style.buttons}>
                        <div className={style.button} onClick={()=>setVisibleFinalOrder(false)}>ОК</div>
                    </div>
                </div>
            </div>
            
        </>
    )
}