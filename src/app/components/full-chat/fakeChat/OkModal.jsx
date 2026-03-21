import style from "./ConfirmOrder.module.css"


export default function BlockUser({ setVisibleBlackList }) {
    return (
        <>
            <div className={style.wrap}>
                <div className={style.block}>
                    <div className={style.close} onClick={() => setVisibleBlackList(false)}>
                        <img src="/img/close.svg" alt=""/>
                    </div>
                    <p className={style.message}>
                        Вы успешно создали заказ
                    </p>

                    <div className={style.buttons}>
                        <div className={style.button} onClick={() => {
                            setVisibleBlackList(false);
                        }}>Ок
                        </div>
                    </div>
                </div>
            </div>

        </>
    )
}