import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerAsClient } from "../../services/auth.service"; 
import '../../scss/register.css'
import SERVER_PATH from "../../constants/SERVER_PATH";

function Register() {
    const navigate = useNavigate()

    const [error, setError] = useState()
    const [name, setName] = useState("")
    const [lastname, setLastname] = useState("")
    const [email, setEmail] = useState("")
    const [phone, setPhone] = useState("+7(9")
    const [password, setPassword] = useState("")
    const [passwordVerification, setPasswordVerification] = useState("")
    const [accept, setAccept] = useState(false)

    const onSubmit = (e) => {
        e.preventDefault()

        if (!accept) {
            return setError("Чтобы продолжить необходимо принять политику конфиденциальности.")
        }

        return registerAsClient({
            name,
            lastname,
            email,
            phone,
            password1: password,
            password2: passwordVerification,
        })
        .then(() => navigate("/login"))
        .catch((err) => setError(err.message))
    }

    useEffect(() => {
        document.title = 'Регистрация';
    }, []);

    const setPhoneHandler = (event) => {
        const inputValue = event.target.value.slice(1);

        // нельзя вводить не числа и больше 11 символов
        if (/[^0-9()\-]/.test(inputValue) && inputValue !== '') {
            setError('В номере, пожалуйста, введите только цифры.');
        } 
        // else if (inputValue.length > 9) {
        //     setError('Обратите внимание на длину номера!');
        // }
        else {
            setError('');
        }

        // нельзя стирать маску

        // setPhone(event.target.value);
        const n = correctPhoneNumder(event)
        setPhone(n)
    };

    function correctPhoneNumder (e) {
        var text = e.target.value
        var new_text = ""
        // стирание
        if (text.length < phone.length) {
            new_text = text
            if (new_text.length < 4) {
                new_text = "+7(9"
            }
        }
        // +7(988)-842-44-44
        else if (text.length == 6) {
            new_text = text + ")-"
        }
        else if (text.length == 7) {
            new_text = text.slice(0, -1) + ')-' + text.slice(-1);
        }
        else if (text.length == 8) {
            new_text = text.slice(0, -1) + '-' + text.slice(-1);
        }
        else if (text.length == 11) {
            new_text = text + "-" 
        }
        else if (text.length == 12) {
            new_text = text.slice(0, -1) + '-' + text.slice(-1);
        }
        else if (text.length == 14) {
            new_text = text + "-"
        }
        else if (text.length == 15) {
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
    return (
        <section className="register">
            <h1>Регистрация</h1>
            <form onSubmit={onSubmit}>
                {error && (
                    <div className="auth-err">
                        {error}
                    </div>
                )}

                <input
                    required
                    type="text"
                    onChange={(e) => setName(e.target.value)}
                    value={name}
                    className="heheinput"
                    placeholder="Имя"
                />
                <input
                    required
                    type="text"
                    value={lastname}
                    onChange={(e) => setLastname(e.target.value)}
                    className="heheinput"
                    placeholder="Фамилия"
                />
                <input
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="heheinput"
                    placeholder="Email"
                />
                <div className="input_phone_wrap">
                    <input
                    className={`heheinput ${phone.length > 4 ? 'phone_input_accent' : 'phone_input_lite'}`}
                    type="text"
                    name="phone"
                    placeholder="Телефон"
                    value={phone}
                    onChange={(e)=>setPhoneHandler(e)}
                    required
                    />
                </div>
                <input
                    required
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="heheinput"
                    placeholder="Пароль"
                />
                <input
                    required
                    type="password"
                    value={passwordVerification}
                    onChange={(e) => setPasswordVerification(e.target.value)}
                    className="heheinput"
                    placeholder="Подтвердите пароль"
                />
                <div className="rel">
                    <input type="checkbox" id="really" checked={accept} onChange={(e) => setAccept(e.target.checked)} />
                    <label htmlFor="really">
                        Ознакомлен и согласен с условиями
                        <a
                            style={{
                                textDecoration: "underline",
                                marginLeft: "5px",
                                color: "#000"
                            }}
                            target="_blank"
                            href={SERVER_PATH + "files/privacy-policy.pdf"}
                        >
                            Политики конфиденциальности
                        </a>
                    </label>
                </div>
                <button>Регистрация</button>
            </form>
        </section>
    )
}

export default Register;