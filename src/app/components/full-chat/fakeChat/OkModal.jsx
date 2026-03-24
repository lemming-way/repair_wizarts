import style from "./ConfirmOrder.module.css"


export default function BlockUser({ setModalVisible }) {
    return (
        <>
            <div className={style.wrap}>
                <div className={style.block}>
                    <div className={style.close} onClick={() => setModalVisible(false)}>
                        <img src="/img/close.svg" alt=""/>
                    </div>
                    <p className={style.message}>
                        Вы успешно создали заказ
                    </p>

                    <div className={style.buttons}>
                        <div className={style.button} onClick={() => {
                            setModalVisible(false);
                        }}>Ок
                        </div>
                    </div>
                </div>
            </div>

        </>
    )
}
