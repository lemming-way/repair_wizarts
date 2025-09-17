import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { withYMaps } from "react-yandex-maps";
import { selectUser } from "../../slices/user.slice";
import { updateUser } from "../../services/user.service";
import '../../scss/profile.css'
import "swiper/css";
import "swiper/css/navigation";
import { selectUI } from "../../slices/ui.slice";
import MultiSelect from "../MultiSelect/MultiSelect";
import style from "./Profile.module.css"

function Profile({ ymaps }) {
    const [categoryMainOptionSelected, setCategoryMainOptionSelected] = useState(null);
    const [categoryOptionSelected, setCategoryOptionSelected] = useState(null);
    const [brandOptionSelected, setBrandOptionSelected] = useState(null);
    const [modelPhoneOptionSelected, setModelPhoneOptionSelected] = useState(null);
    const [experience, setExperience] = useState(null);

    const experienceOptions = [
        { value: 1, label: "1 год" },
        { value: 2, label: "2 года" },
        { value: 3, label: "3 года" },
        { value: 5, label: "5 лет" },
        { value: 6, label: "Более 5 лет" }
    ];

    const categoriesMainOptions = [
        { value: 0, label: "Электроника" }
      ];

    const categoriesOptions = [
        { value: 0, label: "Ремонт телефонов" },
        { value: 1, label: "Ремонт планшетов" },
        { value: 2, label: "Ремонт ноутбуков" },
        { value: 3, label: "Ремонт компьютеров" },
        { value: 4, label: "Ремонт часов" },
        { value: 5, label: "Акссесуары" },
      ];
    
      const modelsPhone = [
        { value: 0, label: "iPhone 11" },
        { value: 1, label: "iPhone 11 Pro" },
        { value: 2, label: "iPhone 11 Pro Max" },
        { value: 3, label: "iPhone SE" },
        { value: 4, label: "iPhone 12" },
        { value: 5, label: "iPhone 12 Mini" },
        { value: 6, label: "iPhone 12 Pro" },
        { value: 7, label: "iPhone 12 Pro Max" },
        { value: 8, label: "iPhone 13" },
        { value: 9, label: "iPhone 13 Mini" },
        { value: 10, label: "iPhone 13 Pro" },
        { value: 11, label: "iPhone 13 Pro Max" },
        { value: 12, label: "iPhone 14" },
        { value: 13, label: "iPhone 14 Plus" },
        { value: 14, label: "iPhone 14 Pro" },
        { value: 15, label: "iPhone 14 Pro Max" },
        { value: 16, label: "iPhone 15" },
        { value: 17, label: "iPhone 15 Plus" },
        { value: 18, label: "iPhone 15 Pro" },
        { value: 19, label: "iPhone 15 Pro Max" }
      ]
    
      const brandsOptions = [
        { value: 0, label: "Apple" },
        { value: 1, label: "Samsung" },
        { value: 2, label: "Huawei" },
        { value: 3, label: "Xiaomi" },
        { value: 4, label: "Sony" },
        { value: 5, label: "LG" },
        { value: 6, label: "Google" },
        { value: 7, label: "OnePlus" },
      ];
    
    //   const typeOfRepairOptions = [
    //     { value: 0, label: "Ремонт экрана" },
    //     { value: 1, label: "Замена батареи" },
    //     { value: 2, label: "Ремонт от воды" },
    //     { value: 3, label: "Прошивка устройства" },
    //     { value: 4, label: "Ремонт разъемов и портов" },
    //     { value: 5, label: "Восстановление программного обеспечения" },
    //   ]; ###

    const ui = useSelector(selectUI)
    const user = useSelector(selectUser)

    const [suceeded, setSuceeded] = useState(false)
    const [error, setError] = useState("")
    const [form, setForm] = useState({
        name: "",
        lastname: "",
        organization_name: "",
        address: "",
        specialty: "",
        main_business: "",
        bio: ""
    })
    const [gender, setGender] = useState("Мужской")
    const [business_model, setBusiness] = useState("Частный мастер")

    const getFormAttrs = (field) => {
        const attrs = { }

        attrs.value = form[field]
        attrs.onChange = (e) =>
            setForm((prev) => ({ ...prev, [field]: e.target.value }))

        return attrs
    }

    const onSubmit = async (e) => {
        e.preventDefault()
        
        const geo = await ymaps.geocode(form.address, { results: 1 })
        const [address_latitude, address_longitude] =
            geo.geoObjects.get(0).geometry.getCoordinates()

        const payload = {
            ...form,
            address_latitude,
            address_longitude,
            gender,
            business_model
        }

        try {
            await updateUser(payload, user.id)
            setError("")
            setSuceeded(true)
        } catch (err) {
            setError(err.message)
            setSuceeded(false)
        }
    }

    useEffect(() => {
        if (ui.isAuthorized) {
            const master = user.master[0]
            const obj = {
                name: user.name,
                lastname: user.lastname,
                organization_name: master.organization_name || "",
                address: master.address || "",
                specialty: master.specialty || "",
                main_business: master.main_business || "",
                bio: master.bio || "",
            }
            setGender(master.gender)
            setBusiness(master.business_model)
            setForm(obj)
        }
    }, [ui.isAuthorized])
    useEffect(() => {
        document.title = 'Настройки';
    }, []);
    
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

            <>

                <div className={`mini-main-2 df ${style.wrap_flex}`}>
                    <form className="input-wrap-2" onSubmit={onSubmit}>
                        {suceeded && (
                            <div className="succeed-v">
                                Данные успешно обновлены
                            </div>
                        )}
                        {error && (
                            <div className="auth-err">
                                {error}
                            </div>
                        )}

                        <div className={`custom_nvakasd ${style.wrap_custom_field}`}>
                                    <MultiSelect
                                    key="category_id"
                                    placeholder="Вид категории"
                                    options={categoriesMainOptions}
                                    onChange={(selected) => setCategoryMainOptionSelected(selected)}
                                    value={categoryMainOptionSelected}
                                    isSelectAll={true}
                                    menuPlacement={"bottom"}
                                    />
                                    <MultiSelect
                                    key="categories"
                                    placeholder="Категории"
                                    options={categoriesOptions}
                                    onChange={(selected) => setCategoryOptionSelected(selected)}
                                    value={categoryOptionSelected}
                                    isSelectAll={true}
                                    menuPlacement={"bottom"}
                                    />
                                    <MultiSelect
                                    key="brand_id"
                                    placeholder="Бренды"
                                    options={brandsOptions}
                                    onChange={(selected) => setBrandOptionSelected(selected)}
                                    value={brandOptionSelected}
                                    isSelectAll={true}
                                    menuPlacement={"bottom"}
                                    />
                                    <MultiSelect
                                    key="model_phone"
                                    placeholder="Модель устройства"
                                    options={modelsPhone}
                                    onChange={(selected) => setModelPhoneOptionSelected(selected)}
                                    value={modelPhoneOptionSelected}
                                    isSelectAll={true}
                                    menuPlacement={"bottom"}
                                    /> 
                                </div>
                        <input type="text" placeholder="Имя" {...getFormAttrs('name')} />
                        <input type="text" placeholder="Фамилия" {...getFormAttrs('lastname')}/>
                        <input
                            type="text"
                            placeholder="Адрес"
                            id="suggest-input"
                            {...getFormAttrs('address')}
                        />
                        <input type="text" placeholder="Название организации" {...getFormAttrs('organization_name')}/>
                        <div className={`custom_nvakasd ${style.wrap_custom_field}`}>
                        
                        <MultiSelect
                            style={{'width': '100%'}}
                            key="experience"
                            placeholder="Опыт работы"
                            options={experienceOptions}
                            onChange={(selected) => setExperience(selected)}
                            value={experience}
                            isSelectAll={false}
                            menuPlacement={"bottom"}
                        />
                        </div>
                        <input type="text" placeholder="Основной бизнес" {...getFormAttrs('main_business')}/>
                        <input type="text" placeholder="Вид деятельности" {...getFormAttrs('specialty')}/>
                        <textarea placeholder={business_model === "Частный мастер"? "О себе" : "Об организации"} {...getFormAttrs('bio')} />
                        <div>
                            <button type="submit" className="goooSaveButton">Сохранить</button>
                        </div>
                    </form>

                    <div className={`check-input-content ${style.wrap_check}`}>
                        {/* <div className="first-check">
                            <h4>Пол:</h4>
                            <div className="first_check df">
                                <input
                                    type="radio"
                                    name="select__man__woman"
                                    id="inputmanradiobtn"
                                    onChange={() => setGender("Мужской")}
                                    checked={gender === "Мужской"}
                                />
                                <label htmlFor="inputmanradiobtn"><p>Мужской</p></label>
                            </div>

                            <div className="first_check df">
                                <input
                                    type="radio"
                                    name="select__man__woman"
                                    id="inputwomanradiobtn"
                                    onChange={() => setGender("Женский")}
                                    checked={gender === "Женский"}
                                />
                                <label htmlFor="inputwomanradiobtn"><p>Женский</p> </label>
                            </div>
                        </div> */}

                        <div className="second-check">
                            <h4>Бизнес модель:</h4>
                            <div className="first_check df" style={{gap: "0"}}>
                                <input
                                    type="radio"
                                    name="select__service"
                                    id="yesornow"
                                    onChange={() => setBusiness("Частный мастер")}
                                    checked={business_model === "Частный мастер"}
                                />
                                <label htmlFor="yesornow"><p>Частный мастер</p></label>
                            </div>

                            <div className="first_check df" style={{gap: "0"}}>
                                <input
                                    type="radio"
                                    name="select__service"
                                    id="inputradioservicebtn"
                                    onChange={() => setBusiness("Сервис")}
                                    checked={business_model === "Сервис"}
                                />
                                <label htmlFor="inputradioservicebtn"><p>Сервис</p></label>
                            </div>
                        </div>
                    </div>

                </div>
            </>

    )
}


export default withYMaps(Profile, true, ['SuggestView', 'geocode']);
