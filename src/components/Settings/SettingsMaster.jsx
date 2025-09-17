import { useEffect, useState, useRef } from "react";
import { updateUserPhoto, updateUser } from "../../services/user.service";
import { useDispatch, useSelector } from "react-redux";
import { selectUser } from "../../slices/user.slice";
import '../../scss/settings-all.css'
import Sidebar from "../sidebar";
import "swiper/css";
import "swiper/css/navigation";
import SettingNav from "./Setting-nav";
import VerificationInput from "../VerificationInput";
import { Link, useNavigate } from "react-router-dom";
import { selectUI, setAuthorization } from "../../slices/ui.slice";
import { deleteUser } from "../../services/user.service";
import Popup from "reactjs-popup";
import SERVER_PATH from "../../constants/SERVER_PATH";
import Navigation from './Navigation';
import MasterProfileNavigator from "../full-height/MasterProfileNavigator";
import style from "./SettingsMaster.module.css"
import { Outlet } from "react-router-dom";


export default function SettingsMaster() {

    const dispatch = useDispatch()
    const navigate = useNavigate()
    const inputRef = useRef(null)

    const [deleteAccount, setDeleteAccount] = useState(false)
    const [suceeded, setSuceeded] = useState(false)
    const [error, setError] = useState("данные сохранились")
    const user = useSelector(selectUser)
    const ui = useSelector(selectUI)

    const [mask_value, setMask_value] = useState("+7(9")

    const [form, setForm] = useState({
        phone: "+7(9",
        email: "",
        availability_from: "00:00:00",
        availability_to: "00:00:00",
        status: "",
        mailing: false,
        is_active: false
    })


    function correctPhoneNumder (e) {
        var text = e.target.value

        // стирание
        if (text.length < mask_value.length) {
            var new_text = text
            if (new_text.length < 4) {
                new_text = "+7(9"
            }
        }
        // +7(988)-842-44-44
        else if (text.length == 6) {
            var new_text = text + ")-"
        }
        else if (text.length == 7) {
            var new_text = text.slice(0, -1) + ')-' + text.slice(-1);
        }
        else if (text.length == 8) {
            var new_text = text.slice(0, -1) + '-' + text.slice(-1);
        }
        else if (text.length == 11) {
            var new_text = text + "-" 
        }
        else if (text.length == 12) {
            var new_text = text.slice(0, -1) + '-' + text.slice(-1);
        }
        else if (text.length == 14) {
            var new_text = text + "-"
        }
        else if (text.length == 15) {
            var new_text = text.slice(0, -1) + '-' + text.slice(-1);
        }
        else if (text.length > 17) {
            var new_text = text.slice(0,17)
        }
        else {
            var new_text = text
        }

        setMask_value(new_text)
    }

    
    const getFormAttrs = (field) => {
        const attrs = { }

        attrs.value = form[field]
        attrs.onChange = (e) => correctPhoneNumder(e)

        return attrs
    }

    const onSubmit = (e) => {
        e.preventDefault()
        updateUser(form, user.id)
            .then(() => { setSuceeded(true); setError("") })
            .catch((err) => { setError(err.message); setSuceeded(false) })
    }

    const onProfilePicUpdate = async (e) => {
        e.preventDefault()
        const file = inputRef.current.files[0]

        if (file) {
            return updateUserPhoto(file, user.id)
                .then(() => { setSuceeded(true); setError("") })
                .catch((err) => { setError(err.message); setSuceeded(false) })
        }
    }
    
    const onDelete = (e) => {
        e.preventDefault()
        return deleteUser().then(() => {
            dispatch(setAuthorization(false))
            navigate("/")
        })
    }

    useEffect(() => {
        if (ui.isAuthorized) {
            const master = user.master[0]
            const obj = {
                phone: user.phone,
                email: user.email,
                availability_from: master.availability_from || form.availability_from,
                availability_to: master.availability_to || form.availability_to,
                status: master.status || "",
                mailing: master.mailing,
                is_active: master.is_active
            }
            setForm(obj)
        }
    }, [ui])
    useEffect(() => {
        document.title = 'Настройки';
    }, []);

    const [availability_from, setAvailability_from] = useState("")
    const [availability_to, setAvailability_to] = useState("")

    return (
        <>
                    <div className={`mini-main df ${style.form_wrap_flex}`}>
                        <form onSubmit={onSubmit}>
                            <div className={`input-wrap ${style.form}`}>
                                {suceeded && (
                                    <div className="succeed-v">
                                        Данные успешно обновлены
                                    </div>
                                )}
                                {error && (
                                    <div className={`auth-err ${style.error}`}>
                                        {error}
                                    </div>
                                )}


                                <input defaultValue={user?.master?.[0]?.username} disabled placeholder="Логин" />
                                <div className="height">
                                   <VerificationInput isConfirmed={user.is_phone_verified} {...getFormAttrs('phone')} mask_value={mask_value} onChangeMask={correctPhoneNumder} />
                                </div>
                                <VerificationInput isEmail isConfirmed={user.is_email_verified} {...getFormAttrs('email')} />
                                <div className="height">
                                    <input type="text" placeholder="Новый пароль"/>
                                    {/* <img src="/img/img-eye.png" alt="" className="eye img"/> */}
                                </div>
                                <div className="height">
                                    <input type="text" placeholder="Подтверждение пароля"/>
                                    {/* <img src="/img/img-almost-eye.png" alt="" className="almost-eye img" /> */}
                                </div>
                                <input type="time" style={{paddingRight: "10px"}} placeholder="Со скольки времени Вы на связи" value={availability_from} onChange={(e)=> setAvailability_from(e.target.value)} />
                                <input type="time" style={{paddingRight: "10px"}} placeholder="До скольки времени Вы на связи" value={availability_to} onChange={(e)=> setAvailability_to(e.target.value)} />
                                <input type="text" placeholder="Статус не более 40 символов" {...getFormAttrs('status')} />
                                <label className="checkbox">
                                    <input
                                        type="checkbox"
                                        checked={form.mailing}
                                        onChange={(e) => setForm((prev) => ({ ...prev, mailing: e.target.checked }))}
                                    />
                                    Email-рассылка
                                </label>
                                <label className="checkbox">
                                    <input
                                        type="checkbox"
                                        checked={form.is_active}
                                        onChange={(e) => setForm((prev) => ({ ...prev, is_active: e.target.checked }))}
                                    />
                                    Получать заказы
                                </label>
                                <div className={style.buttons_row}>
                                    <button type="submit" className="goooSaveButton">Сохранить</button>
                                    <button type="button" style={{backgroundColor: "unset", color: "#D9573B"}} className="goooSaveButton" onClick={() => setDeleteAccount(true)}>Удалить аккаунт</button>
                                    <Popup
                                        open={deleteAccount}
                                        onClose={() => setDeleteAccount(false)}
                                        className="delete-modal"
                                    >
                                        <h3 className="delete-modal__title">Подтвердите удаление аккаунта</h3>
                                        <p className="delete-modal__info">Ваши данные будут стерты</p>
                                        <div className="delete-modal__actions">
                                            <button className="delete-modal__button" style={{backgroundColor: "unset", border: "1px solid gray", color: "black"}} onClick={() => setDeleteAccount(false)}>Отмена</button>
                                            <button className="delete-modal__button" onClick={onDelete}>подтвердить удаление</button>
                                        </div>
                                    </Popup>
                                </div>
                            </div>
                        </form>

                        <div className={`photo-wrap ${style.photo_wrap}`}>
                            <label htmlFor="prifielLogoUpload">
                                <img
                                    src={user.avatar ? SERVER_PATH + user.avatar : "/img/img-camera.png"}
                                    alt=""
                                    className="settings-picture"
                                />
                            </label>
                            <form onSubmit={onProfilePicUpdate}>
                                <input
                                    type="file"
                                    accept="image/png, image/jpeg"
                                    style={{display: "none"}}
                                    className='prifielUpload'
                                    id="prifielLogoUpload"
                                    ref={inputRef}
                                />
                                <div className="links">
                                    <button className="link-4">Изменить</button>
                                </div>
                            </form>
                            
                        </div>
                </div>
        </>
    )
}