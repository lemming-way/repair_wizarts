import { useState } from 'react';
import style from './AddFeedbackModal.module.css';
import appFetch from '../../../utilities/appFetch';

export default function AddFeedbackModal({
  setVisibleAddFeedback,
  setVisibleFinalOrder,
  id, // <-- идентификатор заказа/поездки
}) {
  const [countStar, setCountStar] = useState(0);
  const [comment, setComment] = useState('');

  const handleSubmit = async () => {
    try {
      const data = await appFetch(`drive/get/${id}`, {
        body: {
          u_a_role: 1,
          action: 'set_rate',
          value: countStar + 1,
          comment,
        },
      });
      console.log(data);
      if (data?.code === '200') {
        setVisibleAddFeedback(false);
        setVisibleFinalOrder(true);
      } else {
        alert('Ошибка при отправке отзыва');
      }
    } catch (error) {
      console.error(error);
      alert('Произошла ошибка сети');
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
          Поздравляем вы завершаете заказ, пожалуйста оставьте отзыв
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
            placeholder="В тексте не должно быть оскорблений и мата."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </div>

        <div className={style.block_photo}>
          <p className={style.heading_h3}>Добавить фотографии</p>
          <div className={style.add_photo}>
            <img src="/img/icons/camera.png" alt="" />
          </div>
        </div>

        <div className={style.buttons}>
          <div className={style.button} onClick={handleSubmit}>
            Отправить
          </div>
          <div
            className={style.button_back}
            onClick={() => setVisibleAddFeedback(false)}
          >
            Назад
          </div>
        </div>
      </div>
    </div>
  );
}
