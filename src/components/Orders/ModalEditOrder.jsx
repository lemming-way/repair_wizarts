import style from "./ModalEditOrder.module.css"

export default function ModalEditOrder({ setVisibleModalEdit }) {
    return (
        <>
            <div className={style.wrap}>
                <div className={style.block}>
                    <div className={style.close}  onClick={()=>setVisibleModalEdit(false)}>
                        <img src="/img/close.svg" alt="" />
                    </div>
                    <h2>Изменить название</h2>
                    <p className={style.message}>Новое название будет видно только вам</p>

                    <textarea className={style.textarea} name="" placeholder="название" rows={4} id=""></textarea>
 
                    <div className={style.buttons}>
                        <div className={style.button} onClick={()=>{setVisibleModalEdit(false)}}>Сохранить</div>
                    </div>
                </div>
            </div>
            
        </>
    )
}