import style from "./ConfirmOrder.module.css"


export default function DeleteChatModal({ setVisibleBlackList }) {
    return (
        <>
            <div className={style.wrap}>
                <div className={style.block}>
                    <div className={style.close} onClick={() => setVisibleBlackList(false)}>
                        <img src="/img/close.svg" alt=""/>
                    </div>
                    <p className={style.message}>
                        Вы дейстивтельно хотите удалить чат?
                    </p>

                    <div className={style.buttons}>
                        <div className={style.button} onClick={() => {
                            setVisibleBlackList(false);
                        }}>Подтверждаю
                        </div>
                        <div className={style.button_back} onClick={() => setVisibleBlackList(false)}>Отменить</div>
                    </div>
                </div>
            </div>

        </>
    )
}