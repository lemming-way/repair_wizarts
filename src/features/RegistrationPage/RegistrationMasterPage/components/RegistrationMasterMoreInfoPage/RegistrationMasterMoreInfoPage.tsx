import React from 'react';
import CreatableSelect from "react-select/creatable";

import styles from './RegistrationMasterMoreInfoPage.module.scss';
import { useLanguage } from '../../../../../state/language';

const RegistrationMasterMoreInfoPage = () => {
  const text = useLanguage();
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
      <h1 className={styles.registrationMasterMoreInfoPage_title}>{text("Additional information")}</h1>
      <form className={styles.registrationMasterMoreInfoPage_form}>
        <input
          className={styles.registrationMasterMoreInfoPage_form_input}
          type="text"
          name="name"
          placeholder={text("Organization name")}
          required
        />

        <div className={styles.registrationMasterMoreInfoPage_form_radio}>
          <p>{text("Gender")}:</p>
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
            {text("Male")}
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
            {text("Female")}
          </label>
        </div>

        <input
          className={styles.registrationMasterMoreInfoPage_form_input}
          type="text"
          name="type"
          placeholder={text("Type of activity")}
          required
        />
        <input
          className={styles.registrationMasterMoreInfoPage_form_input}
          type="text"
          name="business"
          placeholder={text("Main business")}
          required
        />
        <input
          className={styles.registrationMasterMoreInfoPage_form_input}
          type="text"
          name="activity"
          placeholder={text("Main direction")}
          required
        />

        <div className={styles.registrationMasterMoreInfoPage_form_radio}>
          <p>{text("Business model")}:</p>
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
            {text("Independent technician")}
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
            {text("Service center")}
          </label>
        </div>

        <CreatableSelect
          placeholder={text("City")}
          isClearable
          options={options}
        />

        <CreatableSelect
          placeholder={text("District")}
          isClearable
          options={options}
        />

        <CreatableSelect
          placeholder={text("Metro station")}
          isClearable
          options={options}
        />

        <CreatableSelect
          placeholder={text("Address")}
          isClearable
          options={options}
        />

        <button className={styles.registrationMasterMoreInfoPage_form_button} type="submit">
          {text("Registration")}
        </button>
      </form>

    </div>
  );
};

export default RegistrationMasterMoreInfoPage;
