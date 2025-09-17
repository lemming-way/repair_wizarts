import style from "./ModalАrbitration.module.css"



export default function ModalАrbitration({ setVisibleModalArbitation, setVisibleDisputeFinal }) {

    return (
        <>
            <div className={style.wrap}>
                <div className={style.block}>
                    <div className={style.close}  onClick={()=>setVisibleModalArbitation(false)}>
                        <img src="/img/close.svg" alt="" />
                    </div>
                    <p className={style.message}>
                    Обращение в арбитаж
                    </p>

                    <textarea className={style.textarea} rows={4} type="text" placeholder="укажите сообщение" />

                    <div className={style.buttons}>
                        <div className={style.button} onClick={()=>{setVisibleDisputeFinal(true);setVisibleModalArbitation(false)}}>ОК</div>
                    </div>
                </div>
            </div>
            
        </>
    )
}