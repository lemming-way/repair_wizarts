import style from "./AddOrderModal.module.css"



export default function AddOrderModal({ setVisibleAddOrder, setVisibleOkModal }) {
    return (
        <>
            <div className={style.wrap}>
                <div className={style.block}>
                    <div className={style.close}  onClick={()=>setVisibleAddOrder(false)}>
                        <img src="/img/close.svg" alt="" />
                    </div>
                    <h2 className={style.heading}>Предложить заказ</h2>
                    <p className={style.error}>Пожалуйста пополните баланс на 500 рублей</p>
                    <div><input className={style.input_heading} type="text" placeholder="Заголовок" /></div>
                    
                    <div style={{position: "relative"}}>
                        <p className={style.textarea_description}>2000 символов, мин 100</p>
                        <textarea className={style.textarea} name="" rows={8} id="" placeholder="Напишите, что требуется выполнить"></textarea>
                    </div>
                    
                    <div className={style.row1}>
                        <div>
                            <p className={style.mini_heading}>Бюджет</p>
                            <p className={style.balance}>Баланс 0 ₽</p>
                            <div className={style.icon}>
                                <input className={style.input_balance} type="text" placeholder="500 - 20000" />
                            </div>
                        </div>
                        <div style={{position: "relative"}}>
                            <img className={style.icon2} src="/img/icons/clock.png" alt="" />
                            <p className={style.mini_heading}>Срок</p>
                            <select name="" id="" className={style.select}>
                                <option value="" disabled >Выберите</option>
                                <option value="">Готов ждать</option>
                                <option value="">1 час</option>
                                <option value="">2 часа</option>
                                <option value="">3 часа</option>
                                <option value="">4 часа</option>
                                <option value="">6 часов</option>
                                <option value="">8 часов</option>
                                <option value="">24 часа</option>
                                <option value="">3 дня</option>
                                <option value="">7 дней</option>
                            </select>
                        </div>
                    </div>
                    <div className={style.block_photo}>
                        <p className={style.heading_h3}>Добавить фотографии</p>
                        <div className={style.add_photo}>
                            <img src="/img/icons/camera.png" alt="" />    
                        </div>    
                    </div>

                    <div className={style.buttons}>
                        <div className={style.button} onClick={()=> {setVisibleAddOrder(false); setVisibleOkModal(true)}}>Отправить</div>
                        <div className={style.button_back} onClick={()=>setVisibleAddOrder(false)}>Назад</div>
                    </div>
                </div>
            </div>
            
        </>
    )
}