import { useEffect, useState } from 'react';
import '../../scss/profileNumber.css';
import '../../scss/swiper.css';
import { useSelector } from 'react-redux';
import { selectUser } from '../../slices/user.slice';
import ModalDelete from './ModalDelete';
import style from './profileNumber.module.css';
import ModalAddCommentMini from './ModalAddCommentMini';
import ProfileSlider from '../profileNumberClient/ProfileSlider';
import appFetch from '../../utilities/appFetch';
const mockDriveArchiveResponse = {
  data: {
    booking: {
      1: {
        b_id: 1,
        u_id: 'user_1',
        b_options: {
          title: 'Замена дисплея iPhone',
        },
        b_comments: [
          {
            created_at: '2024-12-10T14:22:00Z',
            rating: 5,
            // text: 'Отличный сервис!',
            // comment: 'Мастер был очень вежлив и выполнил работу быстро.',
            // photos: ['/img/feedback1.jpg', '/img/feedback2.jpg'],
            // author: {
            //   u_id: 'user_1',
            //   name: 'Андрей',
            //   photo: '/img/avatar1.png',
            // },
          },
        ],
      },
      2: {
        b_id: 2,
        u_id: 'user_2',
        b_options: {
          title: 'Ремонт ноутбука',
        },
        b_comments: [
          {
            created_at: '2025-01-15T09:30:00Z',
            rating: 4,
            // text: 'Всё нормально, но пришлось подождать.',
            // comment: 'Могли бы и побыстрее.',
            // photos: [],
            // author: {
            //   u_id: 'user_2',
            //   name: 'Екатерина',
            //   photo: '', // дефолтный аватар
            // },
          },
        ],
      },
      3: {
        b_id: 3,
        u_id: 'user_3',
        b_options: {
          title: 'Замена аккумулятора',
        },
        b_comments: [
          {
            created_at: '2025-02-05T11:45:00Z',
            rating: 3,
            // text: '',
            // comment: 'Ожидал большего. Аккумулятор садится быстро.',
            // photos: ['/img/feedback3.jpg'],
            // author: {
            //   u_id: 'user_3',
            //   name: 'Иван',
            //   photo: '/img/avatar2.png',
            // },
          },
        ],
      },
    },
  },
};

function App() {
  const user =
    Object.values(useSelector(selectUser)?.data?.user || {})[0] || {};
  const [feedback, setFeedback] = useState([]);
  const [visibleModalDelete, setVisibleModalDelete] = useState(false);
  const [visibleModalAddComment, setVisibleModalAddComment] = useState(false);

  useEffect(() => {
    const getUserCommentsFromBookings = async (u_id) => {
      try {
        const req = await appFetch('drive/archive', {
          method: 'POST',
        });
        const data = mockDriveArchiveResponse;

        const allBookings = Object.values(data?.data?.booking || {});
        console.log(allBookings);
        const comments = allBookings.flatMap((booking) => {
          if (!booking.b_comments) return [];

          return booking.b_comments
            .filter((comment) => {
              // const authorId = comment.author?.u_id;
              // const targetId = booking.u_id;
              return true;
            })
            .map((comment) => ({
              booking_id: booking.b_id,
              booking_title: booking.b_options?.title,
              created_at: comment.created_at,
              rating: comment.rating || null,
              text: comment.text || '',
              comment: comment.comment || '',
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
      if (user.u_details?.login) {
        const comments = await getUserCommentsFromBookings(user.u_id);
        setFeedback(comments);
      }
    };

    fetchFeedback();
  }, [user]);

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
  // if (feedback.length === 0) return 'Отзывов нет';
  return (
    <>
      {visibleModalDelete ? (
        <ModalDelete setVisibleModalDelete={setVisibleModalDelete} />
      ) : null}
      {visibleModalAddComment ? (
        <ModalAddCommentMini
          setVisibleModalAddComment={setVisibleModalAddComment}
        />
      ) : null}

      <div className="mini-text">
        <h1>Номер профиля</h1>
      </div>

      <div className="content-box">
        <div className={style.stars_row}>
          <h3 className="inter">{averageRating}</h3>
          {Array.from({ length: 5 }, (_, i) => (
            <img
              key={i}
              src={
                i < Math.round(averageRating)
                  ? '/img/img-star.png'
                  : '/img/img-star.png'
              }
              alt="Star"
            />
          ))}
        </div>

        <div className="h4">
          <h4 className="inter">На основании {totalCount} оценок</h4>
        </div>

        <div className="main-line">
          {[5, 4, 3, 2, 1].map((star, index) => (
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
                src={item?.author?.photo || '/img/default-avatar.png'}
                alt="avatar"
              />
              <div>
                <h2 className="inter">{item?.author?.name}</h2>
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
