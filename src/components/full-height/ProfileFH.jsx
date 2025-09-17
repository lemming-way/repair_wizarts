import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { selectUser } from "../../slices/user.slice";
import { updateUser } from "../../services/user.service";
import VerificationInput from "../VerificationInput";
import { Link, useNavigate } from "react-router-dom";
import style from "./ProfileFH.module.css"
import ClientProfileNavigator from "./ClientProfileNavigator";

function ProfileFH() {
    const user = useSelector(selectUser)
    const navigate = useNavigate()

    const listLinks = [
        "/client/settings",
        "/client/settings/picture",
        "/client/settings/wallet",
        "/client/settings/finance",
        "/client/settings/balance",
    ]

    const [succeeded, setSucceeded] = useState(false)
    const [error, setError] = useState("")
    const [form, setForm] = useState({
        name: "",
        lastname: "",
        phone: "",
        email: "",
    })

    const getFormAttrs = (field) => {
        const attrs = { }

        attrs.value = form[field]
        attrs.onChange = (e) =>
            setForm((prev) => ({ ...prev, [field]: e.target.value }))

        return attrs
    }

    const onSubmit = (e) => {
        e.preventDefault()
        updateUser(form, user.id)
            .then(() => { setSucceeded(true); setError("") })
            .catch((err) => { setSucceeded(false); setError(err.message) })
    }

    useEffect(() => {
        if (user.name) {
            const obj = { }
            
            for (const key of Object.keys(form)) obj[key] = user[key]

            setForm(obj)
        }
    }, [user])
    useEffect(() => {
        document.title = 'Настройки';
    }, []);

    const [visiblePassword, setVisiblePassword] = useState(false)
    const [visiblePasswordConfirm, setVisiblePasswordConfirm] = useState(false)
    // чтобы телефон подчинялся маске
    const [mask_value, setMask_value] = useState("+7(9")

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

    return (
            <>

                {succeeded && (
                    <div className={`succeed-v ${style.error_block}`} style={{ marginTop: "20px", marginBottom: "-30px" }}>
                        Данные были успешно изменены
                    </div>
                )}
                {error && (
                    <div className={`auth-err ${style.error_block}`} style={{ marginTop: "20px", marginBottom: "-30px" }}>
                        {error}
                    </div>
                )}

                <div className="mini-main-2 df">
                    <form onSubmit={onSubmit} className="input-wrap-2">
                        <input type="text" placeholder="Имя" {...getFormAttrs('name')}/>
                        <input type="text" placeholder="Фамилия" {...getFormAttrs('lastname')}/>
                        <VerificationInput isConfirmed={user.is_phone_verified} {...getFormAttrs('phone')} mask_value={mask_value} onChangeMask={correctPhoneNumder} />
                        <VerificationInput isEmail isConfirmed={user.is_email_verified} {...getFormAttrs('email')} />
                        <div className={style.input_wrap}>
                            <input type={visiblePassword ? "text" : "password"} placeholder="Новый пароль"/>
                            <img src={visiblePassword ? "/img/icons/eye_open.png" : "/img/icons/eye_close.png"} alt="" className={style.password_icon} onClick={()=>setVisiblePassword(prev => !prev)} />
                        </div>
                        <div className={style.input_wrap}>
                            <input type={visiblePasswordConfirm ? "text" : "password"} placeholder="Подтверждение пароля"/>
                            <img src={visiblePasswordConfirm ? "/img/icons/eye_open.png" : "/img/icons/eye_close.png"} alt="" className={style.password_icon} onClick={()=>setVisiblePasswordConfirm(prev => !prev)} />
                        </div>
                        
                        <button type="submit">Сохранить</button>
                    </form>
                </div>
        </>
    )
}


export default ProfileFH;
