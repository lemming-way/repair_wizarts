import {
    useEffect,
    useState,
    useMemo,
    useRef
} from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { withYMaps } from "react-yandex-maps";
import { selectUser } from "../../slices/user.slice";
import { selectServices } from "../../slices/services.slice";
import { selectUI } from "../../slices/ui.slice";
import SelectInput from '../SelectInput'
import { addMaster, registerAsMaster } from "../../services/auth.service";
import '../../scss/register-master.css'
import SERVER_PATH from "../../constants/SERVER_PATH";

function RegisterMaster({ ymaps }) {
    const navigate = useNavigate()

    const ui = useSelector(selectUI)
    const user = useSelector(selectUser)
    const services = useSelector(selectServices)

    const [selectedCats, setSelectedCats] = useState([])
    const [selectedTypes, setSelectedTypes] = useState([])
    const [selectedDevices, setSelectedDevices] = useState([])
    const [selectedRepairTypes, setSelectedRepairTypes] = useState([])
    const [accept, setAccept] = useState(false)
    const [error, setError] = useState("")

    const categories = services.categories
    const types = useMemo(() =>
        services.service_types.filter(((v) => selectedCats.includes(v.category_id))),
        [selectedCats]
    )
    const devices = useMemo(() =>
        services.devices.filter(((v) => selectedTypes.includes(v.service_id))),
        [selectedTypes]
    )
    const repairTypes = useMemo(() =>
            services.repair_types.filter(((v) => selectedDevices.includes(v.device_id))),
        [selectedDevices]
    )

    const prevCatsLength = useRef(selectedCats?.length)
    const prevTypesLength = useRef(selectedTypes?.length)

    useEffect(() => {
        if (selectedCats.length < prevCatsLength.current) {
            setSelectedTypes(prev => prev.filter((v) => selectedCats.includes(v)))
        }
        prevCatsLength.current = selectedCats.length
    }, [selectedCats])
    useEffect(() => {
        if (selectedTypes.length < prevTypesLength.current) {
            setSelectedDevices(prev => prev.filter((v) => selectedTypes.includes(v)))
        }
        prevTypesLength.current = selectedTypes.length
    }, [selectedTypes])

    const getChangeHandle = (state, setState) => (e) => {
        const value = +e.target.dataset.value

        if (state.includes(value)) {
            return setState((prev) => prev.filter((v) => v !== value))
        }

        setState([...state, value])
    }

    useEffect(() => {
        document.title = 'Регистрация мастера';
    }, []);

    const [form, setForm] = useState({
        username: "",
        name: "",
        lastname: "",
        email: "",
        phone: "",
        password1: "",
        password2: "",
        address: "",
    })
    const getFormAttributes = (field) => {
        const attrs = { }

        attrs.onChange = (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }))
        attrs.value = form[field]

        if (Object.hasOwn(user, field)) {
            attrs.disabled = true
            attrs.value = user[field]
        }

        return attrs
    }

    const onSubmit = async (e) => {
        e.preventDefault()
        
        if (!accept) {
            return setError("Чтобы продолжить необходимо принять политику конфиденциальности.")
        }

        try {
            const geo = await ymaps.geocode(form.address, { results: 1 })
            const [address_latitude, address_longitude] =
                geo.geoObjects.get(0).geometry.getCoordinates()

            if (ui.isAuthorized) {
                const { username, address } = form
                const data = {
                    username,
                    address,
                    devices: selectedDevices,
                    address_latitude,
                    address_longitude
                }

                await addMaster(data)
                return navigate("/login")
            }

            const data = {
                ...form,
                devices: selectedDevices,
                repair_types: selectedRepairTypes,
                address_latitude,
                address_longitude
            }

            await registerAsMaster(data)
            navigate("/login")
        } catch (err) {
            if (err.message === "scriptError") {
                return setError("Введите корректный адрес")
            }

            setError(err.message)
        }
    }

    useEffect(() => {
        ymaps.ready(() => {
            const suggestView = new ymaps.SuggestView('suggest-input')
            suggestView.events.add("select", (e) => {
                setForm((prev) => ({
                    ...prev,
                    address: e.get('item').value
                }))
            })
        })
    }, [ymaps])

    return (
        <section className="register">
            
            <h1>Регистрация мастера</h1>
            <form onSubmit={onSubmit}>
                {error && (
                    <div className="auth-err">
                        {error}
                    </div>
                )}
                <input
                    type="text"
                    placeholder="Логин"
                    required
                    {...getFormAttributes("username")}
                />
                <input
                    {...getFormAttributes("address")}
                    type="text"
                    placeholder="Адрес"
                    required
                    id="suggest-input"
                />
                <input
                    {...getFormAttributes("name")}
                    type="text"
                    placeholder="Имя"
                    required
                />
                <input
                    {...getFormAttributes("lastname")}
                    type="text"
                    placeholder="Фамилия"
                    required
                />
                <input required {...getFormAttributes("phone")} type="text" placeholder="Телефон"/>
                <input required {...getFormAttributes("email")} type="email" placeholder="Электронная почта"/>
                {!ui.isAuthorized && (
                    <>
                        <input minLength="8" {...getFormAttributes("password1")} type="password" placeholder="Пароль"/>
                        <input minLength="8" {...getFormAttributes("password2")} type="password" placeholder="Подтвердите пароль" />
                        <SelectInput
                            options={categories}
                            value={selectedCats}
                            onSelect={getChangeHandle(selectedCats, setSelectedCats)}
                            title="Категории"
                        />
                        <SelectInput
                            options={types}
                            value={selectedTypes}
                            disabled={selectedCats.length === 0}
                            onSelect={getChangeHandle(selectedTypes, setSelectedTypes)}
                            title="Бренды"
                        />
                        <SelectInput
                            options={devices}
                            value={selectedDevices}
                            disabled={selectedTypes.length === 0}
                            onSelect={getChangeHandle(selectedDevices, setSelectedDevices)}
                            title="Модели"
                        />
                        <SelectInput
                            options={repairTypes}
                            value={selectedRepairTypes}
                            disabled={selectedDevices.length === 0}
                            onSelect={getChangeHandle(selectedRepairTypes, setSelectedRepairTypes)}
                            title="Вид ремонта"
                        />
                    </>
                )}
                <div className="rel">
                    <input type="checkbox" id="really" onChange={(e) => setAccept(e.target.checked)} />
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
                <button type="submit">Зарегистрироваться</button>
            </form>
        </section>
    )
}

export default withYMaps(RegisterMaster, true, ['SuggestView', 'geocode']);
