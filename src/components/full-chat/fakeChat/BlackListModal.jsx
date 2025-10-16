import style from "./blackListModal.module.css"



export default function BlackListModal({ setVisibleBlackList }) {
    return (
        <>
            <div className={style.wrap}>
                <div className={style.block}>
                    <div className={style.close}  onClick={()=>setVisibleBlackList(false)}>
                        <img src="/img/close.svg" alt="" />
                    </div>
                    <h2 className={style.heading}>Черный список</h2>
                    <div className={style.row_td}>
                        <p>Дата</p>
                        <p>Пользователь</p>
                    </div>

                    {[1,2,3].map(_ =>
                        <div className={style.user_ban} >
                            <div className={style.row_button}>
                                <div className={style.button}>Разброкировать</div>
                            </div>
                            <div className={style.data}>
                                <p>15.02.2024 23:13</p>
                                <p>SASsaa2232</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            
        </>
    )
}