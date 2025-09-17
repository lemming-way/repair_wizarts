import style from "./DisputeFinal.module.css"



export default function DisputeFinalModal_v5({ setVisibleDisputeFinal, setOpenDispute }) {

    return (
        <>
            <div className={style.wrap}>
                <div className={style.block}>
                    <div className={style.close}  onClick={()=>setVisibleDisputeFinal(false)}>
                        <img src="/img/close.svg" alt="" />
                    </div>
                    <p className={style.message}>
                        Ожидайте ответа в тех поддержки в течение 24 часов 
                    </p>

                    <div className={style.buttons}>
                        <div className={style.button} onClick={()=>{setVisibleDisputeFinal(false);setOpenDispute(true)}}>ОК</div>
                    </div>
                </div>
            </div>
            
        </>
    )
}