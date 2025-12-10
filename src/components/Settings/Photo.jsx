import { useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import style from './SettingsContractor.module.css';
import { useUser, updateUserAvatar } from '../../state/user';

const Photo = () => {
  const queryClient = useQueryClient();
  const { user } = useUser();
  const inputRef = useRef(null);
  const [suceeded, setSuceeded] = useState(false);
  const [error, setError] = useState('');

  // Early return if no user ID
  if (!user.id) {
    return null;
  }

  const onProfilePicUpdate = async (e) => {
    e.preventDefault();
    const file = inputRef.current.files[0];

    if (file) {
      try {
        await updateUserAvatar(queryClient, file);
        setSuceeded(true);
        setError('');
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
          src={user.avatar || '/img/img-camera.png'}
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
