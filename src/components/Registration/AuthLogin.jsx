import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { fetchUser } from '../../slices/user.slice';
import { login } from '../../services/auth.service';

import './login.css';
import Popup from 'reactjs-popup';
import {
  keepUserAuthorized,
  recoverPassword,
  recoverPasswordSend,
  recoverPasswordVerify,
} from '../../services/user.service';
import { setToken } from '../../services/token.service';
import appFetch from '../../utilities/appFetch';

const RecoveryState = {
  IDLE: 0,
  PHONE: 1,
  CODE: 2,
};

function AuthLogin() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [error, setError] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [keep, setKeep] = useState(false);

  const [recoveryState, setRecoveryState] = useState(RecoveryState.IDLE);
  const [recoveryError, setRecoveryError] = useState('');
  const [recoveryUser, setRecoveryUser] = useState('');
  const [recoveryPassword, setRecoveryPassword] = useState('');
  const [recoveryPhone, setRecoveryPhone] = useState('');
  const [recoveryCode, setRecoveryCode] = useState('');

  const handleChange = (event) => {
    // нельзя вводить не числа и больше 11 символов
    const inputValue = event.target.value.slice(1);
    if (/[^0-9()]/.test(inputValue) && inputValue !== '') {
      setError(
        'Вы ввели недопустимый символ. Пожалуйста, введите только цифры.',
      );
    }
    // else if (inputValue.length > 16) {
    //     setError('Обратите внимание на длину номера!');
    // }
    else {
      setError('');
    }

    const n = correctPhoneNumder(event);
    setPhone(n);
    // setPhone(event.target.value);
  };

  function correctPhoneNumder(e) {
    var text = e.target.value;
    let new_text = text;
    // стирание
    if (text.length < phone.length) {
      new_text = text;
      if (new_text.length < 4) {
        new_text = '';
      }
    }
    // +7(988)-842-44-44
    else if (text.length === 6) {
      new_text = text + ')-';
    } else if (text.length === 7) {
      new_text = text.slice(0, -1) + ')-' + text.slice(-1);
    } else if (text.length === 8) {
      new_text = text.slice(0, -1) + '-' + text.slice(-1);
    } else if (text.length === 11) {
      new_text = text + '-';
    } else if (text.length === 12) {
      new_text = text.slice(0, -1) + '-' + text.slice(-1);
    } else if (text.length === 14) {
      new_text = text + '-';
    } else if (text.length === 15) {
      new_text = text.slice(0, -1) + '-' + text.slice(-1);
    } else if (text.length > 17) {
      new_text = text.slice(0, 17);
    } else {
      new_text = text;
    }
    return new_text;
  }

  const setRecoveryPhoneHandler = (event) => {
    // нельзя вводить не числа и больше 11 символов
    const inputValue = event.target.value.slice(1);
    if (/[^0-9()]/.test(inputValue) && inputValue !== '') {
      setRecoveryError(
        'Вы ввели недопустимый символ. Пожалуйста, введите только цифры.',
      );
    }
    // else if (inputValue.length > 9) {
    //     setRecoveryError('Обратите внимание на длину номера!');
    // }
    else {
      setRecoveryError('');
    }

    // setRecoveryPhone(event.target.value);
    const n = correctPhoneNumder(event);
    setRecoveryPhone(n);
  };

  const onSendPhone = (e) => {
    e.preventDefault();
    e.stopPropagation();

    return recoverPassword({ phone: recoveryPhone })
      .then((res) => {
        setRecoveryUser(res.user_id);
        setRecoveryState(RecoveryState.CODE);
        setRecoveryError('');
      })
      .catch((err) => setRecoveryError(err.message));
  };
  const onSendCode = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const payload = {
      code: recoveryCode,
      user: recoveryUser,
    };

    return recoverPasswordVerify(payload)
      .then(() =>
        recoverPasswordSend({
          user_id: recoveryUser,
          code: recoveryCode,
          password: recoveryPassword,
        }),
      )
      .then(() => {
        setRecoveryError('');
        setRecoveryState(RecoveryState.IDLE);
      })
      .catch((err) => {
        if (typeof err.message === 'string') {
          return setRecoveryError(err.message);
        }

        setRecoveryError('Невозможно выполнить запрос');
      });
  };

  useEffect(() => {
    document.title = 'Войти';
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await login(phone, password);
      const userProfile = await appFetch('user/authorized/car', {
        body: {
          u_hash: response.data.u_hash,
          token: response.data.token,
        },
      });
      console.log(response);
      if (response.code === '404')
        return setError('Не правильный номер телефона или пароль');
      if (keep) {
        keepUserAuthorized(true);
      } else {
        keepUserAuthorized(false);
      }
      console.log(userProfile);
      setToken({
        hash: response.data.u_hash,
        token: response.data.token,
        user: {
          ...response.auth_user,
          c_id: Object.values(userProfile.data.car || {})[0].c_id,
        },
      });
      dispatch(fetchUser());
      navigate('/');
    } catch (err) {
      console.log(err);
      setError('Некорректные данные');
    }
  };

  return (
    <section className="login">
      <h1>Войти</h1>
      <form onSubmit={onSubmit}>
        {error && <div className="auth-err">{error}</div>}
        <div className="input_phone_wrap">
          <input
            // className="heheinput"
            type="text"
            className={
              phone.length > 4 ? 'phone_input_accent' : 'phone_input_lite'
            }
            name="phone"
            // placeholder="Телефон"
            value={phone}
            onChange={handleChange}
            required
          />
        </div>
        {/* <input
                    type="text"
                    value={phone}
                    onChange={handleChange}
                    placeholder="Телефон"
                    required
                /> */}
        <input
          type="password"
          placeholder="Пароль"
          className="input_login_password__fix"
          onChange={(e) => setPassword(e.target.value)}
          value={password}
          required
        />
        <label className="login-keep">
          <input
            type="checkbox"
            value={keep}
            className="login-keep__input"
            onChange={(e) => setKeep(e.target.checked)}
          />
          Оставаться в системе
        </label>

        <button className="log__btn">Войти</button>

        <div>
          <span>Нет аккаунта? </span>
          <Link to="/register" style={{ fontSize: '16px' }}>
            Зарегистрируйтесь
          </Link>
        </div>
        <span
          style={{
            marginTop: '6px',
            textDecoration: 'underline',
            cursor: 'pointer',
          }}
          onClick={() => setRecoveryState(RecoveryState.PHONE)}
        >
          Забыли пароль?
        </span>
        <Popup
          className="password-recovery__modal"
          open={recoveryState !== RecoveryState.IDLE}
          onClose={() => setRecoveryState(RecoveryState.IDLE)}
        >
          <button
            className="password-recovery__close"
            onClick={() => setRecoveryState(RecoveryState.IDLE)}
          >
            ×
          </button>
          <h2 className="password-recovery__title">Восстановление пароля</h2>
          <p className="password-recovery__info">
            Введите номер телефона, после чего на почту, привязанную к вашему
            аккаунту придёт письмо подтверждения.
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
            <form className="password-recovery-form" onSubmit={onSendPhone}>
              {recoveryError && (
                <div className="password-recovery-form__error">
                  {recoveryError}
                </div>
              )}

              <div className="input_phone_wrap_recovery">
                <input
                  // className="heheinput"
                  className={`password-recovery-form__input ${
                    recoveryPhone.length > 4
                      ? 'phone_input_accent'
                      : 'phone_input_lite'
                  }`}
                  type="text"
                  name="phone"
                  // placeholder="Телефон"
                  value={recoveryPhone}
                  onChange={(e) => setRecoveryPhoneHandler(e)}
                  required
                />
              </div>
              {/* <input
                                className="password-recovery-form__input"
                                placeholder="Номер телефона"
                                onChange={(e) => setRecoveryPhoneHandler(e)}
                                value={recoveryPhone}
                            /> */}
              <button className="password-recovery-form__button">
                Отправить
              </button>
            </form>
          )}
        </Popup>
      </form>
    </section>
  );
}

export default AuthLogin;
