import { useState } from 'react';

import style from './AddFeedbackModal.module.css';
import { useLanguage } from '../../../state/language';
import { AnyImage, getKeyFor } from '../../../shared/ui';

export default function AddFeedbackModal({
  setVisibleAddFeedback,
  setVisibleFinalOrder,
  id, // <-- идентификатор заказа/поездки
}) {
  const text = useLanguage();
  const [countStar, setCountStar] = useState(0);
  const [comment, setComment] = useState('');
  const [photos, setPhotos] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  const handleSubmit = async () => {
    setIsUploading(true);
    try {
      // Заглушка для отправки отзыва и фото
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Отправка отзыва (заглушка):', {
        orderId: id,
        rating: countStar + 1,
        comment,
        photos: photos.map(file => file.name),
      });

      setVisibleAddFeedback(false);
      setVisibleFinalOrder(true);
    } catch (error) {
      console.error(error);
      alert(text('Произошла ошибка при отправке отзыва.'));
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className={style.wrap}>
      <div className={style.block}>
        <div
          className={style.close}
          onClick={() => setVisibleAddFeedback(false)}
        >
          <img src="/img/close.svg" alt="" />
        </div>

        <h2 className={style.heading}>
          {text('Congratulations, you are completing your order, please leave a review')}
        </h2>

        <div className={style.stars}>
          {[1, 2, 3, 4, 5].map((_, i) => (
            <div
              key={i}
              className={i <= countStar ? style.yellow : ''}
              onClick={() => setCountStar(i)}
            >
              <img src="/img/icons/yellow-star.png" alt="" />
            </div>
          ))}
        </div>

        <div style={{ position: 'relative' }}>
          <textarea
            className={style.textarea}
            rows={8}
            placeholder={text("The text should not contain insults or profanity.")}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </div>

        <div className={style.block_photo}>
          <p className={style.heading_h3}>{text("Add photos")}</p>
          <div className={style.add_photo}>
            <label>
              <img src="/img/icons/camera.png" alt="" />
              <input
                type="file"
                accept="image/*"
                multiple
                style={{ display: 'none' }}
                onChange={(e) => {
                  const files = Array.from(e.target.files);
                  setPhotos((prev) => [...prev, ...files].slice(0, 10));
                }}
              />
            </label>
          </div>
          <div
            className={style.preview_row}
            style={{ display: 'flex', gap: 8, marginTop: 8 }}
          >
            {photos.map((photo, idx) => (
              <div key={getKeyFor(photo)} style={{ position: 'relative' }}>
                <AnyImage
                  src={photo}
                  alt={`preview ${idx}`}
                  className={style.previewImage}
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
            onClick={() => setVisibleAddFeedback(false)}
          >
            {text('Back')}
          </div>
        </div>
      </div>
    </div>
  );
}
