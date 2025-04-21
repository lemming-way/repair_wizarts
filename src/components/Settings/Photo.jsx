import { useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { selectUser } from '../../slices/user.slice';
import { updateUserPhoto } from '../../services/user.service';
import SERVER_PATH from '../../constants/SERVER_PATH';
import style from './SettingsMaster.module.css';

const Photo = () => {
  const user = useSelector(selectUser);
  const inputRef = useRef(null);
  const [suceeded, setSuceeded] = useState(false);
  const [error, setError] = useState('');

  const onProfilePicUpdate = async (e) => {
    e.preventDefault();
    const file = inputRef.current.files[0];

    if (file) {
      try {
        await updateUserPhoto(file, user.id);
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
          src={user.avatar ? SERVER_PATH + user.avatar : '/img/img-camera.png'}
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
