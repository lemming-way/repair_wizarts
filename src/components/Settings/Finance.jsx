import { useEffect, useRef, useState } from "react"
import { useSelector } from "react-redux"
import { Link } from "react-router-dom"
import { selectUser } from "../../slices/user.slice"
import Sidebar from "../sidebar"
import { updateMasterPictures } from "../../services/user.service"
import SERVER_PATH from "../../constants/SERVER_PATH"
import Navigation from "./Navigation"
import style from "./finance.module.css"
import ModalConfirm from "./ModalConfirm"
import ModalSuccess from "./ModalSuccess"
import ModalDelete from "./ModalDelete"

const Finance = (props) => {
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

    const [isVisibleConfirm, setVisibleConfirm] = useState(false)
    const [isVisibleSuccess, setVisibleSuccess] = useState(false)
    const [isVisibleDelete, setVisibleDelete] = useState(false)

    return (
        <>
            {isVisibleConfirm ? <ModalConfirm setVisibleConfirm={setVisibleConfirm} setVisibleSuccess={setVisibleSuccess} />  : null}
            {isVisibleSuccess ? <ModalSuccess setVisibleSuccess={setVisibleSuccess} />  : null}
            {isVisibleDelete ? <ModalDelete setVisibleDelete={setVisibleDelete} />  : null}

                <div className={style.main}>
                    <div className={style.alert}>Данные кошелька сохранены</div>

                    <div className={style.payment_block}>
                        <p className={style.name}>Банковская карта</p>
                        <div className={style.payment_block__row}>
                            <img src="/img/visa.png" alt="" />
                            <input className={style.payment_block__input} type="text" />
                        </div>
                    </div>

                    <div className={style.payment_block}>
                        <p className={style.name}>Webmoney</p>
                        <div className={style.payment_block__row}>
                            <img src="/img/webmoney.png" alt="" />
                            <input className={style.payment_block__input} type="text" />
                        </div>
                    </div>

                    <div className={style.payment_block}>
                        <p className={style.name}>Банковская карта</p>
                        <div className={style.payment_block__row}>
                            <img src="/img/visa.png" alt="" />
                            <div className={style.column}>
                                <p className={style.payment__secret}>2202 20** **** 0719</p>
                                <div className={style.row_link}>
                                    <button className={style.btn_link}>Изменить</button>
                                    <button className={style.btn_link} onClick={()=> setVisibleDelete(true)}>Удалить</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={style.payment_block}>
                        <p className={style.name}>Webmoney</p>
                        <div className={style.payment_block__row}>
                            <img src="/img/webmoney.png" alt="" />
                            <div className={style.column}>
                                <p className={style.payment__secret}>Z7*******3528</p>
                                <div className={style.row_link}>
                                    <button className={style.btn_link}>Изменить</button>
                                    <button className={style.btn_link} onClick={()=> setVisibleDelete(true)}>Удалить</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <button className="master-settings-pics__button" onClick={()=> setVisibleConfirm(true)}>Сохранить кошельки</button>

        </>
    )
}

export default Finance
