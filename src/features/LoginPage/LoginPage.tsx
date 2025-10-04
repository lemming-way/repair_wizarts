import React, {useEffect, useState} from 'react';
import {useDispatch} from "react-redux";
import {Link, useNavigate} from "react-router-dom";

import styles from './LoginPage.module.scss';
import modalStyles from './PasswordRecoveryModal.module.scss';
import { Modal } from '../../shared/ui';
import Error from "../../components/Error/Error";
import { useLanguage } from '../../state/language';
import {login} from "../../services/auth.service";
import {
  keepUserAuthorized,
  recoverPassword,
  recoverPasswordSend,
  recoverPasswordVerify
} from "../../services/user.service";
import {fetchUser} from "../../slices/user.slice";

const RecoveryState = {
  IDLE: 0,
  PHONE: 1,
  CODE: 2
}

const LoginPage = () => {
  const text = useLanguage();

  // Оставила без изменений
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [error, setError] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [keep, setKeep] = useState(false);

  const [recoveryState, setRecoveryState] = useState(RecoveryState.IDLE);
  const [recoveryError, setRecoveryError] = useState("");
  const [recoveryUser, setRecoveryUser] = useState("");
  const [recoveryPassword, setRecoveryPassword] = useState("");
  const [recoveryPhone, setRecoveryPhone] = useState("");
  const [recoveryCode, setRecoveryCode] = useState("");

  const resolveLoginPayload = () => {
    const trimmed = phone.trim();
    const isEmail = trimmed.includes('@');

    return {
      value: trimmed,
      type: isEmail ? 'email' : 'phone',
    } as const;
  };

  useEffect(() => {
    document.title = text("Login");
  }, [text]);

  const onSendPhone = (e) => {
    e.preventDefault()
    e.stopPropagation()

    return recoverPassword({ phone: recoveryPhone })
      .then((res) => {
        setRecoveryUser(res.user_id)
        setRecoveryState(RecoveryState.CODE)
        setRecoveryError("")
      })
      .catch((err) => setRecoveryError(err.message))
  };

  const onSendCode = (e) => {
    e.preventDefault()
    e.stopPropagation()

    const payload = {
      code: recoveryCode,
      user: recoveryUser
    }

    return recoverPasswordVerify(payload)
      .then(() => recoverPasswordSend({
        user_id: recoveryUser,
        code: recoveryCode,
        password: recoveryPassword
      }))
      .then(() => {
        setRecoveryError("")
        setRecoveryState(RecoveryState.IDLE)
      })
      .catch((err) => {
        if (typeof err.message === "string") {
          return setRecoveryError(err.message)
        }

        setRecoveryError(text("Unable to process the request"))
      })
  };

  const onSubmit = async (e) => {
    e.preventDefault()

    const { value, type } = resolveLoginPayload();

    try {
      await login(value, password, type)

      if (keep) {
        keepUserAuthorized(true)
      } else {
        keepUserAuthorized(false)
      }

      // @ts-ignore
      dispatch(fetchUser());
      navigate("/");
    } catch (err) {
      setError(text("Incorrect data"));
    }
  };

  return (
    // Изменила блок с формой
    <div className={`${styles.loginPage} appContainer`}>
      <h1 className={styles.loginPage_title}>{text("Login")}</h1>
      <form className={styles.loginPage_form} onSubmit={onSubmit}>
        {error && (
          // В старом коде className="auth-err"
          // Вынесла в отдельный компонент, т.к. переиспользуется
          <Error error={error} />
        )}
        <input
          className={styles.loginPage_form_input}
          type="text"
          name="phone"
          placeholder={text("Phone")}
          onChange={(e) => setPhone(e.target.value)}
          value={phone}
          required
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
            // value={keep}
            onChange={(e) => setKeep(e.target.checked)}
          />
          {text("Stay logged in")}
        </label>

        <button className={styles.loginPage_form_button} type="submit">{text("Login")}</button>
      </form>

      <div className={styles.loginPage_options}>
        <span>{text("No account?")} </span>
        <Link to="/register" className={styles.loginPage_options_register}>{text("Register")}</Link>
        <span
          className={styles.loginPage_options_recovery}
          onClick={() => setRecoveryState(RecoveryState.PHONE)}
        >
          {text("Forgot password?")}
        </span>
      </div>

      <Modal
        open={recoveryState !== RecoveryState.IDLE}
        onClose={() => setRecoveryState(RecoveryState.IDLE)}
        size="sm"
        className={modalStyles.modal}
        closeButton={true}
      >
        <h2 className={modalStyles.title}>
          {text("Password recovery")}
        </h2>
        <p className={modalStyles.info}>
          {text("Enter your phone number, then a confirmation email will be sent to the email associated with your account.")}
        </p>
        {recoveryState === RecoveryState.CODE ? (
          <form
            className={modalStyles.form}
            onSubmit={onSendCode}
          >
            {recoveryError && (
              <div className={modalStyles.error}>
                {recoveryError}
              </div>
            )}
            <input
              className={modalStyles.input}
              placeholder={text("Enter the code from email")}
              onChange={(e) => setRecoveryCode(e.target.value)}
              value={recoveryCode}
            />
            <input
              className={modalStyles.input}
              placeholder={text("New password")}
              onChange={(e) => setRecoveryPassword(e.target.value)}
              value={recoveryPassword}
            />
            <button className={modalStyles.button} type="submit">
              {text("Send")}
            </button>
          </form>
        ) : (
          <form
            className={modalStyles.form}
            onSubmit={onSendPhone}
          >
            {recoveryError && (
              <div className={modalStyles.error}>
                {recoveryError}
              </div>
            )}
            <input
              className={modalStyles.input}
              placeholder={text("Phone number")}
              onChange={(e) => setRecoveryPhone(e.target.value)}
              value={recoveryPhone}
            />
            <button className={modalStyles.button} type="submit">
              {text("Send")}
            </button>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default LoginPage;
