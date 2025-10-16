import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { updateUserPhoto } from '../../services/user.service';
import './startff.css';
import { useUserQuery } from '../../hooks/useUserQuery';
import { userKeys } from '../../queries';

function App() {
  const queryClient = useQueryClient();
  const { user: queriedUser } = useUserQuery();
  const user = queriedUser || {};
  const userId = user?.u_id;
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
    if (!userId) {
      setError('Пользователь не найден');
      return;
    }
    try {
      const base64 = await convertToBase64(file);
      const answer = await updateUserPhoto(base64, userId);
      console.log(answer);
      setSucceeded(true);
      setError('');
      setPreviewUrl(base64);
      inputRef.current.value = '';
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    } catch (err) {
      setSucceeded(false);
      setError(err.message || 'Произошла ошибка при загрузке');
    }
  };
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const base64 = await convertToBase64(file);
      setPreviewUrl(base64); // 👈 показываем новое фото сразу
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
