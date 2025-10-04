import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'

import { fetchUser } from '../../slices/user.slice'
import { login } from '../../services/auth.service'
import { useLanguage } from '../../state/language'

import './login.css'
import { Modal } from '../../shared/ui'
import modalStyles from '../../features/LoginPage/PasswordRecoveryModal.module.scss'

import { keepUserAuthorized, recoverPassword, recoverPasswordSend, recoverPasswordVerify } from '../../services/user.service'

const RecoveryState = {
    IDLE: 0,
    PHONE: 1,
    CODE: 2
}

function Login() {
    const text = useLanguage()
    const dispatch = useDispatch()
    const navigate = useNavigate()

    const [error, setError] = useState("")
    const [phone, setPhone] = useState("+7(9")
    const [password, setPassword] = useState("")
    const [keep, setKeep] = useState(false)

    const [recoveryState, setRecoveryState] = useState(RecoveryState.IDLE)
    const [recoveryError, setRecoveryError] = useState("")
    const [recoveryUser, setRecoveryUser] = useState("")
    const [recoveryPassword, setRecoveryPassword] = useState("")
    const [recoveryPhone, setRecoveryPhone] = useState("+7(9")
    const [recoveryCode, setRecoveryCode] = useState("")

    const handleChange = (event) => {

        // нельзя вводить не числа и больше 11 символов
        const inputValue = event.target.value.slice(1);
        if (/[^0-9()]/.test(inputValue) && inputValue !== '') {
            setError(text('Invalid character entered. Please enter only digits.'));
        } 
        // else if (inputValue.length > 16) {
        //     setError('Обратите внимание на длину номера!');
        // }
        else {
            setError('');
        }

        const n = correctPhoneNumder(event)
        setPhone(n)
        // setPhone(event.target.value);
    };

    function correctPhoneNumder (e) {
        var text = e.target.value
        var new_text

        // стирание
        if (text.length < phone.length) {
            new_text = text
            if (new_text.length < 4) {
                new_text = "+7(9"
            }
        }
        // +7(988)-842-44-44
        else if (text.length === 6) {
            new_text = text + ")-"
        }
        else if (text.length === 7) {
            new_text = text.slice(0, -1) + ')-' + text.slice(-1);
        }
        else if (text.length === 8) {
            new_text = text.slice(0, -1) + '-' + text.slice(-1);
        }
        else if (text.length === 11) {
            new_text = text + "-" 
        }
        else if (text.length === 12) {
            new_text = text.slice(0, -1) + '-' + text.slice(-1);
        }
        else if (text.length === 14) {
            new_text = text + "-"
        }
        else if (text.length === 15) {
            new_text = text.slice(0, -1) + '-' + text.slice(-1);
        }
        else if (text.length > 17) {
            new_text = text.slice(0,17)
        }
        else {
            new_text = text
        }
        return new_text
    }

    const setRecoveryPhoneHandler = (event) => {

        // нельзя вводить не числа и больше 11 символов
        const inputValue = event.target.value.slice(1);
        if (/[^0-9()]/.test(inputValue) && inputValue !== '') {
            setRecoveryError(text('Invalid character entered. Please enter only digits.'));
        } 
        // else if (inputValue.length > 9) {
        //     setRecoveryError('Обратите внимание на длину номера!');
        // }
        else {
            setRecoveryError('');
        }

        // setRecoveryPhone(event.target.value);
        const n = correctPhoneNumder(event)
        setRecoveryPhone(n)
    };

    const onSendPhone = (e) => {
        e.preventDefault()
        e.stopPropagation()

        return recoverPassword({ phone: recoveryPhone })
            .then((res) => {
                setRecoveryUser(res.user_id)
                setRecoveryState(RecoveryState.CODE)
                setRecoveryError("")
            })
            .catch((err) => setRecoveryError(err.message))
    }
    const onSendCode = (e) => {
        e.preventDefault()
        e.stopPropagation()

        const payload = {
            code: recoveryCode,
            user: recoveryUser
        }

        return recoverPasswordVerify(payload)
            .then(() => recoverPasswordSend({
                user_id: recoveryUser,
                code: recoveryCode,
                password: recoveryPassword
            }))
            .then(() => {
                setRecoveryError("")
                setRecoveryState(RecoveryState.IDLE)
            })
            .catch((err) => {
                if (typeof err.message === "string") {
                    return setRecoveryError(err.message)
                }

                setRecoveryError(text("Unable to process the request"))
            })
    }

    useEffect(() => {
        document.title = text('Login');
    }, [text]);

    const onSubmit = async (e) => {
        e.preventDefault()

        try {
            await login(phone, password)

            if (keep) {
                keepUserAuthorized(true)
            } else {
                keepUserAuthorized(false)
            }

            dispatch(fetchUser())
            navigate("/")
        } catch (err) {
            setError(text("Incorrect data"))
        }
    }

    return (
        <section className="login">
            <h1>{text('Login')}</h1>
            <form onSubmit={onSubmit}>
                {error && (
                    <div className="auth-err">
                        {error}
                    </div>
                )}
                <div className="input_phone_wrap">
                    <input
                    // className="heheinput"
                    type="text"
                    className={phone.length > 4 ? 'phone_input_accent' : 'phone_input_lite'}
                    name="phone"
                    // placeholder="Телефон"
                    value={phone}
                    onChange={handleChange}
                    required
                    />
                </div>
                {/* <input
                    type="text"
                    value={phone}
                    onChange={handleChange}
                    placeholder="Телефон"
                    required
                /> */}
                <input
                    type="password"
                    placeholder={text("Password")}
                    className="input_login_password__fix"
                    onChange={(e) => setPassword(e.target.value)}
                    value={password}
                    required
                />
                <label className="login-keep">
                    <input
                        type="checkbox"
                        value={keep}
                        className="login-keep__input"
                        onChange={(e) => setKeep(e.target.checked)}
                    />
                    {text("Stay logged in")}
                </label>

                <button className="log__btn">{text('Login')}</button>

                <div>
                    <span>{text("No account?")} </span>
                    <Link to="/register" style={{ fontSize: "16px" }}>{text("Sign up")}</Link>
                </div>
                <span
                    style={{
                        marginTop: "6px",
                        textDecoration: "underline",
                        cursor: "pointer"
                    }}
                    onClick={() => setRecoveryState(RecoveryState.PHONE)}
                >
                    {text("Forgot password?")}
                </span>
                <Modal
                    open={recoveryState !== RecoveryState.IDLE}
                    onClose={() => setRecoveryState(RecoveryState.IDLE)}
                    size="sm"
                    className={modalStyles.modal}
                    closeButton={true}
                >
                    <h2 className={modalStyles.title}>
                        {text("Password recovery")}
                    </h2>
                    <p className={modalStyles.info}>
                        {text("Enter your phone number, then a confirmation email will be sent to the email associated with your account.")}
                    </p>
                    {recoveryState === RecoveryState.CODE ? (
                        <form
                            className={modalStyles.form}
                            onSubmit={onSendCode}
                        >
                            {recoveryError && (
                                <div className={modalStyles.error}>
                                    {recoveryError}
                                </div>
                            )}
                            <input
                                className={modalStyles.input}
                                placeholder={text("Enter the code from email")}
                                onChange={(e) => setRecoveryCode(e.target.value)}
                                value={recoveryCode}
                            />
                            <input
                                className={modalStyles.input}
                                placeholder={text("New password")}
                                onChange={(e) => setRecoveryPassword(e.target.value)}
                                value={recoveryPassword}
                            />
                            <button className={modalStyles.button} type="submit">
                                {text("Send")}
                            </button>
                        </form>
                    ) : (
                        <form
                            className={modalStyles.form}
                            onSubmit={onSendPhone}
                        >
                            {recoveryError && (
                                <div className={modalStyles.error}>
                                    {recoveryError}
                                </div>
                            )}

                            <div className="input_phone_wrap_recovery">
                                <input
                                className={`${modalStyles.input} ${recoveryPhone.length > 4 ? 'phone_input_accent' : 'phone_input_lite'}`}
                                type="text"
                                name="phone"
                                value={recoveryPhone}
                                onChange={(e)=>setRecoveryPhoneHandler(e)}
                                required
                                />
                            </div>
                            <button className={modalStyles.button} type="submit">
                                {text("Send")}
                            </button>
                        </form>
                    )}
                </Modal>
            </form>
        </section>
    )
}


export default Login;
