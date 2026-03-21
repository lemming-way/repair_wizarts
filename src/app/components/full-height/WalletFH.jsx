import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { fileToBase64 } from '../../shared/lib/utilities';
import { useUser, updateUserAvatar } from '../../state/user';
import './startff.css';

function App() {
  const queryClient = useQueryClient();
  const { user } = useUser();
  const [succeeded, setSucceeded] = useState(false);
  const [error, setError] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    document.title = 'Настройки';
    if (user.avatar) {
      setPreviewUrl(user.avatar);
    }
  }, [user.avatar]);

  const onProfilePicUpdate = async (e) => {
    e.preventDefault();
    const file = inputRef.current?.files[0];

    if (!file) {
      setError('Файл не выбран');
      return;
    }
    if (!user.id) {
      setError('Пользователь не найден');
      return;
    }
    try {
      const answer = await updateUserAvatar(queryClient, file);
      console.log(answer);
      setSucceeded(true);
      setError('');
      setPreviewUrl(await fileToBase64(file));
      inputRef.current.value = '';
    } catch (err) {
      setSucceeded(false);
      setError(err.message || 'Произошла ошибка при загрузке');
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
            onChange={handleFileChange}
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
