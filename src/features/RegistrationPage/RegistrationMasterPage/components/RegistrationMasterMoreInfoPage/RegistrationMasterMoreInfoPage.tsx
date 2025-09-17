import React from 'react';
import CreatableSelect from "react-select/creatable";
import styles from './RegistrationMasterMoreInfoPage.module.scss';

const RegistrationMasterMoreInfoPage = () => {
  const options = [
    { value: 0, label: "Apple" },
    { value: 1, label: "Samsung" },
    { value: 2, label: "Huawei" },
    { value: 3, label: "Xiaomi" },
    { value: 4, label: "Sony" },
    { value: 5, label: "LG" },
    { value: 6, label: "Google" },
    { value: 7, label: "OnePlus" },
  ];

  return (
    <div className={`${styles.registrationMasterMoreInfoPage} appContainer`}>
      <h1 className={styles.registrationMasterMoreInfoPage_title}>Дополнительная информация</h1>
      <form className={styles.registrationMasterMoreInfoPage_form}>
        <input
          className={styles.registrationMasterMoreInfoPage_form_input}
          type="text"
          name="name"
          placeholder="Название организации"
          required
        />

        <div className={styles.registrationMasterMoreInfoPage_form_radio}>
          <p>Пол:</p>
          <input
            className={styles.registrationMasterMoreInfoPage_form_radio_input}
            checked
            type="radio"
            id="man"
            name="sex"
          />
          <label
            className={styles.registrationMasterMoreInfoPage_form_radio_label}
            htmlFor="man"
          >
            Мужской
          </label>
          <input
            className={styles.registrationMasterMoreInfoPage_form_radio_input}
            type="radio"
            id="woman"
            name="sex"
          />
          <label
            className={styles.registrationMasterMoreInfoPage_form_radio_label}
            htmlFor="woman"
          >
            Женский
          </label>
        </div>

        <input
          className={styles.registrationMasterMoreInfoPage_form_input}
          type="text"
          name="type"
          placeholder="Вид деятельности"
          required
        />
        <input
          className={styles.registrationMasterMoreInfoPage_form_input}
          type="text"
          name="business"
          placeholder="Основной бизнес"
          required
        />
        <input
          className={styles.registrationMasterMoreInfoPage_form_input}
          type="text"
          name="activity"
          placeholder="Основное направление"
          required
        />

        <div className={styles.registrationMasterMoreInfoPage_form_radio}>
          <p>Бизнес модель:</p>
          <input
            className={styles.registrationMasterMoreInfoPage_form_radio_input}
            checked
            type="radio"
            id="master"
            name="model"
          />
          <label
            className={styles.registrationMasterMoreInfoPage_form_radio_label}
            htmlFor="master"
          >
            Частный мастер
          </label>
          <input
            className={styles.registrationMasterMoreInfoPage_form_radio_input}
            type="radio"
            id="service"
            name="model"
          />
          <label
            className={styles.registrationMasterMoreInfoPage_form_radio_label}
            htmlFor="service"
          >
            Сервис
          </label>
        </div>

        <CreatableSelect
          placeholder="Город"
          isClearable
          options={options}
        />

        <CreatableSelect
          placeholder="Район"
          isClearable
          options={options}
        />

        <CreatableSelect
          placeholder="Станция метро"
          isClearable
          options={options}
        />

        <CreatableSelect
          placeholder="Адрес"
          isClearable
          options={options}
        />

        <button className={styles.registrationMasterMoreInfoPage_form_button} type="submit">Регистрация</button>
      </form>

    </div>
  );
};

export default RegistrationMasterMoreInfoPage;