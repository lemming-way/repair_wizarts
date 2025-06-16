import React from 'react';
import CreatableSelect from "react-select/creatable";
import styles from './RegistrationMasterMoreInfoPage.module.scss';
import { useLanguage } from '../../../../../context/LanguageContext';

const RegistrationMasterMoreInfoPage = () => {
  const { t } = useLanguage();
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
      <h1 className={styles.registrationMasterMoreInfoPage_title}>{t("Additional information")}</h1>
      <form className={styles.registrationMasterMoreInfoPage_form}>
        <input
          className={styles.registrationMasterMoreInfoPage_form_input}
          type="text"
          name="name"
          placeholder={t("Organization name")}
          required
        />

        <div className={styles.registrationMasterMoreInfoPage_form_radio}>
          <p>{t("Gender")}:</p>
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
            {t("Male")}
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
            {t("Female")}
          </label>
        </div>

        <input
          className={styles.registrationMasterMoreInfoPage_form_input}
          type="text"
          name="type"
          placeholder={t("Type of activity")}
          required
        />
        <input
          className={styles.registrationMasterMoreInfoPage_form_input}
          type="text"
          name="business"
          placeholder={t("Main business")}
          required
        />
        <input
          className={styles.registrationMasterMoreInfoPage_form_input}
          type="text"
          name="activity"
          placeholder={t("Main direction")}
          required
        />

        <div className={styles.registrationMasterMoreInfoPage_form_radio}>
          <p>{t("Business model")}:</p>
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
            {t("Private master")}
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
            {t("Service")}
          </label>
        </div>

        <CreatableSelect
          placeholder={t("City")}
          isClearable
          options={options}
        />

        <CreatableSelect
          placeholder={t("District")}
          isClearable
          options={options}
        />

        <CreatableSelect
          placeholder={t("Metro station")}
          isClearable
          options={options}
        />

        <CreatableSelect
          placeholder={t("Address")}
          isClearable
          options={options}
        />

        <button className={styles.registrationMasterMoreInfoPage_form_button} type="submit">
          {t("Registration")}
        </button>
      </form>

    </div>
  );
};

export default RegistrationMasterMoreInfoPage;