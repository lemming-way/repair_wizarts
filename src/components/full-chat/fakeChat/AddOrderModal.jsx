import { useRef, useState } from 'react';
import { useParams } from 'react-router-dom';

import style from './AddOrderModal.module.css';
import { updateRequest } from '../../../services/request.service';
import { getToken } from '../../../services/token.service';
import { useUserQuery } from '../../../hooks/useUserQuery';

const RANDOM_ID_MAX = 1_000_000;

const fileToBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });

const uploadPhoto = async (file) => {
  const base64String = await fileToBase64(file);
  const token = getToken();

  if (!token?.token || !token?.hash) {
    return null;
  }

  const body = new URLSearchParams({
    token: token.token,
    u_hash: token.hash,
    file: JSON.stringify({
      base64: base64String,
      name: file.name,
    }),
  });

  const response = await fetch(
    'https://ibronevik.ru/taxi/api/v1/dropbox/file/',
    {
      method: 'POST',
      body,
    },
  );

  const result = await response.json();

  return result?.data?.dl_id
    ? `https://ibronevik.ru/taxi/api/v1/dropbox/file/${result.data.dl_id}`
    : null;
};

export default function AddOrderModal({
  setVisibleAddOrder,
  setVisibleOkModal,
  currentOrder = {},
}) {
  const { user = {} } = useUserQuery();
  const { id } = useParams();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState('');
  const [deadline, setDeadline] = useState('');
  const [photos, setPhotos] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  const inputRef = useRef(null);

  const balance = Number(user?.u_details?.balance ?? 0);
  const extraOrders = Array.isArray(currentOrder?.b_options?.extra_orders)
    ? currentOrder.b_options.extra_orders
    : [];

  const handleSubmit = async () => {
    if (isUploading) {
      return;
    }

    setIsUploading(true);
    try {
      const photoUrls = [];

      for (const photo of photos) {
        if (!photo?.file) {
          continue;
        }
        const uploadedUrl = await uploadPhoto(photo.file);
        if (uploadedUrl) {
          photoUrls.push(uploadedUrl);
        }
      }

      const newExtraOrder = {
        id: Math.floor(Math.random() * RANDOM_ID_MAX),
        title,
        description,
        client_price: budget,
        time: deadline,
        photoUrls,
      };

      await updateRequest(id, {
        extra_orders: [...extraOrders, newExtraOrder],
      });

      setVisibleAddOrder(false);
      setVisibleOkModal(true);
      setTitle('');
      setDescription('');
      setBudget('');
      setDeadline('');
      setPhotos([]);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className={style.wrap}>
      <div className={style.block}>
        <div className={style.close} onClick={() => setVisibleAddOrder(false)}>
          <img src="/img/close.svg" alt="" />
        </div>
        <h2 className={style.heading}>Предложить заказ</h2>
        {balance < 500 && (
          <p className={style.error}>
            Пожалуйста пополните баланс на 500 рублей
          </p>
        )}
        <div>
          <input
            className={style.input_heading}
            type="text"
            placeholder="Заголовок"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div style={{ position: 'relative' }}>
          <p className={style.textarea_description}>2000 символов, мин 100</p>
          <textarea
            className={style.textarea}
            rows={8}
            placeholder="Напишите, что требуется выполнить"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className={style.row1}>
          <div>
            <p className={style.mini_heading}>Бюджет</p>
            <p className={style.balance}>Баланс {balance} ₽</p>
            <div className={style.icon}>
              <input
                className={style.input_balance}
                type="text"
                placeholder="500 - 20000"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
              />
            </div>
          </div>
          <div style={{ position: 'relative' }}>
            <img className={style.icon2} src="/img/icons/clock.png" alt="" />
            <p className={style.mini_heading}>Срок</p>
            <select
              className={style.select}
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            >
              <option value="" disabled>
                Выберите
              </option>
              <option value="ready">Готов ждать</option>
              <option value="1">1 час</option>
              <option value="2">2 часа</option>
              <option value="3">3 часа</option>
              <option value="4">4 часа</option>
              <option value="6">6 часов</option>
              <option value="8">8 часов</option>
              <option value="24">24 часа</option>
              <option value="72">3 дня</option>
              <option value="168">7 дней</option>
            </select>
          </div>
        </div>

        <div className={style.block_photo}>
          <p className={style.heading_h3}>Добавить фотографии</p>
          <div
            className={style.add_photo}
            onClick={() => inputRef.current?.click()}
            style={{ cursor: 'pointer' }}
          >
            <img src="/img/icons/camera.png" alt="" />
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              multiple
              style={{ display: 'none' }}
              onChange={(e) => {
                const files = Array.from(e.target.files || []);
                const newPhotos = files.map((file) => ({
                  file,
                  url: URL.createObjectURL(file),
                }));
                setPhotos((prev) => [...prev, ...newPhotos].slice(0, 10));
              }}
            />
          </div>
          {photos.length > 0 && (
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              {photos.map((photo, idx) => (
                <div key={photo.url} style={{ position: 'relative' }}>
                  <img
                    src={photo.url}
                    alt="preview"
                    style={{
                      width: 60,
                      height: 60,
                      objectFit: 'cover',
                      borderRadius: 8,
                    }}
                  />
                  <button
                    type="button"
                    style={{
                      position: 'absolute',
                      top: 0,
                      right: 0,
                      background: 'rgba(255,255,255,0.7)',
                      border: 'none',
                      cursor: 'pointer',
                      borderRadius: '50%',
                    }}
                    onClick={() =>
                      setPhotos((prev) => prev.filter((_, i) => i !== idx))
                    }
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className={style.buttons}>
          <div
            className={style.button}
            onClick={handleSubmit}
            aria-disabled={isUploading}
          >
            {isUploading ? 'Загрузка...' : 'Отправить'}
          </div>
          <div
            className={style.button_back}
            onClick={() => setVisibleAddOrder(false)}
          >
            Назад
          </div>
        </div>
      </div>
    </div>
  );
}
