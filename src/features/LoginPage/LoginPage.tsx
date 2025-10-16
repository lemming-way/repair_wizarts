import React, {useEffect, useState} from 'react';
import {useDispatch} from "react-redux";
import {Link, useNavigate} from "react-router-dom";
import Popup from "reactjs-popup";
import {
  keepUserAuthorized,
  recoverPassword,
  recoverPasswordSend,
  recoverPasswordVerify
} from "../../services/user.service";
import {login} from "../../services/auth.service";
import {fetchUser} from "../../slices/user.slice";
import styles from './LoginPage.module.scss';
import Error from "../../components/Error/Error";

const RecoveryState = {
  IDLE: 0,
  PHONE: 1,
  CODE: 2
}

const LoginPage = () => {
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

  useEffect(() => {
    document.title = 'Войти';
  }, []);

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

        setRecoveryError("Невозможно выполнить запрос")
      })
  };

  const onSubmit = async (e) => {
    e.preventDefault()

    try {
      await login(phone, password)

      if (keep) {
        keepUserAuthorized(true)
      } else {
        keepUserAuthorized(false)
      }

      // @ts-ignore
      dispatch(fetchUser());
      navigate("/");
    } catch (err) {
      setError("Некорректные данные");
    }
  };

  return (
    // Изменила блок с формой
    <div className={`${styles.loginPage} appContainer`}>
      <h1 className={styles.loginPage_title}>Войти</h1>
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
          placeholder="Телефон"
          onChange={(e) => setPhone(e.target.value)}
          value={phone}
          required
        />
        <input
          className={styles.loginPage_form_input}
          type="password"
          name="password"
          placeholder="Пароль"
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
          Оставаться в системе
        </label>

        <button className={styles.loginPage_form_button} type="submit">Войти</button>
      </form>

      <div className={styles.loginPage_options}>
        <span>Нет аккаунта? </span>
        <Link to="/register" className={styles.loginPage_options_register}>Зарегистрируйтесь</Link>
        <span
          className={styles.loginPage_options_recovery}
          onClick={() => setRecoveryState(RecoveryState.PHONE)}
        >
         Забыли пароль?
        </span>
      </div>

      {/*Оставила Popup без изменений*/}
      <Popup
        className="password-recovery__modal"
        open={recoveryState !== RecoveryState.IDLE}
        onClose={() => setRecoveryState(RecoveryState.IDLE)}
      >
        <button
          className="password-recovery__close"
          type="button"
          onClick={() => setRecoveryState(RecoveryState.IDLE)}
        >
          ×
        </button>
        <h2 className="password-recovery__title">
          Восстановление пароля
        </h2>
        <p className="password-recovery__info">
          Введите номер телефона, после чего на почту, привязанную к вашему аккаунту придёт письмо подтверждения.
        </p>
        {recoveryState === RecoveryState.CODE ? (
          <form
            className="password-recovery-form password-recovery-form--extended"
            onSubmit={onSendCode}
          >
            {recoveryError && (
              <div className="password-recovery-form__error">
                {recoveryError}
              </div>
            )}
            <input
              className="password-recovery-form__input password-recovery-form__input--extended"
              placeholder="Введите код с почты"
              onChange={(e) => setRecoveryCode(e.target.value)}
              value={recoveryCode}
            />
            <input
              className="password-recovery-form__input password-recovery-form__input--extended"
              placeholder="Новый пароль"
              onChange={(e) => setRecoveryPassword(e.target.value)}
              value={recoveryPassword}
            />
            <button className="password-recovery-form__button">
              Отправить
            </button>

          </form>
        ) : (
          <form
            className="password-recovery-form"
            onSubmit={onSendPhone}
          >
            {recoveryError && (
              <div className="password-recovery-form__error">
                {recoveryError}
              </div>
            )}
            <input
              className="password-recovery-form__input"
              placeholder="Номер телефона"
              onChange={(e) => setRecoveryPhone(e.target.value)}
              value={recoveryPhone}
            />
            <button className="password-recovery-form__button" type="submit">
              Отправить
            </button>
          </form>
        )}
      </Popup>
    </div>
  );
};

export default LoginPage;