import React, {useState} from 'react';

import { Modal } from '../../../shared/ui/Modal';
import { PhoneNumber } from './PhoneNumber';
import { useLanguage } from '../../../state/language';
import modalStyles from './PasswordRecoveryModal.module.scss';
import {
  recoverPassword,
  recoverPasswordSend,
  recoverPasswordVerify
} from "../../../services/user.service";

interface PasswordRecoveryModalProps {
  open: boolean;
  onClose: () => void;
}

const RecoveryState = {
  IDLE: 0,
  PHONE: 1,
  CODE: 2
}

const PasswordRecoveryModal: React.FC<PasswordRecoveryModalProps> = ({ open, onClose }) => {
  const text = useLanguage();

  const [recoveryState, setRecoveryState] = useState(RecoveryState.IDLE);
  const [recoveryError, setRecoveryError] = useState("");
  const [recoveryUser, setRecoveryUser] = useState("");
  const [recoveryPassword, setRecoveryPassword] = useState("");
  const [recoveryPhone, setRecoveryPhone] = useState("");
  const [recoveryCode, setRecoveryCode] = useState("");

  const onSendPhone = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    return recoverPassword({ phone: recoveryPhone })
      .then((res) => {
        setRecoveryUser(res.user_id);
        setRecoveryState(RecoveryState.CODE);
        setRecoveryError("");
      })
      .catch((err) => setRecoveryError(err.message));
  };

  const onSendCode = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const payload = {
      code: recoveryCode,
      user: recoveryUser
    };

    return recoverPasswordVerify(payload)
      .then(() => recoverPasswordSend({
        user_id: recoveryUser,
        code: recoveryCode,
        password: recoveryPassword
      }))
      .then(() => {
        setRecoveryError("");
        setRecoveryState(RecoveryState.IDLE);
        onClose(); // Закрываем модальное окно после успешного восстановления
      })
      .catch((err) => {
        if (typeof err.message === "string") {
          return setRecoveryError(err.message);
        }

        setRecoveryError(text("Unable to process the request"));
      });
  };

  React.useEffect(() => {
    if (open) {
      setRecoveryState(RecoveryState.PHONE); // При открытии модального окна начинаем с ввода телефона
      setRecoveryError("");
      setRecoveryPhone("");
      setRecoveryCode("");
      setRecoveryPassword("");
      setRecoveryUser("");
    }
  }, [open]);

  return (
    <Modal
      className={modalStyles.modal}
      open={open}
      onClose={onClose}
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
            type="password"
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
            <PhoneNumber
              className={`${modalStyles.input} ${
                recoveryPhone.length > 4
                  ? 'phone_input_accent'
                  : 'phone_input_lite'
              }`}
              placeholder={text("Phone number")}
              onChange={setRecoveryPhone}
              value={recoveryPhone}
            />
          </div>
          <button className={modalStyles.button} type="submit">
            {text("Send")}
          </button>
        </form>
      )}
    </Modal>
  );
};

export default PasswordRecoveryModal;
