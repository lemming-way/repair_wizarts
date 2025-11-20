import React, {useEffect, useState} from 'react';
import {useQueryClient} from '@tanstack/react-query';
import {Link, useNavigate} from "react-router-dom";

import styles from './LoginPage.module.scss';
import { PhoneNumber } from '../PhoneNumber';
import { useLanguage } from '../../../state/language';
import {login} from "../../../services/auth.service";
import { setToken } from "../../../services/token.service";
import appFetch from "../../../utilities/appFetch";
import {
  keepUserAuthorized,
} from "../../../services/user.service";
import {userKeys} from '../../../queries';
import PasswordRecoveryModal from './PasswordRecoveryModal';


const LoginPage = () => {
  const text = useLanguage();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [error, setError] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [keep, setKeep] = useState(false);

  const [isRecoveryModalOpen, setIsRecoveryModalOpen] = useState(false);

  useEffect(() => {
    document.title = text("Sign in");
  }, [text]);


  const onSubmit = async (e) => {
    e.preventDefault();

    try {
      const loginType = phone.includes("@") ? "email" : "phone";
      const response = await login(phone, password, loginType);

      if (keep) {
        keepUserAuthorized(true);
      } else {
        keepUserAuthorized(false);
      }

      const carData = await appFetch("user/authorized/car", {
        method: "POST",
        body: {
          u_hash: response.data.u_hash,
          token: response.data.token,
        },
      });

      setToken({
        hash: response.data.u_hash,
        token: response.data.token,
        user: {
          ...response.auth_user,
          c_id: ( Object.values(carData.data.car || {})[0] as any )?.c_id,
        },
      });

      queryClient.invalidateQueries({ queryKey: userKeys.all });  // todo: перенести в state/user
      navigate("/");
    } catch (err) {
      setError(text("Incorrect phone number or password"));
    }
  };

  return (
    <div className={`${styles.loginPage} appContainer`}>
      <h1 className={styles.loginPage_title}>{text("Login")}</h1>
      <form className={styles.loginPage_form} onSubmit={onSubmit}>
        {error && (
          <div className="auth-err">
            {text(error)}
          </div>
        )}
        <PhoneNumber
          className={styles.loginPage_form_input}
          placeholder={text("Phone")}
          onChange={setPhone}
          value={phone}
        />
        <input
          className={styles.loginPage_form_input}
          type="password"
          name="password"
          placeholder={text("Password")}
          onChange={(e) => setPassword(e.target.value)}
          value={password}
          required
        />

        <label className={styles.loginPage_form_loginKeep}>
          <input
            className={styles.loginPage_form_loginKeep_input}
            type="checkbox"
            onChange={(e) => setKeep(e.target.checked)}
          />
          {text("Stay logged in")}
        </label>

        <button className={styles.loginPage_form_button} type="submit">{text("Sign in")}</button>
      </form>

      <div className={styles.loginPage_options}>
        <span>{text("No account?")} </span>
        <Link to="/register" className={styles.loginPage_options_register}>{text("Register")}</Link>
        <span
          className={styles.loginPage_options_recovery}
          onClick={() => setIsRecoveryModalOpen(true)}
        >
          {text("Forgot password?")}
        </span>
      </div>

      <PasswordRecoveryModal
        open={isRecoveryModalOpen}
        onClose={() => setIsRecoveryModalOpen(false)}
      />
    </div>
  );
};

export default LoginPage;
