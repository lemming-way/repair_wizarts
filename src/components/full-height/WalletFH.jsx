import { useEffect, useRef, useState } from 'react';
import { updateUserPhoto } from '../../services/user.service';
import { useSelector } from 'react-redux';
import { selectUser } from '../../slices/user.slice';
import './startff.css';
import SERVER_PATH from '../../constants/SERVER_PATH';

function App() {
  const user =
    Object.values(useSelector(selectUser)?.data?.user || {})[0] || {};
  const [succeeded, setSucceeded] = useState(false);
  const [error, setError] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    document.title = 'Настройки';
    if (user.u_photo) {
      setPreviewUrl(user.u_photo);
    }
  }, [user.u_photo]);

  const onProfilePicUpdate = async (e) => {
    e.preventDefault();
    const file = inputRef.current?.files[0];

    if (!file) {
      setError('Файл не выбран');
      return;
    }

    try {
      const base64 = await convertToBase64(file);
      await updateUserPhoto(base64, user.id);

      setSucceeded(true);
      setError('');
      setPreviewUrl(base64); // обновляем превью аватара
      inputRef.current.value = ''; // очищаем input
    } catch (err) {
      setSucceeded(false);
      setError(err.message || 'Произошла ошибка при загрузке');
    }
  };

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  return (
    <div className="block-info-12">
      {error && (
        <div className="auth-err" style={{ marginTop: '10px' }}>
          {error}
        </div>
      )}
      {succeeded && (
        <div className="succeed-v" style={{ marginTop: '10px' }}>
          Данные были успешно изменены
        </div>
      )}
      <div className="photo-taking">
        <form onSubmit={onProfilePicUpdate} style={{ marginTop: '20px' }}>
          <label htmlFor="upfile" style={{ marginBottom: '20px' }}>
            <img
              src={previewUrl || '/img/img-camera.png'}
              alt="user"
              className="settings-picture"
            />
          </label>
          <input
            type="file"
            accept="image/png, image/jpeg"
            id="upfile"
            ref={inputRef}
            style={{ display: 'none' }}
          />
          <div className="block-btn bgpuherpte df">
            <button className="btn-9 goooSaveButton" type="submit">
              Изменить
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default App;
