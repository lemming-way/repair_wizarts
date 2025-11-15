import React, {useEffect, useState} from 'react';
import {useQueryClient} from '@tanstack/react-query';
import {Link, useNavigate} from "react-router-dom";

import styles from './LoginPage.module.scss';
import { Modal } from '../../../shared/ui/Modal';
import { useLanguage } from '../../../state/language';
import modalStyles from './PasswordRecoveryModal.module.scss';
import {login} from "../../../services/auth.service";
import { setToken } from "../../../services/token.service";
import appFetch from "../../../utilities/appFetch";
import {
  keepUserAuthorized,
  recoverPassword,
  recoverPasswordSend,
  recoverPasswordVerify
} from "../../../services/user.service";
import {userKeys} from '../../../queries';

const correctPhoneNumber = (value: string) => {
  if (!value) {
    return "";
  }
  let correctValue = value.replace(/[^+\d]/g, "");
  if (correctValue[0] !== "+") {
    correctValue = "+" + correctValue;
  }
  if (correctValue.length > 2) {
    if (correctValue[0] === "+" && correctValue[1] === "7") {
      return `+7(${correctValue.slice(2, 5)}) ${correctValue.slice(5, 8)}-${correctValue.slice(8, 10)}-${correctValue.slice(10, 12)}`;
    }
  }
  return correctValue;
};

const RecoveryState = {
  IDLE: 0,
  PHONE: 1,
  CODE: 2
}

const LoginPage = () => {
  const text = useLanguage();
  const queryClient = useQueryClient();
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

  useEffect(() => {
    document.title = text("Sign in");
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
        <input
          className={styles.loginPage_form_input}
          type="text"
          name="phone"
          placeholder={text("Phone")}
          onChange={(e) => setPhone(correctPhoneNumber(e.target.value))}
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
          onClick={() => setRecoveryState(RecoveryState.PHONE)}
        >
          {text("Forgot password?")}
        </span>
      </div>

      <Modal
        className={modalStyles.modal}
        open={recoveryState !== RecoveryState.IDLE}
        onClose={() => setRecoveryState(RecoveryState.IDLE)}
        closeButton={true}
      >
        <h2 className={modalStyles.title}>{text("Password recovery")}</h2>
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
            <button className={modalStyles.button}>
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
            <div className="input_phone_wrap_recovery">
              <input
                className={`${modalStyles.input} ${
                  recoveryPhone.length > 4
                    ? 'phone_input_accent'
                    : 'phone_input_lite'
                }`}
                placeholder={text("Phone number")}
                onChange={(e) => setRecoveryPhone(correctPhoneNumber(e.target.value))}
                value={recoveryPhone}
              />
            </div>
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
