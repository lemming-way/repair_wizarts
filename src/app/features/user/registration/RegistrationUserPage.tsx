import React, {useEffect, useState} from 'react';
import {useNavigate} from "react-router-dom";

// import Error from "app/components/Error/Error";
import { useLanguage } from 'app/state/language';
import { useRegisterClient } from 'app/state/user';
import { PhoneNumber } from '../PhoneNumber';
import { ConfirmPolitics } from "./ConfirmPolitics";
import styles from './RegistrationUserPage.module.scss';
import sharedStyles from './RegistrationPage.module.scss';

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

  // Сброс ошибки телефона при изменении номера (для соответствия RegistrationContractorPage)
  useEffect(() => {
    if (phone.replace(/\D/g, '').length === 11) {
      setError(undefined);
    }
  }, [phone]);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(undefined); // Сброс предыдущих ошибок

    if (!accept) {
      return text('To continue, you must accept the privacy policy.');
    }

    if (password !== passwordVerification) {
      text('Passwords do not match.');
      return;
    }

    const uName = `${name.trim()} ${lastname.trim()}`.trim();
    if (!uName) {
      text('First and Last name must be filled in.');
      return;
    }

    if (phone.replace(/\D/g, '').length < 11) {
      text('Phone number is incomplete.');
      return;
    }

    try {
      await registerClientMutation.register({
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

         <div className={sharedStyles.registrationPage_checkbox_container}>
           <input
             id="keep-authorized"
             type="checkbox"
             onChange={(e) => setKeep(e.target.checked)}
           />
           <label htmlFor="keep-authorized">
             {text("Stay logged in")}
           </label>
         </div>

         <ConfirmPolitics accept={accept} onChange={setAccept}/>

         <button
           className={styles.registrationUserPage_form_button}
           type="submit"
           disabled={registerClientMutation.isPending}
         >
           {registerClientMutation.isPending ? text("Registering...") : text("Register")}
         </button>
       </form>
    </div>
  );
};

export default RegistrationUserPage;
