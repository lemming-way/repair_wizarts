import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { updatePassword, updateUser } from '../../services/user.service';
import VerificationInput from '../VerificationInput';
import style from './ProfileFH.module.css';
import { useUserQuery } from '../../hooks/useUserQuery';
import { userKeys } from '../../queries';

const EMPTY_OBJECT = {}

function ProfileFH() {
  const queryClient = useQueryClient();
  const { user } = useUserQuery();
  const currentUser = user || EMPTY_OBJECT;
  const userId = currentUser?.u_id ?? currentUser?.id;
  // const listLinks = [
  //     "/client/settings",
  //     "/client/settings/picture",
  //     "/client/settings/wallet",
  //     "/client/settings/finance",
  //     "/client/settings/balance",
  // ]
  const [succeeded, setSucceeded] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: currentUser.u_name || '',
    lastname: currentUser.u_family || '',
    phone: currentUser.u_phone || '',
    email: currentUser.u_email || '',
  });

  const getFormAttrs = (field) => {
    const attrs = {};

    attrs.value = form[field];
    attrs.onChange = (e) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));

    return attrs;
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (!userId) {
      return;
    }

    updateUser(form, userId)
      .then((v) => {
        setSucceeded(true);
        setError('');
        console.log(v);
        queryClient.invalidateQueries({ queryKey: userKeys.all });
      })
      .catch((err) => console.log(err))
      .catch((err) => {
        setSucceeded(false);
        setError(err.message);
      });
    if (form.password?.length > 0 && form.new_password?.length > 0) {
      updatePassword(form)
        .then((v) => {
          setSucceeded(true);
          setError('');
          console.log(v);
        })
        .catch((err) => {
          setSucceeded(false);
          setError(err.message);
        });
    }
  };
  useEffect(() => {
    if (Object.keys(currentUser) && !form.name) {
      setForm({
        name: currentUser.u_name,
        lastname: currentUser.u_family,
        phone: currentUser.u_phone,
        email: currentUser.u_email,
      });
    }
  }, [currentUser, form.name]);

  useEffect(() => {
    document.title = 'Настройки';
  }, []);

  const [visiblePassword, setVisiblePassword] = useState(false);
  const [visiblePasswordConfirm, setVisiblePasswordConfirm] = useState(false);
  // чтобы телефон подчинялся маске
  const [mask_value, setMask_value] = useState('+7(9');

  function correctPhoneNumder(e) {
    var text = e.target.value;
    let new_text = text;
    // стирание
    if (text.length < mask_value.length) {
      new_text = text;
      if (new_text.length < 4) {
        new_text = '+7(9';
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

    setMask_value(new_text);
  }

  return (
    <>
      {succeeded && (
        <div
          className={`succeed-v ${style.error_block}`}
          style={{ marginTop: '20px', marginBottom: '-30px' }}
        >
          Данные были успешно изменены
        </div>
      )}
      {error && (
        <div
          className={`auth-err ${style.error_block}`}
          style={{ marginTop: '20px', marginBottom: '-30px' }}
        >
          {error}
        </div>
      )}

      <div className="mini-main-2 df">
        <form onSubmit={onSubmit} className="input-wrap-2">
          <input type="text" placeholder="Имя" {...getFormAttrs('name')} />
          <input
            type="text"
            placeholder="Фамилия"
            {...getFormAttrs('lastname')}
          />
          <VerificationInput
            isConfirmed={currentUser.is_phone_verified}
            {...getFormAttrs('phone')}
            mask_value={mask_value}
            onChangeMask={correctPhoneNumder}
          />
          <VerificationInput
            isEmail
            isConfirmed={currentUser.is_email_verified}
            value={form.email || ''}
            {...getFormAttrs('email')}
          />
          <div className={style.input_wrap}>
            <input
              type={visiblePassword ? 'text' : 'password'}
              value={form.password}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, password: e.target.value }))
              }
              placeholder="Текущий пароль"
            />
            <img
              src={
                visiblePassword
                  ? '/img/icons/eye_open.png'
                  : '/img/icons/eye_close.png'
              }
              alt=""
              className={style.password_icon}
              onClick={() => setVisiblePassword((prev) => !prev)}
            />
          </div>
          <div className={style.input_wrap}>
            <input
              value={form.new_password}
              type={visiblePasswordConfirm ? 'text' : 'password'}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, new_password: e.target.value }))
              }
              placeholder="Новый пароль"
            />
            <img
              src={
                visiblePasswordConfirm
                  ? '/img/icons/eye_open.png'
                  : '/img/icons/eye_close.png'
              }
              alt=""
              className={style.password_icon}
              onClick={() => setVisiblePasswordConfirm((prev) => !prev)}
            />
          </div>

          <button type="submit">Сохранить</button>
        </form>
      </div>
    </>
  );
}

export default ProfileFH;
