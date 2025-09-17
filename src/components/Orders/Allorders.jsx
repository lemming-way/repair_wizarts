import { useState } from "react";
import '../../scss/orders.css'
import '../../scss/swiper.css'
import "swiper/css";
import "swiper/css/navigation";
import { Link } from "react-router-dom";
import SERVER_PATH from "../../constants/SERVER_PATH";
import style from "./Allorders.module.css"

import FilterBlock from "./FilterBlock";
import StatsBlock from "./StatsBlock";
import EmailSettings from "./EmailSettings";
import Dropdown from 'react-bootstrap/Dropdown';
import OnlineDotted from "../onlineDotted/OnlineDotted";
import PaginationPages from "../Settings/PaginationPages";

function App() {

    const [isVisibleEmailSettings, setVisibvleEmailSettings] = useState(false)

    // const requests = useService(getMasterRequests, [])
    // тестовые данные
    const requests = {
        "data": [
            {
                "id": 1,
                title: "Заголовок запроса", // Заголовок
                client: {
                    name: "Имя клиента", // Имя клиента
                    avatar: "profil_img/1.png", // Путь к изображению профиля
                    number_of_submissions: 5 // Количество заказов
                },
                client_price: "1000 ₽" // Цена клиента
            }
        ]
    }

    const [selectValue, setSelectValue] = useState("Все предложения")

    return (
        <>

            {isVisibleEmailSettings ? <EmailSettings setVisibvleEmailSettings={setVisibvleEmailSettings} /> : null}

            <div className="mini-text">
                <h1>Заявки</h1>
            </div>

            <div className={style.top_row}>
                <div>
                    <div className="two-input" style={{ marginRight: 0 }}>
                        <Link to='/master/requests/orders#active'>
                            <div className="myorders">
                                <p>Мои отклики <span>1</span></p>
                            </div>
                        </Link>
                        <Link to='/master/requests'>
                            <div className="myorders">
                                <p>Все заказы </p>
                            </div>
                        </Link>
                    </div>
                </div>
                <div className={style.email_block} onClick={() => setVisibvleEmailSettings(true)}>
                    <img src="/img/email.png" alt="" />
                    <p>настройка Email уведомления</p>
                </div>
            </div>

            <div className={style.main__row}>
                <div className={style.main__column}>
                    <FilterBlock />
                    <StatsBlock />
                </div>

                <div className={style.allorders}>
                    <div className={style.heading__row}>
                        <h1 className={style.heading__h1}>Новое на бирже<span>1 проект за сутки</span> </h1>
                        <div style={{ flex: 1 }}></div>
                        <div className={style.flex_row_select}>
                            <p className={style.heading__p}>Показать</p>

                            <Dropdown>
                                <Dropdown.Toggle variant="success" id="dropdown-basic" className={style.heading__select}>
                                    {selectValue}
                                </Dropdown.Toggle>

                                <Dropdown.Menu>
                                    <Dropdown.Item className={style.select__item} onClick={() => setSelectValue("Все предложения")}>Все предложения</Dropdown.Item>
                                    <Dropdown.Item className={style.select__item} onClick={() => setSelectValue("Новые")}>Новые</Dropdown.Item>
                                    <Dropdown.Item className={style.select__item} onClick={() => setSelectValue("Просмотренные")}>Просмотренные</Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                        </div>
                    </div>


                    <div>
                        <div>
                            <div className={`${style.heading_table}`}>
                                <div className={`fsdfsaooo mobile-big_nav-text_1 ${style.heading_table_row}`}>
                                    <p className="inter">Проект</p>
                                    <div className={style.empty}></div>
                                    <p className="inter">Покупатель</p>
                                    <p className="inter">Цена</p>
                                </div>
                            </div>

                            <div className={`${style.row_order} ${style.first_row}`}>
                                <div className={style.block_title}>
                                    <Link to={"/master/requests/offer"}>
                                        <h3 className={style.heading}>Замена экрана на Iphone 12</h3>
                                    </Link>
                                    <p className={style.text_navigation}>Ремонт телефонов -> Ремонт iphone (50)</p>
                                    <div className={style.row}>
                                        <p>Осталось 2 д</p>
                                        <p>3 предложения </p>
                                    </div>
                                </div>

                                <div className={style.modile_col}>
                                    <div className={style.block_author}>
                                        <Link to={"/master/requests/offer"}>
                                            <div style={{ position: "relative" }}>
                                                <div className={style.dotted_wrap}>
                                                    <OnlineDotted isVisible={true} />
                                                </div>
                                                <img src="/img/profil_img/1.png" alt="" />
                                            </div>
                                        </Link>


                                        <div className={style.col}>
                                            <p>Никнейм</p>
                                            <p>1 проект на сайте </p>
                                            <p>100% нанято </p>
                                        </div>
                                    </div>

                                    <div className={style.block_price}>
                                        <p className={style.price}>1000 ₽</p>
                                        <p className={style.status}>
                                            <img src="/img/icon-confirm.png" alt="" />
                                            Просмотрено
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className={style.row_order}>
                                <div className={style.block_title}>
                                    <Link to={"/master/requests/offer"}>
                                        <h3 className={style.heading}>Замена экрана на Iphone 12</h3>
                                    </Link>
                                    <p className={style.text_navigation}>Ремонт телефонов -> Ремонт iphone (50)</p>
                                    <div className={style.row}>
                                        <p>Осталось 2 д</p>
                                        <p>3 предложения </p>
                                    </div>
                                </div>

                                <div className={style.modile_col}>
                                    <div className={style.block_author}>
                                        <Link to={"/master/requests/offer"}>
                                            <div style={{ position: "relative" }}>
                                                <div className={style.dotted_wrap}>
                                                    <OnlineDotted isVisible={true} />
                                                </div>
                                                <img src="/img/profil_img/1.png" alt="" />
                                            </div>
                                        </Link>
                                        <div className={style.col}>
                                            <p>Никнейм</p>
                                            <p>1 проект на сайте </p>
                                            <p>100% нанято </p>
                                        </div>
                                    </div>

                                    <div className={style.block_price}>
                                        <p className={style.price}>1000 ₽</p>
                                        <p className={style.status}>
                                            <img src="/img/icon-confirm.png" alt="" />
                                            Просмотрено
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* {requests.data.map((v) => (
                                <Link to={"/master/requests/" + v.id} key={v.id}>
                                    <div className="archive-hee sewreqwreqw">
                                        <div className="nav_applications-3 fasfXf nav_applications-3-gee fsdfsaooo big_nav-device df align mobile-nav_applications-3">
                                            <div className="all-requests-title-container">
                                                <h2>{v.title}</h2>
                                            </div>
                                            <div className="client__order">
                                                <img
                                                    // src={SERVER_PATH + v.client?.avatar}
                                                    src="/img/profil_img/1.png"
                                                    alt=""
                                                    width="48px"
                                                    height="48px"
                                                    style={{ objectFit: "cover", borderRadius: "24px" }}
                                                />
                                                <div className="info__client__order">
                                                    <h3 className="inter">{v.client?.name}</h3>
                                                    <p className="inter">
                                                        {v.client?.number_of_submissions} заказ{getEndingOfDigit(v.client?.number_of_submissions)} на сайте
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="all-requests-price-container">
                                                <p>{v.client_price}</p>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))} */}
                        </div>
                    </div>

                    <div className={style.pagination_wrap}>
                        <PaginationPages />
                        <div className={style.select_pages_wrap}>
                            <p className={style.select_pages_wrap}>Показать:</p>
                            <select className={style.select_pages__select} name="" id="">
                                <option value="">10 на странице</option>
                                <option value="">20 на странице</option>
                                <option value="">50 на странице</option>
                            </select>
                        </div>
                    </div>


                </div>



            </div>

        </>
    )
}


export default App;
