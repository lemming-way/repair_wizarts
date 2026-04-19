import React, {useState} from 'react';

import { Modal } from 'app/shared/ui/Modal';
import { PhoneNumber } from '../PhoneNumber';
import { useLanguage } from 'app/state/language';
import modalStyles from './PasswordRecoveryModal.module.scss';
import { recoverPassword } from 'app/state/user';

interface PasswordRecoveryModalProps {
  open: boolean;
  onClose: () => void;
}

const PasswordRecoveryModal: React.FC<PasswordRecoveryModalProps> = ({ open, onClose }) => {
  const text = useLanguage();

  const [recoveryError, setRecoveryError] = useState("");
  const [recoveryPhone, setRecoveryPhone] = useState("");

  const onSendPhone = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    return recoverPassword(recoveryPhone)
      .then(() => {
        setRecoveryError("");
      })
      .catch((err) => setRecoveryError(err.message));
  };

  React.useEffect(() => {
    if (open) {
      setRecoveryError("");
      setRecoveryPhone("");
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
    </Modal>
  );
};

export default PasswordRecoveryModal;
