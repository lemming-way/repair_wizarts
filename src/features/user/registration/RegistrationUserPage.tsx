import React, {useEffect, useState} from 'react';
import {useNavigate} from "react-router-dom";

import styles from './RegistrationUserPage.module.scss';
import ConfirmPolitics from "../../../components/ConfirmPolitics/ConfirmPolitics";
import {ConfirmPoliticsContext} from "../../../components/ConfirmPolitics/ConfirmPoliticsContext";
// import Error from "../../../components/Error/Error";
import { useLanguage } from '../../../state/language';
import { useRegisterClient } from '../../../state/user';
import { PhoneNumber } from '../PhoneNumber';

const RegistrationUserPage = () => {
  const text = useLanguage();

  useEffect(() => {
    document.title = text('Registration');
  }, [text]);

  const navigate = useNavigate();
  const registerClientMutation = useRegisterClient();

  const [error, setError] = useState<string | undefined>(undefined);
  const [name, setName] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("+7(9");
  const [password, setPassword] = useState("");
  const [passwordVerification, setPasswordVerification] = useState("");
  const [accept, setAccept] = useState(false);
  const [keep, setKeep] = useState(false);

  // Сброс ошибки телефона при изменении номера (для соответствия RegistrationMasterPage)
  useEffect(() => {
    if (phone.replace(/\D/g, '').length === 11) {
      setError(undefined);
    }
  }, [phone]);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(undefined); // Сброс предыдущих ошибок

    if (!accept) {
      return setError('Чтобы продолжить необходимо принять политику конфиденциальности.');
    }

    if (password !== passwordVerification) {
      setError('Пароли не совпадают.');
      return;
    }

    const uName = `${name.trim()} ${lastname.trim()}`.trim();
    if (!uName) {
      setError('Имя и Фамилия должны быть заполнены.');
      return;
    }

    if (phone.replace(/\D/g, '').length < 11) {
      setError('Номер телефона введен не полностью.');
      return;
    }

    try {
      await registerClientMutation.mutateAsync({
        name,
        lastname,
        email,
        phone,
        password,
        keepAuthorized: keep,
      });
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  return (
    <ConfirmPoliticsContext.Provider value={{accept, setAccept}}>
      <div className={`${styles.registrationUserPage} appContainer`}>
        <h1 className={styles.registrationUserPage_title}>Регистрация</h1>
         <form className={styles.registrationUserPage_form} onSubmit={onSubmit}>
           {error && (
             <div
               className="auth-err"
               style={{
                 marginBottom: '10px',
                 color: 'red',
                 textAlign: 'center',
               }}
             >
               {error}
             </div>
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
           <div className={styles.registrationUserPage_input_phone_wrap}>
             <PhoneNumber
               placeholder={text("Phone")}
               className={`${styles.registrationUserPage_form_input} ${
                 phone.length > 4 ? 'phone_input_accent' : 'phone_input_lite'
               }`}
               value={phone}
               onChange={setPhone}
             />
           </div>
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

           <label className={styles.registrationUserPage_form_loginKeep}>
             <input
               className={styles.registrationUserPage_form_loginKeep_input}
               type="checkbox"
               onChange={(e) => setKeep(e.target.checked)}
             />
             {text("Stay logged in")}
           </label>

           {/*Вынесла в отдельный компонент, т.к. будет переиспользован*/}
           <ConfirmPolitics />

           <button
             className={styles.registrationUserPage_form_button}
             type="submit"
             disabled={registerClientMutation.isPending}
           >
             {registerClientMutation.isPending ? text("Registering...") : text("Register")}
           </button>
         </form>
      </div>
    </ConfirmPoliticsContext.Provider>
  );
};

export default RegistrationUserPage;
