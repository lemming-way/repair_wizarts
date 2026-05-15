import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navigation } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';

import ModalRevokeOffer from './ModalRevokeOffer';
import style from './OrderRow.module.css';
import { useLanguage } from 'app/state/language';
import { AnyImage, getKeyFor } from 'app/shared/ui';
import { useUser } from 'app/state/user';
import { useRevokeOffer } from 'app/state/order';
import { useProducts } from 'app/state/site-data';
import ModalEditOffer from './ModalEditOffer';

export default function OrderRow({
  order,
  clientProfile,
  onResponseChanged,
}) {
  const text = useLanguage();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalImageId, setModalImageId] = useState(null);
  const [visibleRevokeModal, setVisibleRevokeModal] = useState(false);
  const [visibleEditOfferModal, setVisibleEditOfferModal] = useState(false); // New state for edit modal
  const [isOpenCommentWrap, setIsOpenCommentWrap] = useState(false);

  const { user } = useUser();
  const { products } = useProducts();
  const { revokeOffer, isPending: isRevoking } = useRevokeOffer();

  const currentOffer = order.contractorOffers[0];   // Для мастера всегда заполняется только его предложение

  // Функция для открытия модального окна
  const openModal = imageId => {
    setModalImageId(imageId);
    setIsModalOpen(true);
  };

  // Функция для закрытия модального окна
  const closeModal = () => {
    setIsModalOpen(false);
    setModalImageId(null);
  };

  const handleRevokeOffer = async () => {
    if (isRevoking) return;

    try {
      await revokeOffer({ orderId: order.id });
      // todo: сделать нормальное всплывающее сообщение
      alert(text('Your offer has been successfully deleted.'));
      if (onResponseChanged) {
        onResponseChanged();
      }
    } catch (error) {
      console.error('Ошибка при отзыве предложения:', error);
      // todo: сделать нормальное всплывающее сообщение
      alert(text('Failed to delete offer. Please try again.'));
    } finally {
      setVisibleRevokeModal(false);
    }
  };

  const currentImageIndex = modalImageId ? order.attachments.indexOf(modalImageId) : 0;

  return (
    <>
      {visibleRevokeModal && currentOffer && (
        <ModalRevokeOffer
          setVisibleRevokeModal={setVisibleRevokeModal}
          onConfirm={handleRevokeOffer}
        />
      )}

      {visibleEditOfferModal && currentOffer && (
        <ModalEditOffer
          offer={currentOffer}
          orderId={order.id}
          onSuccess={() => {
            setVisibleEditOfferModal(false);
            if (onResponseChanged) {
              onResponseChanged();
            }
          }}
          onCancel={() => setVisibleEditOfferModal(false)}
        />
      )}

      <div className={style.order_row}>
        <div className={style.left}>
          <div className={style.profile}>
            <img
              src={clientProfile?.avatar || '/img/user_avatar.png'}
              alt={text('Avatar')}
              className={style.avatar}
            />
            <div className={style.profile__col}>
              <p className={style.name}>{clientProfile?.fullname || text('Unknown user')}</p>
              <p>
                {text('Projects posted on the exchange')} {clientProfile?.projectsCount ?? 0} {/* todo: Заглушка */}
              </p>
              <p>{text('Hired')} {clientProfile?.hireRate ?? 0}%</p> {/* todo: Заглушка */}
            </div>
          </div>

          <div style={{ flex: 1 }}></div>

          <p className={style.description}>
            {products[ order.productId ]?.name ?? text('Unknown service')}
          </p>
          <p className={style.description}>
            {order.description || text('Problem description')}
          </p>
        </div>

        <div className={style.right}>
          <p>
            {text('Desired budget')}{' '}
            <span className={style.price}>{order.desiredPrice || '0'} ₽</span>
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
            {order.attachments.map((id, index) => (
              <SwiperSlide key={getKeyFor(id)} className={style.swiperSlide}>
                <AnyImage src={id} alt={`${text('Image')} ${index + 1}`} onClick={() => openModal(id)} />
              </SwiperSlide>
            ))}
          </Swiper>

          <button
            className={style.button}
            onClick={() => navigate(`/order/${order.id}/chat/${user.id}`)}
          >
            {text('Go to chat')}
          </button>
          <button
            className={style.button}
            onClick={() => setIsOpenCommentWrap((prev) => !prev)}
          >
            {text('My offer')}
          </button>
        </div>
      </div>
      {isOpenCommentWrap && (
        <div className={style.comment_wrap}>
          <div className={style.profile}>
            <img
              src={user.avatar || '/img/user_avatar.png'}
              alt={text('Avatar')}
              className={style.avatar}
            />
            <div className={style.profile__col}>
              <p className={style.name}>
                {user.fullname || text('Unknown user')}
              </p>
              <p>{user.ordersCount ?? 0} {text('orders')}</p> {/* todo: Заглушка */}
            </div>
          </div>

          <div className={style.comment_block}>
            <div className={style.icon_chat}>
              <img src="/img/chat.png" alt="Chat Icon" />
            </div>

            <textarea
              className={style.comment__input}
              rows={4}
              placeholder={text('Message...')}
              value={currentOffer?.comment || ''}
              readOnly
            />

            <table className={style.table}>
              <thead>
                <tr>
                  <th>{text('What is included in the offer')}</th>
                  <th>{text('Term')}</th>
                  <th>{text('Cost')}</th>
                </tr>
              </thead>
              <tbody>
                <tr className={style.line}>
                  <td>{products[ order.productId ]?.name ?? text('Unknown service')}</td>
                  <td>
                    {currentOffer?.readyIn?.value || '-'} {text(currentOffer?.readyIn?.unit || 'hour')}
                  </td>
                  <td>{currentOffer?.price || '-'} ₽</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className={style.action_row}>
            <div
              className={style.editOfferButton}
              onClick={() => setVisibleEditOfferModal(true)}
            >
              <img src="/img/icons/icomoon-free_pencil.svg" alt={text("Edit offer")} className={style.editIcon}/>
              <p>{text('Edit')}</p>
            </div>
            <div
              className={style.delete}
              onClick={() => setVisibleRevokeModal(true)}
            >
              <img src="/img/icons/delete.png" alt={text("Revoke offer")} />
              <p>{text('Revoke')}</p>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className={style.modal} onClick={closeModal}>
          <div className={style.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={style.closeBtn} onClick={closeModal}>
              ×
            </button>
            <Swiper
              initialSlide={currentImageIndex}
              navigation={true}
              modules={[Navigation]}
              className={style.modalSwiper}
            >
              {order.attachments.map((id, index) => (
                <SwiperSlide key={getKeyFor(id)}>
                  <div className={style.modalContentInfo}>
                    <AnyImage src={id} alt={`${text('Slide')} ${index + 1}`} />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      )}
    </>
  );
}
