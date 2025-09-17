import style from "./ModalConfirmDelete.module.css"



export default function ModalConfirmDelete({ setVisibleAddFeedback, setStatus, StatusEnum }) {

    return (
        <>
            <div className={style.wrap}>
                <div className={style.block}>
                    <div className={style.close}  onClick={()=>setVisibleAddFeedback(false)}>
                        <img src="/img/close.svg" alt="" />
                    </div>
                    <h2 className={style.heading}>Подтверждение удаления</h2>

                    <p className={style.text}>
                    Вы подтверждаете остановку проекта? Продавцы не смогут больше добавлять в него свои предложения. </p>


                    <div className={style.buttons}>
                        <div className={style.button} onClick={()=> {setVisibleAddFeedback(false); setStatus(StatusEnum.PAUSED)}}>Остановить</div>
                        <div className={style.button_back} onClick={()=>setVisibleAddFeedback(false)}>Отмена</div>
                    </div>
                </div>
            </div>
            
        </>
    )
}