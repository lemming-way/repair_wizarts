import { useState } from 'react';
import { Navigation } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';

import ModalDelete from './ModalDelete';
import style from './OrderRow.module.css';
// --- 1. Импортируем нашу API-функцию ---
import { cancelMasterResponse } from '../../services/order.service';

export default function OrderRow({
  userProfile,
  orderInfo,
  photos = [],
  images = [],
  commentData,
  b_id, // --- 2. Принимаем b_id как пропс ---
  onResponseCancelled, // --- 3. Принимаем колбэк для обновления ---
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalImage, setModalImage] = useState('');
  const [visibleDeleteModal, setVisibleDeleteModal] = useState(false); // Этот стейт можно удалить, если ModalDelete не используется
  const [isOpenCommentWrap, setIsOpenCommentWrap] = useState(false);

  // Функция для открытия модального окна
  const openModal = (imageSrc) => {
    setModalImage(imageSrc);
    setIsModalOpen(true);
  };

  // Функция для закрытия модального окна
  const closeModal = () => {
    setIsModalOpen(false);
  };

  // --- 4. Создаем обработчик для удаления отклика ---
  const handleCancelResponse = async () => {
    if (!window.confirm('Вы уверены, что хотите удалить свое предложение?')) {
      return;
    }

    if (!b_id) {
      console.error('ID заказа не передан в компонент OrderRow.');
      alert('Произошла ошибка: не найден ID заказа.');
      return;
    }

    try {
      await cancelMasterResponse(b_id);
      alert('Ваше предложение успешно удалено.');
      // Вызываем колбэк, переданный из родителя, для обновления списка
      if (onResponseCancelled) {
        onResponseCancelled();
      }
    } catch (error) {
      console.error('Ошибка при удалении предложения:', error);
      alert('Не удалось удалить предложение. Пожалуйста, попробуйте снова.');
    }
  };

  return (
    <>
      {/* Если ModalDelete используется для подтверждения, можно его задействовать */}
      {visibleDeleteModal && (
        <ModalDelete
          setVisibleDeleteModal={setVisibleDeleteModal}
          onConfirm={handleCancelResponse} // Передаем нашу функцию в модалку
        />
      )}

      <div className={style.order_row}>
        <div className={style.left}>
          {/* ... остальная часть левой колонки ... */}
          <div className={style.profile}>
            <img
              src={'/img/profil_img/1.png' || userProfile?.avatar}
              alt="Аватар"
              className={style.avatar}
            />
            <div className={style.profile__col}>
              <p className={style.name}>{userProfile?.name || 'Имя Фамилия'}</p>
              <p>
                Размещено проектов на бирже {userProfile?.projectsCount || 0}
              </p>
              <p>Нанято {userProfile?.hireRate || 0}%</p>
            </div>
          </div>

          <div style={{ flex: 1 }}></div>

          <p className={style.description}>
            {orderInfo?.device || 'Название устройства'}
          </p>
          <p className={style.description}>
            {orderInfo?.problem || 'Описание проблемы'}
          </p>
        </div>

        <div className={style.right}>
          {/* ... остальная часть правой колонки ... */}
          <p>
            Желаемый бюджет{' '}
            <span className={style.price}>{orderInfo?.budget || '0'} ₽</span>
          </p>

          <Swiper
            slidesPerView={4}
            spaceBetween={30}
            navigation={true}
            modules={[Navigation]}
            className={style.swiper}
            breakpoints={{
              0: { slidesPerView: 1 },
              800: { slidesPerView: 1 },
              1124: { slidesPerView: 1 },
            }}
          >
            {photos.map((src, index) => (
              <SwiperSlide key={index} className={style.swiperSlide}>
                <img onClick={() => openModal(src)} src={src} alt="" />
              </SwiperSlide>
            ))}
          </Swiper>

          <button
            className={style.button}
            onClick={() => setIsOpenCommentWrap((prev) => !prev)}
          >
            Моё предложение
          </button>
        </div>
      </div>
      {isOpenCommentWrap && (
        <div className={style.comment_wrap}>
          <div className={style.profile}>
            <img
              src={'/img/profil_img/1.png' || commentData?.author?.avatar}
              alt="Аватар"
              className={style.avatar}
            />
            <div className={style.profile__col}>
              <p className={style.name}>
                {commentData?.author?.name || 'Имя Пользователя'}
              </p>
              <p>{commentData?.author?.ordersCount || 0} заказов</p>
            </div>
          </div>

          <div className={style.comment_block}>
            {/* ... остальная часть блока с комментарием ... */}
            <div className={style.icon_chat}>
              <img src="/img/chat.png" alt="Chat Icon" />
            </div>

            <textarea
              className={style.comment__input}
              rows={4}
              placeholder="сообщение.."
              value={commentData?.message || ''}
              readOnly
            />

            <table className={style.table}>
              <thead>
                <tr>
                  <th>Что входит в предложение</th>
                  <th>Срок</th>
                  <th>Стоимость</th>
                </tr>
              </thead>
              <tbody>
                {commentData?.offers?.map((offer, idx) => (
                  <tr key={idx} className={style.line}>
                    <td>{offer?.description || '-'}</td>
                    <td>{offer?.time || '-'}</td>
                    <td>{offer?.price || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* --- 5. Блок с иконкой удаления --- */}
          {/* Этот блок можно разместить внизу, где предполагается управление откликом */}
          <div className={style.action_row}>
            {' '}
            {/* Создайте этот класс, если его нет */}
            {/* ... тут могут быть другие статусы или кнопки ... */}
            <div
              className={style.delete}
              onClick={handleCancelResponse} // Привязываем наш обработчик
            >
              <img src="/img/icons/delete.png" alt="delete icon" />
              <p>удалить</p>
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно со слайдером */}
      {isModalOpen && (
        <div className="modal" onClick={closeModal}>
          <div className="modalContent" onClick={(e) => e.stopPropagation()}>
            <button className="closeBtn" onClick={closeModal}>
              ×
            </button>
            <Swiper
              initialSlide={images.indexOf(modalImage)}
              navigation={true}
              modules={[Navigation]}
              className="modalSwiper"
            >
              {images.map((image, index) => (
                <SwiperSlide key={index}>
                  <div className="modal-content-info">
                    <img src={image} alt={`Slide ${index + 1}`} />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      )}

      {/* Стили для модального окна */}
      <style jsx>{`
        /* ... ваши существующие стили ... */
        .modal {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.8);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 9999;
        }

        .modal-content-info {
          display: flex;
          justify-content: center;
          align-items: center;
          width: 100%;
          height: 100%;
        }

        @media screen and (max-width: 1000px) {
          .modalContent {
            height: 50% !important;
          }
          .modal img {
            width: 100% !important;
            height: auto !important;
          }
        }

        .modalContent {
          position: relative;
          padding: 20px;
          background: white;
          width: 60%;
          height: 80%;
          overflow: hidden;
        }

        .modal img {
          width: auto;
          height: 80%;
        }

        .closeBtn {
          position: absolute;
          right: 10px;
          font-size: 30px;
          top: 0px;
          background: none;
          border: none;
          color: #333;
          cursor: pointer;
        }

        .closeBtn:hover {
          color: red;
        }

        .modalSwiper {
          width: 100%;
          height: 100%;
        }
      `}</style>
    </>
  );
}
