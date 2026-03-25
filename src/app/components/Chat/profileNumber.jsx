import { useEffect, useState } from 'react';
import '../../scss/profileNumber.css';
import '../../scss/swiper.css';

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

      <div className="mini-text">
        <h1>Номер профиля</h1>
      </div>

      <div className="content-box">
        <div className={style.stars_row}>
          <h3 className="inter">{averageRating}</h3>
          {Array.from({ length: 5 }, (_, i) => (
            <img
              key={i}
              src="/img/img-star.png"
              alt="Star"
              style={{
                opacity: i < Math.round(averageRating) ? 1 : 0.3,
              }}
            />
          ))}
        </div>

        <div className="h4">
          <h4 className="inter">На основании {totalCount} оценок</h4>
        </div>

        <div className="main-line">
          {[5, 4, 3, 2, 1].map((star) => (
            <div className="line-content df" key={star}>
              <div className="img-line">
                {Array.from({ length: 5 }, (_, i) => (
                  <img
                    key={i}
                    src={
                      i < star
                        ? '/img/img-small-star.png'
                        : '/img/img-small-star-white.png'
                    }
                    alt="Star"
                  />
                ))}
              </div>
              <div className="big-line">
                {(star === 5 || star === 1) && (
                  <div
                    className={star === 5 ? 'small-line' : 'small-line-2'}
                  ></div>
                )}
              </div>
              <div>
                <p className="inter">{ratingCounts[star - 1]}</p>
              </div>
            </div>
          ))}
        </div>

        {feedback.map((item, index) => (
          <div className="portifoly-photo" key={index}>
            <div className="portifoly-img df">
              <img
                style={{ width: 50, height: 50, borderRadius: 30 }}
                src={item?.author?.u_photo || '/img/img-camera.png'}
                alt="avatar"
              />
              <div>
                <h2 className="inter">{item?.author?.u_name}</h2>
                <p className="inter">
                  {new Date(item?.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className={style.stars_row}>
              {[...Array(5)].map((_, i) => (
                <img
                  key={i}
                  src={
                    i < item.rating
                      ? '/img/img-small-star.png'
                      : '/img/img-small-star-white.png'
                  }
                  alt="Star"
                />
              ))}
              <p>{item.text || 'Без комментария'}</p>
            </div>

            <div className={style.comment_body}>
              <div className="content-portifoly">
                <h3 className="inter">Комментарий</h3>
                <p className="inter">
                  {item.comment || 'Комментарий не указан'}
                </p>
              </div>
              <ProfileSlider images={item.photos || []} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button
                className={style.button}
                onClick={() => setVisibleModalAddComment(true)}
              >
                Оставить ответ
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

export default App;
