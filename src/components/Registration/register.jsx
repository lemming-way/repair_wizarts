import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { registerAsClient } from '../../services/auth.service';
import '../../scss/register.css';
import SERVER_PATH from '../../constants/SERVER_PATH';
import { setToken } from '../../services/token.service';
import { useLanguage } from '../../state/language';

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

function Register() {
  const text = useLanguage();
  const navigate = useNavigate();

  const [error, setError] = useState();
  const [name, setName] = useState('');
  const [lastname, setLastname] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+7(9');
  const [password, setPassword] = useState('');
  const [passwordVerification, setPasswordVerification] = useState('');
  const [accept, setAccept] = useState(false);

  const onSubmit = (e) => {
    e.preventDefault();

    const normalizedPhone = phone.replace(/\D/g, '');

    if (!accept) {
      return setError( 'To continue, you must accept the privacy policy.' );
    }

    if (normalizedPhone.length < 11) {
      return setError( 'The phone number is not fully entered.' );
    }

    return registerAsClient({
      u_name: name + ' ' + lastname,
      u_phone: normalizedPhone,
      u_email: email,
      u_password: password,
    })
      .then((data) => {
        if (data.code === '404') return setError(data.message);
        setToken({
          hash: data.data.u_hash,
          token: data.data.token,
          user: {
            u_id: data.data.u_id,
            u_name: name + ' ' + lastname,
            u_phone: phone,
            u_email: email,
            u_password: password,
          },
        });
        navigate('/');
      })
      .catch((err) => setError(err.message));
  };

  useEffect(() => {
    document.title = text('Registration');
  }, [text]);

  const setPhoneHandler = (event) => {
    // нельзя вводить не числа и больше 11 символов
    const rawValue = event.target.value;
    const inputValue = rawValue.slice(1);
    if (/[^0-9()-]/.test(inputValue) && inputValue !== '') {
      setError('Please enter only digits in the phone number.');
    }
    else {
      setError('');
    }

    const n = correctPhoneNumber(rawValue, phone);
    setPhone(n);
  };

  return (
    <section className="register">
      <h1>{text('Registration')}</h1>
      <form onSubmit={onSubmit}>
        {error && <div className="auth-err">{text(error)}</div>}

        <input
          required
          type="text"
          onChange={(e) => setName(e.target.value)}
          value={name}
          className="heheinput"
          placeholder={text("First Name")}
        />
        <input
          required
          type="text"
          value={lastname}
          onChange={(e) => setLastname(e.target.value)}
          className="heheinput"
          placeholder={text("Last Name")}
        />
        <input
          required
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="heheinput"
          placeholder={text("Email")}
        />
        <div className="input_phone_wrap">
          <input
            className={`heheinput ${
              phone.length > 4 ? 'phone_input_accent' : 'phone_input_lite'
            }`}
            type="text"
            name="phone"
            placeholder={text("Phone")}
            value={phone}
            onChange={(e) => setPhoneHandler(e)}
            required
          />
        </div>
        <input
          required
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="heheinput"
          placeholder={text("Password")}
        />
        <input
          required
          type="password"
          value={passwordVerification}
          onChange={(e) => setPasswordVerification(e.target.value)}
          className="heheinput"
          placeholder={text("Confirm Password")}
        />
        <div className="rel">
          <input
            type="checkbox"
            id="really"
            checked={accept}
            onChange={(e) => setAccept(e.target.checked)}
          />
          <label htmlFor="really">
            {text('I have read and agree to the terms of the')}
            <a
              style={{
                textDecoration: 'underline',
                marginLeft: '5px',
                color: '#000',
              }}
              target="_blank"
              rel="noopener noreferrer"
              href={SERVER_PATH + 'files/privacy-policy.pdf'}
            >
              {text('privacy_policy')}
            </a>
          </label>
        </div>
        <button>{text('Register')}</button>
      </form>
    </section>
  );
}

export default Register;
