import React, {useEffect, useState} from 'react';
import {useNavigate} from "react-router-dom";

import styles from './RegistrationUserPage.module.scss';
import ConfirmPolitics from "../../../components/ConfirmPolitics/ConfirmPolitics";
import {ConfirmPoliticsContext} from "../../../components/ConfirmPolitics/ConfirmPoliticsContext";
// import Error from "../../../components/Error/Error";
import { useLanguage } from '../../../context/LanguageContext';  // импорт контекста перевода
import {registerAsClient} from "../../../services/auth.service";

const RegistrationUserPage = () => {
  const { t } = useLanguage(); // функция для перевода

  useEffect(() => {
    document.title =  t('Registration');
  }, []);

  const navigate = useNavigate();

  const [error, setError] = useState();
  const [name, setName] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVerification, setPasswordVerification] = useState("");
  const [accept, setAccept] = useState(false);

  const onSubmit = (e) => {
    e.preventDefault()

    if (!accept) {
      // @ts-ignore
      return setError(t("To continue, you must accept the privacy policy."));
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
  };

  return (
    <ConfirmPoliticsContext.Provider value={{accept, setAccept}}>
      <div className={`${styles.registrationUserPage} appContainer`}>
        <h1 className={styles.registrationUserPage_title}>{t('Registration')}</h1>
         <form className={styles.registrationUserPage_form} onSubmit={onSubmit}>
           {/*{error && (*/}
           {/*// В старом коде className="auth-err"*/}
           {/*<Error error={error} />*/}
           {/*)}*/}
           <input
             className={styles.registrationUserPage_form_input}
             type="text"
             name="name"
             placeholder={t("First Name")}
             value={name}
             onChange={(e) => setName(e.target.value)}
             required
           />
           <input
             className={styles.registrationUserPage_form_input}
             type="text"
             name="lastname"
             placeholder={t("Last Name")}
             value={lastname}
             onChange={(e) => setLastname(e.target.value)}
             required
           />
           <input
             className={styles.registrationUserPage_form_input}
             type="email"
             name="email"
             placeholder={t("Email")}
             value={email}
             onChange={(e) => setEmail(e.target.value)}
             required
           />
           <input
             className={styles.registrationUserPage_form_input}
             type="text"
             name="phone"
             placeholder={t("Phone")}
             value={phone}
             onChange={(e) => setPhone(e.target.value)}
             required
           />
           <input
             className={styles.registrationUserPage_form_input}
             type="password"
             name="password"
             placeholder={t("Password")}
             value={password}
             onChange={(e) => setPassword(e.target.value)}
             required
           />
           <input
             className={styles.registrationUserPage_form_input}
             type="password"
             placeholder={t("Confirm Password")}
             value={passwordVerification}
             onChange={(e) => setPasswordVerification(e.target.value)}
             required
           />

           {/*Вынесла в отдельный компонент, т.к. будет переиспользован*/}
           <ConfirmPolitics />

           <button className={styles.registrationUserPage_form_button} type="submit">{t("Register")}</button>
         </form>
      </div>
    </ConfirmPoliticsContext.Provider>
  );
};

export default RegistrationUserPage;