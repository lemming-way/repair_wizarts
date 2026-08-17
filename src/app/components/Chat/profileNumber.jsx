import { useEffect, useState } from 'react';
import '../../styles/legacy/profileNumber.css';
import '../../styles/legacy/swiper.css';

import ModalAddCommentMini from './ModalAddCommentMini';
import ModalDelete from './ModalDelete';
import style from './profileNumber.module.css';
import ProfileSlider from '../profileNumberClient/ProfileSlider';
//~ import { useUser } from '../../state/user';

function App() {
  //~ const { user } = useUser();
  const [visibleModalDelete, setVisibleModalDelete] = useState(false);
  const [visibleModalAddComment, setVisibleModalAddComment] = useState(false);

  // Заглушка для комментариев, todo: заменить на хук для получения реальных отзывов
  const feedback = [
    {
      booking_id: 'stub_1',
      booking_title: 'Тестовый заказ 1',
      created_at: new Date().toISOString(),
      rating: 5,
      text: 'Отличная работа!',
      comment: 'Очень доволен качеством выполненных работ и оперативностью.',
      photos: [],
      author: { u_name: 'Тестовый Клиент 1', u_photo: '/img/img-camera.png' },
    },
    {
      booking_id: 'stub_2',
      booking_title: 'Тестовый заказ 2',
      created_at: new Date(Date.now() - 86400000).toISOString(), // Вчера
      rating: 4,
      text: 'Хорошо, но есть куда расти',
      comment: 'В целом все устроило, но были небольшие задержки.',
      photos: [],
      author: { u_name: 'Тестовый Клиент 2', u_photo: '/img/img-camera.png' },
    },
    {
      booking_id: 'stub_3',
      booking_title: 'Тестовый заказ 3',
      created_at: new Date(Date.now() - 2 * 86400000).toISOString(), // Позавчера
      rating: 3,
      text: '',
      comment: 'Комментарий не указан',
      photos: [],
      author: { u_name: 'Тестовый Клиент 3', u_photo: '/img/img-camera.png' },
    },
  ];

  useEffect(() => {
    document.title = 'Отзывы';
  }, []);

  const totalCount = feedback.length;
  const ratingCounts = [0, 0, 0, 0, 0];
  feedback.forEach((item) => {
    if (item.rating >= 1 && item.rating <= 5) {
      ratingCounts[item.rating - 1]++;
    }
  });

  const averageRating = totalCount
    ? (
        feedback.reduce((sum, item) => sum + (item.rating || 0), 0) / totalCount
      ).toFixed(1)
    : '0.0';

  return (
    <>
      {visibleModalDelete && (
        <ModalDelete setVisibleModalDelete={setVisibleModalDelete} />
      )}
      {visibleModalAddComment && (
        <ModalAddCommentMini
          setVisibleModalAddComment={setVisibleModalAddComment}
        />
      )}

      <section className={style.page}>
        <h1 className={style.title}>Мои отзывы</h1>

        <div className={style.ratingCard}>
          <div className={style.ratingTop}>
            <strong>{averageRating}</strong>
            <div className={style.stars_row}>
          {Array.from({ length: 5 }, (_, i) => (
            <img
              key={i}
              src="/img/img-star.png"
                  alt=""
                  className={i < Math.round(averageRating) ? '' : style.starMuted}
            />
          ))}
            </div>
            <span>На основании {totalCount} оценок</span>
          </div>

          <div className={style.ratingLines}>
            {[5, 4, 3, 2, 1].map((star) => (
              <div className={style.ratingRow} key={star}>
                <span className={style.ratingLabel}>{star} ★</span>
                <div className={style.ratingTrack}>
                  <span
                    className={style.ratingFill}
                    style={{
                      width: totalCount
                        ? `${(ratingCounts[star - 1] / totalCount) * 100}%`
                        : '0%',
                    }}
                  />
                </div>
                <span className={style.ratingCount}>{ratingCounts[star - 1]}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={style.reviewsList}>
          {feedback.map((item) => (
            <article className={style.reviewCard} key={item.booking_id}>
              <div className={style.reviewHeader}>
              <img
                  className={style.avatar}
                src={item?.author?.u_photo || '/img/img-camera.png'}
                alt="avatar"
              />
                <div className={style.reviewMeta}>
                  <h2>{item?.author?.u_name}</h2>
                  <time>{new Date(item?.created_at).toLocaleDateString('ru-RU')}</time>
                </div>
                <div className={style.reviewRating} aria-label={`Оценка: ${item.rating} из 5`}>
                  {[...Array(5)].map((_, i) => (
                    <img
                      key={i}
                      src={i < item.rating ? '/img/img-small-star.png' : '/img/img-small-star-white.png'}
                      alt=""
                    />
                  ))}
                </div>
              </div>

            <div className={style.comment_body}>
                <div>
                  <h3>{item.text || 'Отзыв о выполненной работе'}</h3>
                  <p>{item.comment || 'Комментарий не указан'}</p>
              </div>
                {item.photos?.length > 0 && (
                  <div className={style.photos}>
                    <ProfileSlider images={item.photos} />
                  </div>
                )}
            </div>

              <div className={style.reviewActions}>
              <button
                className={style.button}
                onClick={() => setVisibleModalAddComment(true)}
              >
                Оставить ответ
              </button>
            </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}

export default App;
