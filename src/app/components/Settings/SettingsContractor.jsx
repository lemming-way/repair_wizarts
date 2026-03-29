import { useEffect, useState, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import Popup from 'reactjs-popup';

import 'swiper/css';
import 'swiper/css/navigation';

import '../../scss/settings-all.css';
import style from './SettingsContractor.module.css';
import VerificationInput from '../VerificationInput';
import { useLanguage } from '../../state/language';
import { fileToBase64 } from '../../shared/lib/utilities';
import { useUser, updateUser, updateUserAvatar, updateUserPassword } from '../../state/user';

export default function SettingsContractor() {
  const text = useLanguage();
  const inputRef = useRef(null);
  const queryClient = useQueryClient();

  const [deleteAccount, setDeleteAccount] = useState(false);
  const [suceeded, setSuceeded] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [error, setError] = useState('data saved');
  const { user } = useUser();

  const [mask_value, setMask_value] = useState('+7(9');

  const [form, setForm] = useState({
    phone: '',
    email: '',
  });

  useEffect(() => {
    if (user.id) {
      const obj = {
        phone: user.phone || '',
        email: user.email || '',
      };
      setForm(obj);
    }
    if (user.avatar) {
      setPreviewUrl(user.avatar);
    }
  }, [user]);

  useEffect(() => {
    document.title = text('Settings');
  }, [text]);

  // Early return if no user ID
  if (!user.id) {
    return null;
  }

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

  const getFormAttrs = (field) => {
    const attrs = {};

    attrs.value = form[field];
    attrs.onChange = (e) => correctPhoneNumder(e);

    return attrs;
  };

  const onSubmit = (e) => {
    e.preventDefault();

    const promises = [
      updateUser(queryClient, form),
    ];
    if (form.password?.length > 0 && form.new_password?.length > 0) {
      promises.push( updateUserPassword(queryClient, form) );
    }

    Promise.all( promises )
      .then( () => {
        setSuceeded(true);
        setError('');

      } )
      .catch( err => {
        setError(err.message);
        setSuceeded(false);
      } );
  };
  
  const onDelete = (e) => {
    // todo: Сделать не полное удаление профиля, а удаление с биржи как мастера.
    return;
  }

  const onProfilePicUpdate = async (e) => {
    e.preventDefault();
    const file = inputRef.current?.files[0];

    if (!file) {
      setError('No file selected');
      return;
    }
    try {
      await updateUserAvatar(queryClient, file);

      setSuceeded(true);
      setError('');
      inputRef.current.value = '';
    } catch (err) {
      setSuceeded(false);
      setError(err.message || text('An error occurred while uploading'));
    }
  };
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const base64 = await fileToBase64(file);
      setPreviewUrl(base64); // 👈 показываем новое фото сразу
    }
  };

  return (
    <>
      <div className={`mini-main df ${style.form_wrap_flex}`}>
        <form onSubmit={onSubmit}>
          <div className={`input-wrap ${style.form}`}>
            {suceeded && (
              <div className="succeed-v">{text('Data updated successfully')}</div>
            )}
            {error && <div className={`auth-err ${style.error}`}>{text(error)}</div>}

            <div className="height">
              <VerificationInput
                isConfirmed={user.isPhoneVerified}
                {...getFormAttrs('phone')}
                value={form.phone || ''}
                onChangeMask={correctPhoneNumder}
              />
            </div>
            <VerificationInput
              isEmail
              isConfirmed={user.isEmailVerified}
              value={form.email || ''}
              onChangeMask={(e) =>
                setForm((prev) => ({ ...prev, email: e.target.value }))
              }
              {...getFormAttrs('email')}
            />
            <div className="height">
              <input type="text" placeholder={text('New password')} />
              {/* <img src="/img/img-eye.png" alt="" className="eye img"/> */}
            </div>
            <div className="height">
              <input type="text" placeholder={text('Password confirmation')} />
              {/* <img src="/img/img-almost-eye.png" alt="" className="almost-eye img" /> */}
            </div>
            <label className="checkbox">
              <input
                type="checkbox"
                checked={form.is_active}  // todo: связать с u_active
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    is_active: e.target.value,  // todo: связать с u_active
                  }))
                }
              />
              {text('Receive orders')}
            </label>
            <div className={style.buttons_row}>
              <button type="submit" className="goooSaveButton">
                {text('Save')}
              </button>
              <button
                type="button"
                style={{ backgroundColor: 'unset', color: '#D9573B' }}
                className="goooSaveButton"
                onClick={() => setDeleteAccount(true)}
              >
                {text('Delete account')}
              </button>
              <Popup
                open={deleteAccount}
                onClose={() => setDeleteAccount(false)}
                className="delete-modal"
              >
                <h3 className="delete-modal__title">
                  {text('Confirm account deletion')}
                </h3>
                <p className="delete-modal__info">{text('All your data will be lost')}</p>
                <div className="delete-modal__actions">
                  <button
                    className="delete-modal__button"
                    style={{
                      backgroundColor: 'unset',
                      border: '1px solid gray',
                      color: 'black',
                    }}
                    onClick={() => setDeleteAccount(false)}
                  >
                    {text('Cancel')}
                  </button>
                  <button className="delete-modal__button" onClick={onDelete}>
                    {text('Confirm deletion')}
                  </button>
                </div>
              </Popup>
            </div>
          </div>
        </form>

        <div className={`photo-wrap ${style.photo_wrap}`}>
          <label htmlFor="prifielLogoUpload">
            <img
              src={previewUrl ? previewUrl : '/img/img-camera.png'}
              alt="avatar"
              className="settings-picture"
            />
          </label>
          <form onSubmit={onProfilePicUpdate}>
            <input
              type="file"
              accept="image/png, image/jpeg"
              style={{ display: 'none' }}
              onChange={handleFileChange}
              className="prifielUpload"
              id="prifielLogoUpload"
              ref={inputRef}
            />
            <div className="links">
              <button className="link-4">{text('Edit')}</button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
