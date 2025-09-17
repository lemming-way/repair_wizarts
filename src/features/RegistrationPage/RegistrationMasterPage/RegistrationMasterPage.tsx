import {useEffect, useState} from 'react';
import MultiSelect, {Option} from "../../../components/MultiSelect/MultiSelect";
import {ConfirmPoliticsContext} from "../../../components/ConfirmPolitics/ConfirmPoliticsContext";
import ConfirmPolitics from "../../../components/ConfirmPolitics/ConfirmPolitics";
// import Error from "../../../components/Error/Error";
import styles from './RegistrationMasterPage.module.scss';

// Старая страница register-master.jsx  !!! НЕ УДАЛЯТЬ ФАЙЛ
const RegistrationMasterPage = () => {
  const [phone, setPhone] = useState("+7(9")
  const [error, setError] = useState("")

  const [accept, setAccept] = useState(false);

  const [categoryMainOptionSelected, setCategoryMainOptionSelected] = useState<Option[] | null>();
  const [categoryOptionSelected, setCategoryOptionSelected] = useState<Option[] | null>();
  const [brandOptionSelected, setBrandOptionSelected] = useState<Option[] | null>();
  const [modelPhoneOptionSelected, setModelPhoneOptionSelected] = useState<Option[] | null>();
  const [typeOfRepairSelected, setTypeOfRepairOptionSelected] = useState<Option[] | null>();

  useEffect(() => {
    document.title = 'Регистрация мастера';
  }, []);

  // В будущем статичные данные будут удалены

  const categoriesMainOptions = [
    { value: 0, label: "Мастера по ремонту" }
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

  const onSubmit = (e) => {
    e.preventDefault()

    if (!accept) {
      // @ts-ignore
      return setError("Чтобы продолжить необходимо принять политику конфиденциальности.");
    }

    try {
      //запрос
    } catch {
      //ошибка
    }
  };

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
      <ConfirmPoliticsContext.Provider value={{accept, setAccept}}>
        <div className={`${styles.registrationMasterPage}`}>
          <h1 className={styles.registrationMasterPage_title}>Регистрация</h1>
          <form className={styles.registrationMasterPage_form} onSubmit={onSubmit}>
            {error && (
                <div className="auth-err" style={{marginBottom: 0}}>
                    {error}
                </div>
            )}

            <input
              className={styles.registrationMasterPage_form_input}
              type="text"
              name="login"
              placeholder="Логин"
              // value={}
              // onChange={}
              required
            />
            <input
              className={styles.registrationMasterPage_form_input}
              type="text"
              name="address"
              placeholder="Адрес"
              // value={}
              // onChange={}
              required
            />
            <input
              className={styles.registrationMasterPage_form_input}
              type="text"
              name="name"
              placeholder="Имя"
              // value={}
              // onChange={}
              required
            />
            <input
              className={styles.registrationMasterPage_form_input}
              type="text"
              name="lastname"
              placeholder="Фамилия"
              // value={}
              // onChange={}
              required
            />
            <div className={styles.registrationMasterPage_input_phone_wrap}>
            <input
              className={`${styles.registrationMasterPage_form_input} ${phone.length > 4 ? 'phone_input_accent' : 'phone_input_lite'}`}
              type="text"
              name="phone"
              
              // placeholder="Телефон"
              value={phone}
              onChange={(e)=>setPhoneHandler(e)}
              required
            />
            </div>
            <input
              className={styles.registrationMasterPage_form_input}
              type="email"
              name="email"
              placeholder="Электронная почта"
              // value={}
              // onChange={}
              required
            />
            <input
              className={styles.registrationMasterPage_form_input}
              type="password"
              name="password"
              placeholder="Пароль"
              // value={}
              // onChange={}
              required
            />
            <input
              className={styles.registrationMasterPage_form_input}
              type="password"
              placeholder="Подтвердите пароль"
              // value={}
              // onChange={}
              required
            />

            {/* <MultiSelect
              key="category_id"
              placeholder="Категории услуг"
              options={categoriesOptions}
              onChange={(selected: Option[]) => setCategoryOptionSelected(selected)}
              value={categoryOptionSelected}
              isSelectAll={true}
              menuPlacement={"bottom"}
            /> */}
            <MultiSelect
              key="category_id"
              placeholder="Вид категории"
              options={categoriesMainOptions}
              onChange={(selected: Option[]) => setCategoryMainOptionSelected(selected)}
              value={categoryMainOptionSelected}
              isSelectAll={true}
              menuPlacement={"bottom"}
            />
            <MultiSelect
              key="categories"
              placeholder="Категории"
              options={categoriesOptions}
              onChange={(selected: Option[]) => setCategoryOptionSelected(selected)}
              value={categoryOptionSelected}
              isSelectAll={true}
              menuPlacement={"bottom"}
            />
            <MultiSelect
              key="brand_id"
              placeholder="Бренды"
              options={brandsOptions}
              onChange={(selected: Option[]) => setBrandOptionSelected(selected)}
              value={brandOptionSelected}
              isSelectAll={true}
              menuPlacement={"bottom"}
            />
            <MultiSelect
              key="model_phone"
              placeholder="Модель устройства"
              options={modelsPhone}
              onChange={(selected: Option[]) => setModelPhoneOptionSelected(selected)}
              value={modelPhoneOptionSelected}
              isSelectAll={true}
              menuPlacement={"bottom"}
            />
            {/* <MultiSelect
              key="typeOfRepair_id"
              placeholder="Виды ремонта"
              options={typeOfRepairOptions}
              onChange={(selected: Option[]) => setTypeOfRepairOptionSelected(selected)}
              value={typeOfRepairSelected}
              isSelectAll={true}
              menuPlacement={"bottom"}
            /> */}

              {/*Вынесла в отдельный компонент, т.к. будет переиспользован*/}
              <ConfirmPolitics/>

              <button className={styles.registrationMasterPage_form_button} type="submit">
                дальше
                {/* <Link to="more-info" className={styles.loginPage_options_register}>Продолжить</Link> */}
              </button>
          </form>
        </div>
      </ConfirmPoliticsContext.Provider>
  );
};

export default RegistrationMasterPage;