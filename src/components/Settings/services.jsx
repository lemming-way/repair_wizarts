import {
    useState,
    useEffect,
    useCallback,
} from 'react'
import { useSelector } from 'react-redux';
import '../../scss/service.css'
import '../../scss/register-master.scss'
import { Link } from "react-router-dom";
import Sidebar from "../sidebar";
import { selectUser } from '../../slices/user.slice';
import ServicesList from './Services/ServicesList';
import ServicesForm from './Services/ServicesForm';
import { getMasterRepairsByUsername } from '../../services/service.service';
import styles from './Services/Services.module.css'
import MultiSelect from "../MultiSelect/MultiSelect";
import Navigation from './Navigation';

import style from "./services.module.css"

const FormMode = {
    Hidden: 0,
    Default: 1,
    Custom: 2
}

function Services() {
    const [categoryMainOptionSelected, setCategoryMainOptionSelected] = useState(null);
    const [categoryOptionSelected, setCategoryOptionSelected] = useState(null);
    const [brandOptionSelected, setBrandOptionSelected] = useState(null);
    const [modelPhoneOptionSelected, setModelPhoneOptionSelected] = useState(null);

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
    
      const typeOfRepairOptions = [
        { value: 0, label: "Ремонт экрана" },
        { value: 1, label: "Замена батареи" },
        { value: 2, label: "Ремонт от воды" },
        { value: 3, label: "Прошивка устройства" },
        { value: 4, label: "Ремонт разъемов и портов" },
        { value: 5, label: "Восстановление программного обеспечения" },
      ];

    const user = useSelector(selectUser)

    const [formMode, setFormMode] = useState(FormMode.Hidden)
    const [repairs, setRepairs] = useState([])
    const username = user.master?.[0].username

    useEffect(() => {
        if (!username) return

        getMasterRepairsByUsername(username).then(setRepairs)
    }, [user])

    const onDelete = useCallback((e, id) => {
        getMasterRepairsByUsername(username).then(setRepairs)
    }, [])

    const onSubmit = (e) =>
        getMasterRepairsByUsername(username).then(setRepairs)


    const [servicesBlocks, setServicesBlocks] = useState({})
    useEffect(() => {

        var obj = {}
        if (!modelPhoneOptionSelected) {
            return
        }

        modelPhoneOptionSelected.map(object=>
            obj[object.label] = {
                "open": false,
                "select_state": "",
                "row": [{
                            "heading": "",
                            "description": "",
                            "time": "",
                            "price": ""
                        },
                        {
                            "heading": "",
                            "description": "",
                            "time": "",
                            "price": ""
                        },
                        {
                            "heading": "",
                            "description": "",
                            "time": "",
                            "price": ""
                        },
                        {
                            "heading": "",
                            "description": "",
                            "time": "",
                            "price": ""
                        }
                    ]
            }
        )
        setServicesBlocks(obj)

    }, [modelPhoneOptionSelected])

    function changeInputs(value, key, field, index) {
        var obj = {...servicesBlocks}
        obj[key]["row"][index][field] = value

        setServicesBlocks(obj)
    }

    function deleteRow(key, index) {
        var obj = {...servicesBlocks}
        // var filtered_massiv = obj[key]["row"].filter((number) => number !== index);
        
        obj[key]["row"].splice(index, 1);
        // obj[key]["row"] = filtered_massiv
        setServicesBlocks(obj)
    }

    function addRow(key) {
        var obj = {...servicesBlocks}
        obj[key]["row"].push({
            "heading": "",
            "description": "",
            "time": "",
            "price": ""
        });
        setServicesBlocks(obj)
    }

    function openBlocks(key) {
        var obj = {...servicesBlocks}
        obj[key]["open"] = !obj[key]["open"]
        setServicesBlocks(obj)
    }

    function handleSelect(e, key) {
        var obj = {...servicesBlocks}
        obj[key]["select_state"] = e.target.value
        

        if (e.target.value == "Свои услуги") {
            obj[key]["row"] = [{
                            "heading": "",
                            "description": "",
                            "time": "",
                            "price": ""
                        }]
        }

        if (e.target.value == "Услуги по умолчанию") {
            obj[key]["row"] = [{
                                    "heading": "Замена стекла",
                                    "description": "",
                                    "time": "2 дня",
                                    "price": "4500"
                                },
                                {
                                    "heading": "Замена аккумулятора",
                                    "description": "",
                                    "time": "1 час",
                                    "price": "3000"
                                },
                                {
                                    "heading": "Ремонт динамика",
                                    "description": "ремонт динамика",
                                    "time": "3 часа",
                                    "price": "1500"
                                }]
        }

        setServicesBlocks(obj)
    }

    return (
        <div className={style.services_wrap}>
            <div className={style.categories_block}>
                <h3 className={style.heading}>Загрузка прайса</h3>
                <div className={style.alert}>Данные сохранены</div>
                
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

                <div className={style.wrap_buttons}>
                    <button className={style.button_save}>Сохранить</button>
                </div>
                
            </div>

            <div className={style.right_block}>

                {Object.keys(servicesBlocks).length > 0 ? <h3 className={style.heading}>Вид ремонта</h3> : null}
                {servicesBlocks ?
                   
                    Object.keys(servicesBlocks).map(key =>
                        <div className={style.block_service}>
                            <div className={style.block_service__row}>
                                <input className={style.input_heading} value={key} type="text" />
                                <button className={style.btn} style={{rotate: servicesBlocks[key]["open"] ? "180deg": "0deg"}} onClick={()=>openBlocks(key)}><img src="/img/bot_white.png" alt="" /></button>
                            </div>
                            
                            {servicesBlocks[key]["open"]?
                            <>
                            <select className={style.block__select} value={servicesBlocks[key]["select_state"]} onChange={(e) => handleSelect(e, key)} name="" id="">
                                <option value="" disabled>Не выбрано</option>
                                <option value="Услуги по умолчанию">Услуги по умолчанию</option>
                                <option value="Свои услуги">Свои услуги</option>
                            </select>

                            <div className={style.block_service__body}>
                                {servicesBlocks[key]["row"].map((obj, index) =>
                                    <div key={index} className={style.block_service__body_row}>
                                        <input className={style.input_body} type="text" value={obj["heading"]} onChange={(e)=> changeInputs(e.target.value, key, "heading", index)} placeholder='заголовок' />
                                        <input className={style.input_body} type="text" value={obj["description"]} onChange={(e)=> changeInputs(e.target.value, key, "description", index)} placeholder='описание' />
                                        <input className={style.input_body} type="text" value={obj["time"]} onChange={(e)=> changeInputs(e.target.value, key, "time", index)} placeholder='время' />
                                        <input className={style.input_body} type="text" value={obj["price"]} onChange={(e)=> changeInputs(e.target.value, key, "price", index)} placeholder='цена' />
                                        <button className={style.btn} ><img src="/img/pencil_white.png" alt="" /></button>
                                        <button className={style.btn} onClick={(e)=> deleteRow(key, index)}><img src="/img/delete_white.png" alt="" /></button>
                                    </div>
                                )}
                            </div>

                            <div className={style.row_buttons}>
                                <button className={style.btn_v2} onClick={(e)=> addRow(key)} >Добавить услугу</button>
                                {/* <button className={style.btn_v2} onClick={(e)=> addRow(key)}>Добавить</button> */}
                            </div>
                            </>
                            : null}
                       
                        </div>
                    )
                :null}



            
            </div>
        </div>
    )
}


export default Services;
