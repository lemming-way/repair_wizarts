import style from "./ConfirmOrder.module.css"

// todo: Пока кнопка ничего не делает.
// todo: Чаты у нас создаются на основе активных заказов. Нужно продумать, как будет работать удаление чатов.
export default function DeleteChatModal({ setModalVisible }) {
    return (
        <>
            <div className={style.wrap}>
                <div className={style.block}>
                    <div className={style.close} onClick={() => setModalVisible(false)}>
                        <img src="/img/close.svg" alt=""/>
                    </div>
                    <p className={style.message}>
                        Вы действительно хотите удалить чат?
                    </p>

                    <div className={style.buttons}>
                        <div className={style.button} onClick={() => {
                            setModalVisible(false);
                        }}>Подтверждаю
                        </div>
                        <div className={style.button_back} onClick={() => setModalVisible(false)}>Отменить</div>
                    </div>
                </div>
            </div>
        </>
    )
}
