import React, {useEffect, useState} from 'react';
import {useQueryClient} from '@tanstack/react-query';
import {Link, useNavigate} from "react-router-dom";

import styles from './LoginPage.module.scss';
import { PhoneNumber } from '../PhoneNumber';
import { useLanguage } from 'app/state/language';
import { login } from "app/state/user";
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
      await login(queryClient, phone, password, keep);
      navigate("/");
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(text(message));
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
