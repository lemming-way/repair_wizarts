import { useState } from 'react';
import { useRef } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';

import style from './AddOrderModal.module.css';
import { updateRequest } from '../../../services/request.service';
import { getToken } from '../../../services/token.service';
import { selectUser } from '../../../slices/user.slice';
import { useLanguage } from '../../../state/language';

// Вспомогательная функция для преобразования файла в base64
const fileToBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
// Функция для загрузки фото
const uploadPhoto = async (file) => {
  const base64String = await fileToBase64(file);
  const token = getToken();
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
      // НЕ указываем Content-Type, fetch сам поставит нужный для URLSearchParams
    },
  );
  const result = await response.json();
  return `https://ibronevik.ru/taxi/api/v1/dropbox/file/${result.data.dl_id}`;
};

export default function AddOrderModal({
  setVisibleAddOrder,
  setVisibleOkModal,
  currentOrder,
}) {
  const text = useLanguage();
  const user = Object.values(useSelector(selectUser)?.data?.user || {})[0];
  const { id } = useParams();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState('');
  const [deadline, setDeadline] = useState('');
  const [photos, setPhotos] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef(null);

  const handleSubmit = async () => {
    setIsUploading(true);
    try {
      // Загрузка всех фото
      const photoUrls = [];
      for (const photo of photos) {
        if (photo.file) {
          const url = await uploadPhoto(photo.file);
          photoUrls.push(url);
        }
      }
      const currentExtraOrders = Array.isArray(
        currentOrder.b_options.extra_orders,
      )
        ? currentOrder.b_options.extra_orders
        : [];
      const newExtraOrder = {
        id: Math.floor(Math.random() * 1000000),
        title,
        description,
        client_price: budget,
        time: deadline,
        photoUrls,
      };
      await updateRequest(id, {
        extra_orders: [...currentExtraOrders, newExtraOrder],
      });
      setVisibleAddOrder(false);
      setVisibleOkModal(true);
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
        <h2 className={style.heading}>{text('Propose an order')}</h2>
        {(user?.u_details?.balance || 0) < 500 && (
          <p className={style.error}>
            {text('Please top up your balance by 500 rubles')}
          </p>
        )}
        <div>
          <input
            className={style.input_heading}
            type="text"
            placeholder={text('Title')}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div style={{ position: 'relative' }}>
          <p className={style.textarea_description}>{text('2000 characters, min 100')}</p>
          <textarea
            className={style.textarea}
            rows={8}
            placeholder={text('Write what needs to be done')}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          ></textarea>
        </div>

        <div className={style.row1}>
          <div>
            <p className={style.mini_heading}>{text('Budget')}</p>
            <p className={style.balance}>
              {text('Balance')} {user?.u_details?.balance || 0} ₽
            </p>
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
            <p className={style.mini_heading}>{text('Term')}</p>
            <select
              className={style.select}
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            >
              <option value="" disabled>
                {text('Select')}
              </option>
              <option value="ready">{text('Ready to wait')}</option>
              <option value="1">{text('1 hour')}</option>
              <option value="2">{text('2 hours')}</option>
              <option value="3">{text('3 hours')}</option>
              <option value="4">{text('4 hours')}</option>
              <option value="6">{text('6 hours')}</option>
              <option value="8">{text('8 hours')}</option>
              <option value="24">{text('24 hours')}</option>
              <option value="72">{text('3 days')}</option>
              <option value="168">{text('7 days')}</option>
            </select>
          </div>
        </div>

        <div className={style.block_photo}>
          <p className={style.heading_h3}>{text('Add photos')}</p>
          <div
            className={style.add_photo}
            onClick={() => inputRef.current && inputRef.current.click()}
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
                const files = Array.from(e.target.files);
                const newPhotos = files.map((file) => ({
                  file,
                  url: URL.createObjectURL(file),
                }));
                setPhotos((prev) => [...prev, ...newPhotos].slice(0, 10));
              }}
            />
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            {photos.map((photo, idx) => (
              <div key={idx} style={{ position: 'relative' }}>
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
        </div>

        <div className={style.buttons}>
          <div
            className={style.button}
            onClick={isUploading ? undefined : handleSubmit}
          >
            {isUploading ? text('Loading...') : text('Send')}
          </div>
          <div
            className={style.button_back}
            onClick={() => setVisibleAddOrder(false)}
          >
            {text('Back')}
          </div>
        </div>
      </div>
    </div>
  );
}
