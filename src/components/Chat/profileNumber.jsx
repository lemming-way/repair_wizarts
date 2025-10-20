import { useEffect, useState } from 'react';
import '../../scss/profileNumber.css';
import '../../scss/swiper.css';

import ModalAddCommentMini from './ModalAddCommentMini';
import ModalDelete from './ModalDelete';
import style from './profileNumber.module.css';
import appFetch from '../../utilities/appFetch';
import ProfileSlider from '../profileNumberClient/ProfileSlider';
import { useUserQuery } from '../../hooks/useUserQuery';

function App() {
  const { user } = useUserQuery();
  const currentUser = user || {};
  const [feedback, setFeedback] = useState([]);
  const [visibleModalDelete, setVisibleModalDelete] = useState(false);
  const [visibleModalAddComment, setVisibleModalAddComment] = useState(false);

  useEffect(() => {
    const getUserCommentsFromBookings = async (u_id) => {
      try {
        const res = await appFetch('drive/archive', {
          method: 'POST',
          body: {
            ls: 9999999999999,
          },
        });

        const allBookings = Object.values(res?.data?.booking || {});
        const comments = allBookings.flatMap((booking) => {
          if (!booking.b_rating) return [];
          if (!booking.b_comments || booking.b_comments.length === 0) {
            console.log(booking);
            return [
              {
                booking_id: booking.b_id,
                booking_title: booking.b_options?.title || '',
                created_at: booking.b_created || '',
                rating: booking.b_rating,
                text: '',
                comment: 'Комментарий не указан',
                photos: [],
                author: booking.b_options.author,
              },
            ];
          }

          return booking.b_comments.map((comment) => ({
            booking_id: booking.b_id,
            booking_title: booking.b_options?.title || '',
            created_at: comment.created_at,
            rating: comment.rating || null,
            text: comment.text || '',
            comment: comment.comment || 'Комментарий не указан',
            photos: comment.photos || [],
            author: comment.author || {},
          }));
        });

        return comments;
      } catch (err) {
        console.error('Ошибка при получении отзывов из поездок:', err);
        return [];
      }
    };

    const fetchFeedback = async () => {
      if (currentUser.u_details?.login) {
        const comments = await getUserCommentsFromBookings(currentUser.u_id);
        setFeedback(comments);
      }
    };

    fetchFeedback();
  }, [currentUser.u_id, currentUser.u_details?.login]);

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
