import { useEffect, useState } from "react";
import { useService } from "../../hooks/useService";
import { getMasterOrders } from "../../services/order.service";
import '../../scss/applications.css'
import NavApplication from './NavApplication'
import Application from "./Application";
import style from "./applications.module.css"
import MiniSlider from "../miniSlider/MiniSilder";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";
import { useNavigate } from "react-router-dom";

function MyApplications() {
    const navigator = useNavigate()
    const orders = useService(getMasterOrders, [])
    const filteredOrders = orders.data.filter((v) => v.status === "Активно")

    // test
    // const filteredOrders = [
    //     {
    //         "id": 1,
    //         "order_id": "test",
    //         "client_price": "test",
    //         "client_id": "test",
    //         "repairs": ["test1", "test2"],
    //         "created_at": "test",
    //         "client_message": "test",
    //         "status": "статус"
    //     }
    // ]

    const test_orders = [
        {
            orderid: 1,
            clientprice: 250.00,
            clientid: 101,
            repairs: [{"name": 'Замена масла'}, {"name": 'Проверка тормозов'}],
            createdat: '2023-10-01T10:00:00Z',
            clientmessage: 'Пожалуйста, позвоните перед выполнением работ.',
            status: 'Ожидание'
        },
        {
            orderid: 2,
            clientprice: 150.50,
            clientid: 102,
            repairs: ['Ремонт подвески'],
            createdat: '2023-10-02T12:30:00Z',
            clientmessage: 'Нужна срочная замена деталей.',
            status: 'В процессе'
        },
        {
            orderid: 3,
            clientprice: 75.00,
            clientid: 103,
            repairs: ['Замена стекла'],
            createdat: '2023-10-03T14:15:00Z',
            clientmessage: 'Работы должны быть выполнены не позже завтрашнего дня.',
            status: 'Завершено'
        },
        {
            orderid: 4,
            clientprice: 300.00,
            clientid: 104,
            repairs: ['Полная диагностика', 'Замена аккумулятора'],
            createdat: '2023-10-04T09:00:00Z',
            clientmessage: 'Пожалуйста, проверьте все компоненты.',
            status: 'Ожидание'
        },
        {
            orderid: 5,
            clientprice: 120.00,
            clientid: 105,
            repairs: ['Ремонт кузова'],
            createdat: '2023-10-05T11:45:00Z',
            client_message: 'Работы требуются срочно из-за ДТП.',
            status: 'В процессе'
        }
    ];

    useEffect(() => {
        document.title = 'Заявки';
    }, [])

    const [inputChat, setInputChat] = useState("")
    const [isVisibleEmoji, setVisibleEmoji] = useState(false)

    function addEmojiToMessage(emoji: EmojiClickData) {
        setInputChat((prevMessage) => prevMessage + emoji.emoji);
    }

    return (
        <>
                <div className="mini-text">
                    <h1>Заявки</h1>
                </div>
                <NavApplication />
                
                <div className={style.empty_orders}>
                    <img src="/img/robot.png" alt="" />
                    <p className={style.heading}>У вас пока нет заявок</p>
                    <p>Оформленные заявки отобразятся на этой странице! </p>
                </div>

                <div className={style.orders}>
                    
                    <details className={style.details}>
                        <summary className={style.summary}>
                            <div className={style.summary_row}>
                                <p>Виктория Синицина</p>
                                <p>15.12.2021</p>
                            </div>
                            <div className={style.summary_row}>
                                <p>Диагностика IPhone 11 Pro Max</p>
                                <p>Стоимость: <span className={style.price}>1 500₽</span></p>
                            </div>
                            <div className={style.summary_row}>
                                <div className={`${style.status} ${style.status_in_progress}`}>в процессе</div>
                                <div className={style.flex_empty}></div>
                                <div className={style.miniSwiperWrap}>
                                    <div className="miniSlider">
                                        <img style={{width: "40px"}} src="/img/sentence_img/iphone-x.png" alt="" />
                                    </div>
                                </div>
                                <div>
                                    <img className={style.arrow} src="/img/bot.png" alt="" />
                                </div>
                            </div>
                        </summary>
                        <div className={style.details_body}>
                            <p className={style.name_heading}>Виктория Синицина</p>
                            <p className={style.text}>Lorem ipsum dolor, sit amet consectetur adipisicing elit. Assumenda a impedit neque odio sapiente maiores iure, ea natus veniam enim nostrum. Quasi alias, laboriosam non expedita error rerum voluptate? Consequatur.</p>
                            {/* <div className={style.alert}>чтобы взять новую заявку, пожалуйста подтвердите предыдущую которая в чате </div> */}
                            <div className={style.alert}>Пожалуйста пополните баланс на 150 рублей </div>
                            <div className={style.chat_wrap}>
                                {isVisibleEmoji ?
                                    <div className={style.emoji_pos}>
                                        <EmojiPicker onEmojiClick={addEmojiToMessage} />
                                    </div>
                                : null }
                                <input className={style.input_chat} value={inputChat} onChange={(event) => setInputChat(event.target.value)} placeholder="Сообщение..." type="text" />
                                <img className={style.skrepka} src="/img/screpka.png" alt="" />
                                <img className={style.smile} src="/img/smile.png" onClick={()=> setVisibleEmoji(prev => !prev)} alt="" />
                            </div>
                            <div className={style.buttons_row}>
                                <div className={style.buttons}>
                                    <button className={style.button} onClick={()=>navigator("/master/chat/168789461")}>Согласиться</button>
                                    <button className={style.button_back}>Отказаться</button>
                                </div>
                                {/* <div style={{flex:1}}></div> */}
                                <div className={style.timing_row}>
                                    <p>Выставить время</p>
                                    <select  className={style.select} name="" id="">
                                        <option value="" disabled >Выберите</option>
                                        <option value="">Готов выехать</option>
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
                        </div>
                    </details>


                    <details className={style.details}>
                        <summary className={style.summary}>
                            <div className={style.summary_row}>
                                <p>Виктория Синицина</p>
                                <p>15.12.2021</p>
                            </div>
                            <div className={style.summary_row}>
                                <p>Диагностика IPhone 11 Pro Max</p>
                                <p>Стоимость: <span className={style.price}>1 500₽</span></p>
                            </div>
                            <div className={style.summary_row}>
                                <div className={`${style.status} ${style.status_green}`}>в процессе</div>
                                <div className={style.flex_empty}></div>
                                <div className={style.miniSwiperWrap}>
                                    <MiniSlider />
                                </div>
                                <div>
                                    <img className={style.arrow} src="/img/bot.png" alt="" />
                                </div>
                            </div>
                        </summary>
                        <div className={style.details_body}>
                            <p className={style.name_heading}>Виктория Синицина</p>
                            <p className={style.text}>Lorem ipsum dolor, sit amet consectetur adipisicing elit. Assumenda a impedit neque odio sapiente maiores iure, ea natus veniam enim nostrum. Quasi alias, laboriosam non expedita error rerum voluptate? Consequatur.</p>
                            <div className={style.alert}>чтобы взять новую заявку, пожалуйста подтвердите предыдущую которая в чате </div>
                            <div className={style.alert}>Пожалуйста пополните баланс на 150 рублей </div>
                            <div className={style.chat_wrap}>
                                {isVisibleEmoji ?
                                    <div className={style.emoji_pos}>
                                        <EmojiPicker onEmojiClick={addEmojiToMessage} />
                                    </div>
                                : null }
                                <input className={style.input_chat} value={inputChat} onChange={(event) => setInputChat(event.target.value)} placeholder="Сообщение..." type="text" />
                                <img className={style.skrepka} src="/img/screpka.png" alt="" />
                                <img className={style.smile} src="/img/smile.png" onClick={()=> setVisibleEmoji(prev => !prev)} alt="" />
                            </div>
                            <div className={style.buttons_row}>
                                <div className={style.buttons}>
                                    <button className={style.button} onClick={()=>navigator("/master/chat/168789461")}>Согласиться</button>
                                    <button className={style.button_back}>Отказаться</button>
                                </div>
                                {/* <div style={{flex:1}}></div> */}
                                <div className={style.timing_row}>
                                    <p>Выставить время</p>
                                    <select className={style.select} name="" id="">
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
                        </div>
                    </details>

                    <details className={style.details}>
                        <summary className={style.summary}>
                            <div className={style.summary_row}>
                                <p>Виктория Синицина</p>
                                <p>15.12.2021</p>
                            </div>
                            <div className={style.summary_row}>
                            <p>Диагностика IPhone 11 Pro Max</p>
                                <p>Стоимость: <span className={style.price}>1 500₽</span></p>
                            </div>
                            <div className={style.summary_row}>
                                <div className={`${style.status} ${style.status_stop}`}>в процессе</div>
                                <div className={style.flex_empty}></div>
                                <div className={style.miniSwiperWrap}>
                                    <MiniSlider />
                                </div>
                                <div>
                                    <img className={style.arrow} src="/img/bot.png" alt="" />
                                </div>
                            </div>
                        </summary>
                        <div className={style.details_body}>
                            <p className={style.name_heading}>Виктория Синицина</p>
                            <p className={style.text}>Lorem ipsum dolor, sit amet consectetur adipisicing elit. Assumenda a impedit neque odio sapiente maiores iure, ea natus veniam enim nostrum. Quasi alias, laboriosam non expedita error rerum voluptate? Consequatur.</p>
                            <div className={style.alert}>чтобы взять новую заявку, пожалуйста подтвердите предыдущую которая в чате </div>
                            <div className={style.alert}>Пожалуйста пополните баланс на 150 рублей </div>
                            <div className={style.chat_wrap}>
                                {isVisibleEmoji ?
                                    <div className={style.emoji_pos}>
                                        <EmojiPicker onEmojiClick={addEmojiToMessage} />
                                    </div>
                                : null }
                                <input className={style.input_chat} value={inputChat} onChange={(event) => setInputChat(event.target.value)} placeholder="Сообщение..." type="text" />
                                <img className={style.skrepka} src="/img/screpka.png" alt="" />
                                <img className={style.smile} src="/img/smile.png" onClick={()=> setVisibleEmoji(prev => !prev)} alt="" />
                            </div>
                            <div className={style.buttons_row}>
                                <div className={style.buttons}>
                                    <button className={style.button} onClick={()=>navigator("/master/chat/168789461")}>Согласиться</button>
                                    <button className={style.button_back}>Отказаться</button>
                                </div>
                                {/* <div style={{flex:1}}></div> */}
                                <div className={style.timing_row}>
                                    <p>Выставить время</p>
                                    <select className={style.select} name="" id="">
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
                        </div>
                    </details>

                </div>

            <div className="so_3">
                {/* {filteredOrders?.map((v) => ( */}
                {test_orders.map(v => (
                    <Application
                        {...v}
                        order_id={v.id}
                        key={v.id}
                        status={v.status}
                    />
                ))}
                </div>
        </>
    )
}


export default MyApplications;
