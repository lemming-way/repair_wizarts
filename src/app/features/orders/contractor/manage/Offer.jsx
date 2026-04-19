import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Navigation } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';

import ModalEditOffer from './Offer/ModalEditOffer';
import ModalOfferGo from './Offer/ModalOfferGo';
import OrderRow from './Offer/OrderRow';
import { AnyImage, getKeyFor } from 'app/shared/ui';
import { useLanguage } from 'app/state/language';
import { useOrdersByIds } from 'app/state/order';
import { useUsersByIds } from 'app/state/user';
import { useProducts } from 'app/state/site-data';
import 'app/scss/orders.css';
import 'app/scss/swiper.css';
import style from './Offer/OrderRow.module.css';

function Offer() {
  const text = useLanguage();
  const { id } = useParams();
  const orderId = Number(id);

  const { orders: [ order ], isLoading: isLoadingOrder, isError: isErrorOrder } = useOrdersByIds(orderId ? [orderId] : []);

  // Получаем данные клиента, если order существует
  const { users: [ client ], isLoading: isLoadingClient, isError: isErrorClient } = useUsersByIds(order?.clientId ? [order.clientId] : []);

  const { products } = useProducts();

  const handleResponseChanged = () => {
    // Пока здесь не требуется дополнительных действий
  };

  const [isImageOpen, setIsImageOpen] = useState(false);
  const [modalImage, setModalImage] = useState(null);
  const [visibleEditOffer, setVisibleEditOffer] = useState(false);
  const [visibleModalGo, setVisibleModalGo] = useState(false);

  const openImageModal = imageSrc => {
    setModalImage(imageSrc);
    setIsImageOpen(true);
  };
  const closeImageModal = () => {
    setIsImageOpen(false);
  };

  const onOffer = () => {
    setVisibleEditOffer(false);
    setVisibleModalGo(true);
  };

  const navigator = useNavigate();

  // Обработка состояний загрузки и ошибок
  if (isLoadingOrder || isLoadingClient) {
    return <div>{text('Loading order details...')}</div>;
  }

  if (isErrorOrder || isErrorClient || !order) {
    return <div>{text('Error loading order or order not found.')}</div>;
  }

  const {
    description,
    desiredPrice,
    attachments,
    // createdAt, // todo: createdAt может быть использовано для расчета timeLeft, если есть соответствующая логика
  } = order;

  const product = products?.[order.productId]?.name || text('Unknown service');
  const clientName = client?.fullname || text('Unknown user');
  const clientProfileImage = client?.avatar || '/img/profil_img/1.png';

  const projectsPosted = 1; // todo: Заглушка
  const hiredPercent = 100; // todo: Заглушка
  const timeLeft = text('1 day'); // todo: Заглушка, можно рассчитать на основе order.createdAt и желаемого времени завершения
  const views = 0; // todo: Заглушка

  // Проверяем, есть ли у текущего мастера уже предложение для этого заказа
  const hasOffer = order.contractorOffers.length > 0;

  return (
    <>
      <div className={style.order_row}>
        <div className={style.title_row}>
          <h1>{text('Offer a service')}</h1>

          <button
            className={style.button_back_v2}
            onClick={() => navigator('/contractor/requests')}
          >
            {text('Back')}
          </button>
        </div>
      </div>

      {hasOffer ? (
        <OrderRow
          key={order.id}
          order={order}
          clientProfile={client}
          onResponseChanged={handleResponseChanged}
        />
      ) : (
        <div className={style.order_row}>
          <div className={style.left}>
            <div className={style.profile}>
              <img src={clientProfileImage} alt={clientName} className={style.avatar} />
              <div className={style.profile__col}>
                <p className={style.name}>{clientName}</p>
                <p>{text('Projects posted on the exchange')} {projectsPosted}</p> {/* todo: Заглушка */}
                <p>{text('Hired')} {hiredPercent}%</p> {/* todo: Заглушка */}
              </div>
            </div>
            <div style={{ flex: 1 }}></div>
            <p className={style.description}>{product}</p>
            <p className={style.description}>{description}</p>
            <p className={style.small_text}>
              <span>{text('remaining')} {timeLeft}</span> {/* todo: Заглушка */}
              <span className={style.flex}>
                <img src="/img/icons/eye.png" alt={text('Views')} />
                {views} {text('viewed')}
              </span>
            </p>
          </div>

          <div className={style.right}>
            <p>
              {text('Desired budget')} <span className={style.price}>{desiredPrice} ₽</span>
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
              {attachments.length > 0 ? (
                attachments.map((fileId, index) => (
                  <SwiperSlide key={getKeyFor(fileId)} className={style.swiperSlide}>
                    <div
                      onClick={() => openImageModal(fileId)}
                      style={{ cursor: 'pointer', width: '100%', height: '100%' }}
                    >
                      <AnyImage
                        src={fileId}
                        alt={`${text('Attachment')} ${index + 1}`}
                        style={{
                          width: '100%',
                          height: 120,
                          objectFit: 'cover',
                          borderRadius: 8,
                        }}
                      />
                    </div>
                  </SwiperSlide>
                ))
              ) : (
                <SwiperSlide key="no-photos">
                  <div style={{ width: '100%', height: 120, background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8 }}>
                    {text('No photos available')}
                  </div>
                </SwiperSlide>
              )}
            </Swiper>
            <button
              className={style.button}
              onClick={() => setVisibleEditOffer(true)}
            >
              {text('Offer a service')}
            </button>
          </div>
        </div>
      )}

      {visibleEditOffer && <ModalEditOffer orderId={order.id} onSuccess={onOffer} onCancel={() => setVisibleEditOffer(false)} />}
      {visibleModalGo && <ModalOfferGo setVisibleModalGo={setVisibleModalGo} />}

      {isImageOpen && modalImage !== null && (
        <div className={style.modal} onClick={closeImageModal}>
          <div className={style.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={style.closeBtn} onClick={closeImageModal}>
              &times;
            </button>
            <Swiper
              initialSlide={attachments.indexOf(modalImage)}
              navigation={true}
              modules={[Navigation]}
              className={style.modalSwiper}
            >
              {attachments.map((fileId, index) => (
                <SwiperSlide key={getKeyFor(fileId)}>
                  <div className={style.modalContentInfo}>
                    <AnyImage
                      src={fileId}
                      alt={`${text('Slide')} ${index + 1}`}
                    />
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

export default Offer;
