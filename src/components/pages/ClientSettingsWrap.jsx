import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { selectUser } from "../../slices/user.slice";
import { updateUser } from "../../services/user.service";
import { useNavigate } from "react-router-dom";
import style from "./ClientSettingsWrap.module.css"
import ClientProfileNavigator from "../full-height/ClientProfileNavigator";
import { Outlet } from "react-router-dom";


function ClientSettingsWrap() {
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

    const [numberElementMenu, setNumberElementMenu] = useState(1)
    const [offsetMenu, setOffsetMenu] = useState(1)

    function NavigateLeft () {
        var n = numberElementMenu
        if (n-1 < 0) {
            return
        }
        const newNumber = n-1
        setNumberElementMenu(newNumber)
        navigate(listLinks[newNumber])
    }
    function NavigateRight () {
        var n = numberElementMenu
        if (n+1 > listLinks.length - 1) {
            return
        }
        const newNumber = n+1
        setNumberElementMenu(newNumber)
        navigate(listLinks[newNumber])
    }

    useEffect(() => {
        const n = listLinks.indexOf(window.location.pathname)
        setNumberElementMenu(n)
        
        if (window.innerWidth > 700) {
            setOffsetMenu(0)
        }
        else if (n > 3) {
            setOffsetMenu(3);
        }
        else {
            setOffsetMenu(n)
        }
    });

    

    return (
        <div className={style.main_block}>
            <div className={style.block_settings_client}>
                <div className={style.block_heading}>
                    <div>
                        <h1>Настройки</h1>
                    </div>
                    <div className={style.arrows_block}>
                        <img src="/img/img-right.png" style={{rotate: "180deg", opacity: numberElementMenu == 0 ? 0.5 : 1}} alt="" onClick={NavigateLeft} />
                        <img src="/img/img-right.png" style={{opacity: numberElementMenu == listLinks.length-1 ? 0.5 : 1}} alt="" onClick={NavigateRight} />
                    </div>
                </div>

                <ClientProfileNavigator numberElementMenu={numberElementMenu} offsetMenu={offsetMenu} />

               
                <Outlet />
            </div>
        </div>
    )
}


export default ClientSettingsWrap;
