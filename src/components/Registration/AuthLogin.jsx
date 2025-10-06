import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';

import { fetchUser } from '../../slices/user.slice';
import { login } from '../../services/auth.service';
import { useLanguage } from '../../state/language';

import './login.css';
import { Modal } from '../../shared/ui';
import modalStyles from '../../features/LoginPage/PasswordRecoveryModal.module.scss';

import { setToken } from '../../services/token.service';
import {
  keepUserAuthorized,
  recoverPassword,
  recoverPasswordSend,
  recoverPasswordVerify,
} from '../../services/user.service';
import appFetch from '../../utilities/appFetch';

const RecoveryState = {
  IDLE: 0,
  PHONE: 1,
  CODE: 2,
};

function correctPhoneNumber(value, previousValue = '') {
  let new_text;

  if (value.length < previousValue.length) {
    new_text = value;
    if (new_text.length < 4) {
      new_text = '';
    }
  } else if (value.length === 6) {
    new_text = value + ')-';
  } else if (value.length === 7) {
    new_text = value.slice(0, -1) + ')-' + value.slice(-1);
  } else if (value.length === 8) {
    new_text = value.slice(0, -1) + '-' + value.slice(-1);
  } else if (value.length === 11) {
    new_text = value + '-';
  } else if (value.length === 12) {
    new_text = value.slice(0, -1) + '-' + value.slice(-1);
  } else if (value.length === 14) {
    new_text = value + '-';
  } else if (value.length === 15) {
    new_text = value.slice(0, -1) + '-' + value.slice(-1);
  } else if (value.length > 17) {
    new_text = value.slice(0, 17);
  } else {
    new_text = value;
  }
  return new_text;
}

function AuthLogin() {
  const text = useLanguage();
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

  const resolveLoginPayload = () => {
    const trimmed = phone.trim();
    const isEmail = trimmed.includes('@');

    return {
      value: trimmed,
      type: isEmail ? 'email' : 'phone',
    };
  };

  const handleChange = (event) => {
    const rawValue = event.target.value;
    const inputValue = rawValue.slice(1);
    if (/[^0-9()-]/.test(inputValue) && inputValue !== '') {
      setError( 'Invalid character entered. Please enter only digits.' );
    } else {
      setError('');
    }

    const n = correctPhoneNumber(rawValue, phone);
    setPhone(n);
  };

  const setRecoveryPhoneHandler = (event) => {
    // нельзя вводить не числа и больше 11 символов
    const rawValue = event.target.value;
    const inputValue = rawValue.slice(1);
    if (/[^0-9()-]/.test(inputValue) && inputValue !== '') {
      setRecoveryError( 'Invalid character entered. Please enter only digits.' );
    }
    else {
      setRecoveryError('');
    }

    const n = correctPhoneNumber(rawValue, recoveryPhone);
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

        setRecoveryError('Unable to process the request');
      });
  };

  useEffect(() => {
    document.title = text('Sign in');
  }, [text]);

  const onSubmit = async (e) => {
    e.preventDefault();

    const { value, type } = resolveLoginPayload();

    try {
      const response = await login(value, password, type);
      const userProfile = await appFetch('user/authorized/car', {
        body: {
          u_hash: response.data.u_hash,
          token: response.data.token,
        },
      });
      console.log(response);
      if (response.code === '404')
        return setError('Incorrect phone number or password');
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
      setError('Incorrect data');
    }
  };

  return (
    <section className="login">
      <h1>Войти</h1>
      <form onSubmit={onSubmit}>
        {error && <div className="auth-err">{text(error)}</div>}
        <div className="input_phone_wrap">
          <input
            // className="heheinput"
            type="text"
            className={
              phone.length > 4 ? 'phone_input_accent' : 'phone_input_lite'
            }
            name="phone"
            // placeholder={text("Phone")}
            value={phone}
            onChange={handleChange}
            required
          />
        </div>
        {/* <input
                    type="text"
                    value={phone}
                    onChange={handleChange}
                    placeholder={text("Phone")}
                    required
                /> */}
        <input
          type="password"
          placeholder={text("Password")}
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
          {text('Stay logged in')}
        </label>

        <button className="log__btn">{text('Sign in')}</button>

        <div>
          <span>{text('No accaunt?')} </span>
          <Link to="/register" style={{ fontSize: '16px' }}>
            {text('Sign up')}
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
          {text('Forgot password?')}
        </span>
        <Modal
          open={recoveryState !== RecoveryState.IDLE}
          onClose={() => setRecoveryState(RecoveryState.IDLE)}
          size="sm"
          className={modalStyles.modal}
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
                  {text(recoveryError)}
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
            <form className={modalStyles.form} onSubmit={onSendPhone}>
              {recoveryError && (
                <div className={modalStyles.error}>
                  {text(recoveryError)}
                </div>
              )}

              <div className="input_phone_wrap_recovery">
                <input
                  className={`${modalStyles.input} ${
                    recoveryPhone.length > 4
                      ? 'phone_input_accent'
                      : 'phone_input_lite'
                  }`}
                  type="text"
                  name="phone"
                  value={recoveryPhone}
                  onChange={(e) => setRecoveryPhoneHandler(e)}
                  required
                />
              </div>
              <button className={modalStyles.button} type="submit">
                {text("Send")}
              </button>
            </form>
          )}
        </Modal>
      </form>
    </section>
  );
}

export default AuthLogin;
