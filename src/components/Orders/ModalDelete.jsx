import style from "./ModalDelete.module.css"



export default function ModalDelete({ setVisibleDeleteModal }) {

    return (
        <>
            <div className={style.wrap}>
                <div className={style.block}>
                    <div className={style.close}  onClick={()=>setVisibleDeleteModal(false)}>
                        <img src="/img/close.svg" alt="" />
                    </div>
                    <p className={style.message}>Подтверждаете удаление?</p>

                    <div className={style.buttons}>
                        <div className={style.button_back} onClick={()=>setVisibleDeleteModal(false)}>Отмена</div>
                        <div className={style.button} onClick={()=>setVisibleDeleteModal(false)}>Удалить</div>
                    </div>
                </div>
            </div>
            
        </>
    )
}