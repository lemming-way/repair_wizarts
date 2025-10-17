import { useState, useEffect } from 'react';
import { Popup } from 'reactjs-popup';

import mailIcon from '../img/mail.png';
import phoneIcon from '../img/mobile-phone.png';
import {
  sendEmailCode,
  sendEmailVerificationCode,
  sendPhoneCode,
  sendPhoneVerificationCode,
} from '../services/verification.service';
import '../scss/verification-input.css';

const VerificationInput = (props) => {
  const { isConfirmed, isEmail, onChangeMask, value } = props;

  const sendVerificationCode = isEmail
    ? sendEmailVerificationCode
    : sendPhoneVerificationCode;

  const [isModalOpen, setModalOpen] = useState(false);
  const [code, setCode] = useState('');

  useEffect(() => {
    if (!isModalOpen) {
      return;
    }

    const send = async () => {
      try {
        if (isEmail) {
          const response = await sendEmailCode();
          console.log(response);
          return;
        }

        if (!value) {
          return;
        }

        const response = await sendPhoneCode(value);
        console.log(response);
      } catch (error) {
        console.error(error);
      }
    };

    send();
  }, [isModalOpen, isEmail, value]);

  const onSubmit = (e) => {
    e.preventDefault();
    sendVerificationCode(code).then((v) => {
      console.log(v);
      setModalOpen(false);
    });
  };

  return (
    <div className="mail-input">
      <input
        disabled={!isEmail}
        className="mail-input__input"
        placeholder={isEmail ? 'Электронная почта' : 'Телефон'}
        {...(isEmail ? { value } : {})}
        onChange={onChangeMask}
      />
      {!isConfirmed && (
        <>
          <button
            disabled={true}
            className="mail-input__confirm"
            type="button"
            onClick={() => setModalOpen(true)}
          >
            <img
              className="mail-input-confirm__img"
              src={isEmail ? mailIcon : phoneIcon}
              alt=""
            />
          </button>
          <Popup open={isModalOpen} onClose={() => setModalOpen(false)}>
            <div className="mail-input__modal">
              <button className="mail-input-modal__close"></button>
              <div className="mail-input-modal__content">
                <h3 className="mail-input-modal__title">Подтверждение почты</h3>
                <p className="mail-input-modal__description">
                  На вашу почту {'{email}'} пришло письмо с кодом подтверждения.
                  Чтобы подтвердить аккаунт введите этот код в форму,
                  находящуюся ниже.
                </p>
                <div className="mail-input-modal__form">
                  <input
                    className="mail-input-modal__input"
                    value={code}
                    placeholder="Код подтверждения"
                    onChange={(e) =>
                      e.target.value.length <= 6 && setCode(e.target.value)
                    }
                  />
                  <button
                    className="mail-input-modal__button"
                    onClick={onSubmit}
                  >
                    Подтвердить
                  </button>
                </div>
              </div>
            </div>
          </Popup>
        </>
      )}
    </div>
  );
};

export default VerificationInput;
