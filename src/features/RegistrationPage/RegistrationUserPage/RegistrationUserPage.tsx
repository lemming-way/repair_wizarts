import React, {useEffect, useState} from 'react';
import {useNavigate} from "react-router-dom";

import styles from './RegistrationUserPage.module.scss';
import ConfirmPolitics from "../../../components/ConfirmPolitics/ConfirmPolitics";
import {ConfirmPoliticsContext} from "../../../components/ConfirmPolitics/ConfirmPoliticsContext";
// import Error from "../../../components/Error/Error";
import { useLanguage } from '../../../state/language';
import {registerAsClient} from "../../../services/auth.service";

const RegistrationUserPage = () => {
  const text = useLanguage(); // функция для перевода

  useEffect(() => {
    document.title = text('Registration');
  }, [text]);

  const navigate = useNavigate();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
      return setError(text("To continue, you must accept the privacy policy."));
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
        <h1 className={styles.registrationUserPage_title}>{text('Registration')}</h1>
         <form className={styles.registrationUserPage_form} onSubmit={onSubmit}>
           {error && (
             <p className={styles.registrationUserPage_form_error} role="alert">
               {error}
             </p>
           )}
           <input
             className={styles.registrationUserPage_form_input}
             type="text"
             name="name"
             placeholder={text("First Name")}
             value={name}
             onChange={(e) => setName(e.target.value)}
             required
           />
           <input
             className={styles.registrationUserPage_form_input}
             type="text"
             name="lastname"
             placeholder={text("Last Name")}
             value={lastname}
             onChange={(e) => setLastname(e.target.value)}
             required
           />
           <input
             className={styles.registrationUserPage_form_input}
             type="email"
             name="email"
             placeholder={text("Email")}
             value={email}
             onChange={(e) => setEmail(e.target.value)}
             required
           />
           <input
             className={styles.registrationUserPage_form_input}
             type="text"
             name="phone"
             placeholder={text("Phone")}
             value={phone}
             onChange={(e) => setPhone(e.target.value)}
             required
           />
           <input
             className={styles.registrationUserPage_form_input}
             type="password"
             name="password"
             placeholder={text("Password")}
             value={password}
             onChange={(e) => setPassword(e.target.value)}
             required
           />
           <input
             className={styles.registrationUserPage_form_input}
             type="password"
             placeholder={text("Confirm Password")}
             value={passwordVerification}
             onChange={(e) => setPasswordVerification(e.target.value)}
             required
           />

           {/*Вынесла в отдельный компонент, т.к. будет переиспользован*/}
           <ConfirmPolitics />

           <button className={styles.registrationUserPage_form_button} type="submit">{text("Register")}</button>
         </form>
      </div>
    </ConfirmPoliticsContext.Provider>
  );
};

export default RegistrationUserPage;
