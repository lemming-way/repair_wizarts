import style from "./ModalDelete.module.css"



export default function ModalDelete({ setVisibleModalDelete, setVisibleConfirmOrderFinal }) {

    return (
        <>
            <div className={style.wrap}>
                <div className={style.block}>
                    <div className={style.close}  onClick={()=>setVisibleModalDelete(false)}>
                        <img src="/img/close.svg" alt="" />
                    </div>
                    <p className={style.message}>
                        Вы желаете удалить отзыв?
                    </p>

                    <div className={style.buttons}>
                        <div className={style.button} onClick={()=>{setVisibleModalDelete(false)}}>Да</div>
                        <div className={style.button_back} onClick={()=>setVisibleModalDelete(false)}>Нет</div>
                    </div>
                </div>
            </div>
            
        </>
    )
}