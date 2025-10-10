import { useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import style from './SettingsMaster.module.css';
import SERVER_PATH from '../../constants/SERVER_PATH';
import { updateUserPhoto } from '../../services/user.service';
import { useUserQuery } from '../../hooks/useUserQuery';
import { userKeys } from '../../queries';

const Photo = () => {
  const queryClient = useQueryClient();
  const { user } = useUserQuery();
  const currentUser = user || {};
  const userId = currentUser?.u_id ?? currentUser?.id;
  const inputRef = useRef(null);
  const [suceeded, setSuceeded] = useState(false);
  const [error, setError] = useState('');

  const onProfilePicUpdate = async (e) => {
    e.preventDefault();
    const file = inputRef.current.files[0];

    if (file) {
      try {
        if (!userId) {
          throw new Error('Пользователь не найден');
        }
        await updateUserPhoto(file, userId);
        setSuceeded(true);
        setError('');
        queryClient.invalidateQueries({ queryKey: userKeys.all });
      } catch (err) {
        setError(err.message);
        setSuceeded(false);
      }
    }
  };

  return (
    <div className={`photo-wrap ${style.photo_wrap}`}>
      {suceeded && (
        <div className="success-message">Фото успешно обновлено!</div>
      )}
      {error && <div className="error-message">{error}</div>}

      <label htmlFor="profileLogoUpload">
        <img
          src={
            currentUser.u_photo
              ? currentUser.u_photo
              : currentUser.avatar
              ? SERVER_PATH + currentUser.avatar
              : '/img/img-camera.png'
          }
          alt="Фото профиля"
          className="settings-picture"
        />
      </label>

      <form onSubmit={onProfilePicUpdate}>
        <input
          type="file"
          accept="image/png, image/jpeg"
          style={{ display: 'none' }}
          id="profileLogoUpload"
          ref={inputRef}
        />
        <div className="links">
          <button type="submit" className="link-4">
            Изменить
          </button>
        </div>
      </form>
    </div>
  );
};

export default Photo;
