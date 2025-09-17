import { useEffect, useRef, useState } from "react"
import { useSelector } from "react-redux"
import { Link } from "react-router-dom"
import { selectUser } from "../../slices/user.slice"
import Sidebar from "../sidebar"
import { updateMasterPictures } from "../../services/user.service"
import SERVER_PATH from "../../constants/SERVER_PATH"
import Navigation from "./Navigation"
import style from "./Balance.module.css"
import ModalConfirm from "./ModalConfirm"
import ModalSuccess from "./ModalSuccess"
import ModalDelete from "./ModalDelete"
import ModalVivod from "../ChoiceOfReplenishmentMethod/ModalVivod"

import Pagination from 'react-bootstrap/Pagination';
import PaginationPages from "./PaginationPages"

const Balance = (props) => {

    const [isVisibleModalVivod, setInputModalVivod] = useState(false)



    const user = useSelector(selectUser)
    const userPictures = user.master?.[0]?.pictures
        .filter((v) => v !== "")
    const [pics, setPics] = useState([])

    useEffect(() => {
        if (user.master) {
            setPics(userPictures)
        }
    }, [user])

    const pictureInputRef = useRef(null)

    const onSubmit = (e) => {
        e.preventDefault()
        const files = [
            ...pictureInputRef.current.files,
            ...pics
        ]
        return updateMasterPictures(user.id, files).then((v) => {
            const filename = pictureInputRef.current.files[0]?.name

            console.log(v)

            if (filename) {
                setPics((prev) => [...prev, "files/" + filename])
                pictureInputRef.current.value = null
            }
        })
    }

    const getDeleteHandle = (name) => (e) => {
        e.preventDefault()
        return updateMasterPictures(
            user.id,
            pics.filter((v) => v !== name),
        ).then(() => {
            setPics((prev) => prev.filter((v => v !== name)))
        })
    }

    let active = 1;

    const [isVisibleRow, setVisibleRow] = useState(false)
    const [inputCard, setInputCard] = useState("2202 20** **** 0719")
    const [inputPrice, setInputPrice] = useState("100 001.53")

    // const [isVisibleConfirm, setVisibleConfirm] = useState(false)
    // const [isVisibleSuccess, setVisibleSuccess] = useState(false)

    return (
        <>
            {isVisibleModalVivod ? <ModalVivod setInputModalVivod={setInputModalVivod} /> : null}

            {/* {isVisibleConfirm ? <ModalConfirm setVisibleConfirm={setVisibleConfirm} setVisibleSuccess={setVisibleSuccess} /> : null}
            {isVisibleSuccess ? <ModalSuccess setVisibleSuccess={setVisibleSuccess} /> : null} */}

            <div className={style.main}>
                <h3 className={style.heading}>Баланс</h3>

                <div className={style.wrap_row1}>
                    <p className={style.balance}>100 000.51</p>

                    {!isVisibleRow ?
                        <>
                            <div style={{ flex: 1 }}></div>
                            <div className={style.buttons_row}>
                                <button className={style.button}>Пополнить баланс</button>
                                <button className={style.button_back} onClick={() => setVisibleRow(true)}>Вывести средства</button>
                            </div>

                        </>
                        : null}

                    {isVisibleRow ?
                        <div className={style.wrap_row1__row}>
                            <select className={style.select} name="" id="">
                                <option value="">Банковская карта</option>
                                <option value="">Qiwi</option>
                            </select>
                            <input className={style.input_date} style={{ cursor: "text" }} type="text" value={inputCard} onChange={(event) => setInputCard(event.target.value)} />
                            <input className={style.input_date} style={{ cursor: "text" }} type="text" value={inputPrice} onChange={(event) => setInputPrice(event.target.value)} />
                            <button className={style.button} onClick={() => setInputModalVivod(true)}>Вывести</button>
                            <button className={style.button_back} onClick={() => setVisibleRow(false)}>Отменить</button>
                        </div>
                        : null}
                </div>

                <div className={style.wrap_row2}>
                    <input className={style.input_date} type="date" />
                    <input className={style.input_date} type="date" />
                    <select className={style.select} name="" id="">
                        <option value="">Все операции</option>
                        <option value="">Пополнение</option>
                        <option value="">Возврат оплаты заказа</option>
                        <option value="">Пополнение баланса</option>
                        <option value="">Списание</option>
                        <option value="">Оплата заказов</option>
                        <option value="">Оплата заявок</option>
                    </select>
                </div>

                <div className={style.wrap_row3}>
                    <p>Дата</p>
                    <p className={style.decr_width}>Списание</p>
                    <p>Сумма</p>
                    <p>Статус</p>
                </div>

                {/* <div className={style.order_row}>
                    <p>30 августа, 13:00</p>
                    <p className={style.decr_width}>Замена экрана на Iphone 15</p>
                    <p>100 001.53 ₽</p>
                    <div>
                        <div className={style.status}>Выполнен</div>
                    </div>
                </div> */}

                <div className={style.order_row_v2}>
                    <p><span style={{whiteSpace: "nowrap"}}>30 августа,</span> 13:00</p>
                    <p className={style.decr_width}>Замена экрана на Iphone 15</p>
                    <p className={style.table__price}>100 001.53 ₽</p>
                    <div>
                        <div className={style.status}>Выполнен</div>
                    </div>
                </div>          

                {/* <div style={{ flex: 1 }}></div> */}

                <div className={style.pagination_wrap}>
                    {/* <Pagination style={{margin: 0}}>
                        {[1, 2, 3, 4, 5].map(number =>
                            <Pagination.Item key={number} active={number === active} style={{ backgroundColor: "unset" }}>
                                {number}
                            </Pagination.Item>
                        )}
                    </Pagination> */}

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
        </>
    )
}

export default Balance
