import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { Navigation } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';

import { AnyImage, getKeyFor } from 'app/shared/ui';
import ModalConfirmContractor from './Order/ModalConfirmContractor';
import ModalCancelOrder from './Order/ModalCancelOrder';
import ModalEditOrder from './Order/ModalEditOrder';
import styles from './Order/Order.module.css';
import { useLanguage } from 'app/state/language';
import { UserRole, BusinessModel, useUser, useUsersByIds } from 'app/state/user';
import { useOrdersByIds, useCancelOrder, useAcceptOffer, OrderStatus, orderStatusString } from 'app/state/order';
import { useProducts } from 'app/state/site-data';
import commonStyle from '../create/CreateDirect/CreateDirect.module.scss';

function Order() {
  const text = useLanguage();
  const { user } = useUser();
  const navigate = useNavigate();
  const { id } = useParams();
  const orderId = Number(id ?? 0);

  // Fetch order data
  const {
    orders: [currentOrder],
    isLoading: isOrderLoading,
    isError: isOrderError,
  } = useOrdersByIds([orderId]);

  // Fetch services data for order title
  const { products } = useProducts();
  const productName = currentOrder?.productId ? products[currentOrder.productId]?.name : text('Unknown Service');

  // Fetch contractor profiles for offers
  const contractorIds = currentOrder?.contractorOffers.map(offer => offer.contractorId) || [];
  const { users: contractors, isLoading: isContractorsLoading } = useUsersByIds(contractorIds);
  const contractorsMap = new Map(contractors.map(c => [c.id, c]));

  // Mutations
  const { cancelOrder } = useCancelOrder();
  const { acceptOffer } = useAcceptOffer();

  // Modals state
  const [visibleModalConfirmContractor, setVisibleModalConfirmContractor] = useState(false);
  const [visibleModalCancel, setVisibleModalCancel] = useState(false);
  const [visibleModalEdit, setVisibleModalEdit] = useState(false);

  // For image modal
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Payment related state (stubs as per request)
  const [visibleBlockPayment, setVisibleBlockPayment] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(0); // 0 for site, 1 for cash

  const [acceptedContractorId, setAcceptedContractorId] = useState(false);
  const [expandedServices, setExpandedServices] = useState({});
  // Functions for modals
  const handleCancelOrder = async () => {
    try {
      await cancelOrder({ orderId, reason: 'Client cancellation' }); // Add a reason
    } catch (error) {
      console.error('Failed to cancel order:', error);
      alert(error.message); // todo: сделать нормальное сообщение об ошибке
    }
  };

  const handleAcceptOffer = async (contractorId, price) => {
    const contractor = contractorsMap.get(contractorId);
    if (!contractor) {
      console.error('Contractor not found'); // todo: сделать нормальное сообщение об ошибке
      return;
    }
    if (user.blackList?.includes(contractor.id) || contractor.blackList?.includes(user.id)) {
      console.error('Failed to accept offer: Blacklisted'); // todo: сделать нормальное сообщение об ошибке
      return;
    }
    try {
      await acceptOffer({ orderId, contractorId });
      setAcceptedContractorId(contractorId);
      // Stub for payment selection
      // Here you would typically proceed to payment or confirmation
      // For now, we just show the confirmation modal
      setVisibleBlockPayment(false); // Close payment selection if it was open
      setVisibleModalConfirmContractor(true); // Show contractor confirmed modal
    } catch (error) {
      console.error('Failed to accept offer:', error);
      alert(error.message); // todo: сделать нормальное сообщение об ошибке
    }
  };

  const openImageModal = (imageIndex) => {
    setCurrentImageIndex(imageIndex);
    setIsImageModalOpen(true);
  };

  const closeImageModal = () => {
    setIsImageModalOpen(false);
    setCurrentImageIndex(0);
  };

  // Conditional rendering for action buttons
  const canEditOrder = user.role === UserRole.Client &&
    currentOrder && [
      OrderStatus.DRAFT,
      OrderStatus.PUBLISHED,
      OrderStatus.REQUESTED
    ].includes(currentOrder.status);

  const canCancelOrder = user.role === UserRole.Client &&
    currentOrder && [
      OrderStatus.DRAFT,
      OrderStatus.PUBLISHED,
      OrderStatus.REQUESTED,
      OrderStatus.APPOINTED
    ].includes(currentOrder.status);

  if (!orderId) return null;

  if (isOrderLoading) {
    return <div className={styles.main_block}><p>{text('Loading...')}</p></div>;
  }

  if (isOrderError || !currentOrder) {
    return <div className={styles.main_block}><p>{text('Order not found.')}</p></div>;
  }

  return (
    <>
      {visibleModalConfirmContractor && (
        <ModalConfirmContractor
          setVisibleModalConfirmContractor={setVisibleModalConfirmContractor}
          orderId={currentOrder.id}
          contractorId={acceptedContractorId}
        />
      )}
      {/* блок с оплатой */}
      {visibleBlockPayment && (
        <div className={commonStyle.blockPayment_wrap}>
          <div className={commonStyle.blockPayment}>
            <div
              className={commonStyle.close}
              onClick={() => setVisibleBlockPayment(false)}
            >
              <img src="/img/close.svg" alt="" />
            </div>

            <h2>{text('Payment')}</h2>
            <div className={commonStyle.row}>
              <div className={commonStyle.block}>
                <p>{text('Pay through the website')}</p>
                <div className={commonStyle.radio}>
                  <input
                    type="radio"
                    id="inputSite"
                    name="radioPayments"
                    checked={selectedPaymentMethod === 0}
                    onChange={() => setSelectedPaymentMethod(0)}
                  />
                  <label htmlFor="inputSite">
                    {text('Balance')}: {user.details?.balance || 0 /* todo: загружать баланс отдельно */}р
                  </label>
                </div>
                <p>{text('Standard risk-free deal price')}</p>
                <p className={commonStyle.mini_text}>
                  {text('A 9% fee applies when topping up your wallet. The price in the performer response already includes the commission.')}
                </p>
              </div>

              <div
                className={`${commonStyle.block} ${styles.relativeTop35}`}
              >
                <div className={commonStyle.radio}>
                  <input
                    type="radio"
                    id="inputCash"
                    name="radioPayments"
                    checked={selectedPaymentMethod === 1}
                    onChange={() => setSelectedPaymentMethod(1)}
                  />
                  <label htmlFor="inputCash">{text('Cash payment')}</label>
                </div>
                <p className={commonStyle.mini_text}>
                  {text('Pay the performer directly')} <br />
                  {text('No guarantees or compensation from Elitegig: you negotiate conditions and payment method directly with the performer.')}
                </p>
              </div>
            </div>

            <div
              className={commonStyle.button}
              onClick={() => {
                // This would trigger the actual accept offer mutation with payment type
                // For now, it just closes the payment block and shows confirmation
                // This part is a stub as requested
                // todo: доделать выбор способа оплаты
                setVisibleBlockPayment(false);
                setVisibleModalConfirmContractor(true);
              }}
            >
              {text('Proceed')}
            </div>
          </div>
        </div>
      )}
      {visibleModalCancel && (
        <ModalCancelOrder
          setVisibleCancelModal={setVisibleModalCancel}
          onCancelOrder={handleCancelOrder}
        />
      )}
      {visibleModalEdit && (
        <ModalEditOrder
          order={currentOrder}
          onSuccess={() => setVisibleModalEdit(false)}
          onCancel={() => setVisibleModalEdit(false)}
        />
      )}

      <div className={styles.main_block}>
        <div className={styles.heading_row}>
          <h1>{text('My order')} ({currentOrder.id})</h1>
          <button className={styles.button_back} onClick={() => navigate(-1)}>
            {text('Back')}
          </button>
        </div>

        <div className={styles.block_order}>
          <div className={styles.left}>
            <div className={styles.left_row}>
              <img
                src={user?.avatar || '/img/user_avatar.png'}
                width="120px"
                height="120px"
                className={styles.avatarImage}
                alt=""
              />
              <div className={styles.block_info}>
                <h2>{user?.fullname}</h2>
                <h3>{text('Posted 10 projects')}</h3> {/* Todo: replace with real data */}
                <h3>{text('Hired 100%')}</h3> {/* Todo: replace with real data */}
              </div>
            </div>
            <div className={styles.description}>
              <p>{productName}</p>
              <p>{currentOrder.description}</p>
            </div>
            <div className={styles.left_row_bottom}>
              <p>{text('5 days left')} </p> {/* Todo: calculate remaining time */}
              <p className={styles.view}>
                <img src="/img/icons/eye.png" alt="" />
                {currentOrder.contractorOffersCount || 0} {text('offers received')}
              </p>
            </div>
          </div>
          <div className={styles.right}>
            <p>
              {text('Desired budget')}{' '}
              <span className={styles.price}>
                {currentOrder.desiredPrice} ₽
              </span>
            </p>

            <div className={styles.swiper}>
              <Swiper
                slidesPerView={4}
                spaceBetween={30}
                navigation={true}
                className="myMiniSwiper"
                modules={[Navigation]}
                breakpoints={{
                  0: {
                    slidesPerView: 1,
                  },
                  800: {
                    slidesPerView: 1,
                  },
                  1124: {
                    slidesPerView: 1,
                  },
                }}
              >
                {currentOrder.attachments.map((src, index) => (
                  <SwiperSlide key={getKeyFor(src)}>
                    <button
                      type="button"
                      className={styles.miniSlider}
                      onClick={() => openImageModal(index)}
                      aria-label={`${text('Open image')} ${index + 1}`}
                    >
                      <AnyImage
                        src={src}
                        alt={`${text('Order image')} ${index + 1}`}
                      />
                    </button>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>

            <div className={styles.order_row}>
              <div className={styles.order_button}>
                {text(orderStatusString[currentOrder.status] || 'Unknown status')}
              </div>
              <div className={styles.buttons_icon}>
                {canEditOrder && (
                  <div onClick={() => setVisibleModalEdit(true)}>
                    <img src="/img/pencil.png" alt="" />
                  </div>
                )}
                {canCancelOrder && (
                  <div onClick={() => setVisibleModalCancel(true)}>
                    <img src="/img/basket.png" alt="" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {currentOrder.contractorOffers.length > 0 && (
          <section>
            <h2>{currentOrder.contractorOffersCount} {text('Offers')}</h2>
            {currentOrder.contractorOffers.map((offer) => {
              if (isContractorsLoading) return <div key={offer.contractorId}>{text('Loading...')}</div>;

              const contractor = contractorsMap.get(offer.contractorId);
              if (!contractor) return null; // Skip if profile not found
              if (user.blackList?.includes(contractor.id) || contractor.blackList?.includes(user.id)) return null;  // Skip blacklisted

              const contractorProducts = Object.keys(contractor.services);
              const contractorServiceNames = contractorProducts
                .map(productId => products[productId]?.name)
                .filter(Boolean);
              const servicesAreExpanded = !!expandedServices[offer.contractorId];
              const visibleServices = servicesAreExpanded
                ? contractorServiceNames
                : contractorServiceNames.slice(0, 3);

              const businessModelText = contractor.businessModel === BusinessModel.ServiceCenter
                ? text('Service center')
                : text('Independent technician');

              return (
                <div key={offer.contractorId}>
                  <p className={styles.heading}>{text('Profile number')} ({offer.contractorId})</p>

                  <div className={styles.about_block}>
                    <div className={styles.about_row}>
                      <div className={styles.left_row}>
                        <img
                          src={contractor.avatar || '/img/user_avatar.png'}
                          width="80px"
                          height="80px"
                          className={styles.avatarImage}
                          alt={contractor.fullname}
                        />
                        <div className={styles.block_info}>
                          <p>{contractor.fullname}</p>
                          <p>{businessModelText}</p>
                          <p className={styles.star_block}>
                            <img src="/img/img-star.png" alt="" />
                            <img src="/img/img-star.png" alt="" />
                            <img src="/img/img-star.png" alt="" />
                            <img src="/img/img-star.png" alt="" />
                            <img src="/img/img-star.png" alt="" />
                            {/* todo: real rating value */}23
                          </p>
                        </div>
                      </div>

                      <div>
                        <p className={styles.about__description}>
                          <span>{text('Address')}:</span>
                          {contractor.address || text('not specified')}
                        </p>
                        {/* Город исполнителя не выводим, потому что должен совпадать с городом заказа */}
                      </div>

                      <div>
                        <p className={styles.about__description}>
                          <span>{text('On the platform')}:</span> {text('since 2022')} {/* todo: real join date */}
                        </p>
                        <p className={styles.about__description}>
                          <span>{text('Status')}:</span>
                          <span className={styles.accent_color}>
                            {contractor.isOnline ? text('Online') : text('Offline')}
                          </span>
                        </p>
                        <p className={styles.about__description}>
                          <span>{text('Rating')}:</span>
                          <span className={styles.accent_color}>5.00</span> {/* todo: real rating value */}
                        </p>
                      </div>
                    </div>

                    <div className={styles.row2}>
                      <p
                        className={`${styles.flex_center} ${styles.flexAlignStart}`}
                      >
                        <img
                          src="/img/img-small-star.png"
                          alt=""
                          className={styles.marginTop5}
                        />
                        <span className={styles.accent_color_gold}>4.3</span> {/* todo: real rating value */}
                        {text('Newbie Seller')} {/* todo: real status */}
                      </p>
                      <p>
                        <span className={styles.accent_color}>40 </span>{text('Orders completed')} {/* todo: real count */}
                      </p>
                      <p>
                        <span className={styles.accent_color}>40 </span>{text('reviews received')} {/* todo: real count */}
                      </p>
                      <p>
                        <span className={styles.accent_color}>100% </span>{text('Orders delivered successfully')} {/* todo: real percentage */}
                      </p>
                      <p>
                        <span className={styles.accent_color}>54% </span>{text('repeat orders')} {/* todo: real percentage */}
                      </p>
                    </div>
                  </div>

                  <div className={styles.about_block2}>
                    <table className={styles.profileTable}>
                      <tbody>
                        <tr>
                          <td className={styles.light_text}>{text('Experience')}:</td>
                          <td>
                            {contractor.experience
                              ? `${contractor.experience} ${text('Years unit')}`
                              : text('not specified')}
                          </td>
                        </tr>
                        {contractor.businessModel === BusinessModel.ServiceCenter && (
                          <tr>
                            <td className={styles.light_text}>{text('Organization name')}:</td>
                            <td>
                              {contractor.organizationName || text('not specified')}
                            </td>
                          </tr>
                        )}
                        <tr>
                          <td className={styles.light_text}>{text('Services')}:</td>
                          <td className={styles.servicesCell}>
                            {contractorServiceNames.length > 0 ? (
                              <div className={styles.servicesDropdown}>
                                <div className={styles.servicesList}>
                                  {visibleServices.map(serviceName => (
                                    <span key={serviceName}>{serviceName}</span>
                                  ))}
                                </div>
                                {contractorServiceNames.length > 3 && (
                                  <button
                                    type="button"
                                    className={styles.servicesToggle}
                                    onClick={() => setExpandedServices(current => ({
                                      ...current,
                                      [offer.contractorId]: !current[offer.contractorId],
                                    }))}
                                  >
                                    {servicesAreExpanded ? 'Скрыть' : `Показать все (${contractorServiceNames.length})`}
                                    <span className={servicesAreExpanded ? styles.arrowUp : ''}>⌄</span>
                                  </button>
                                )}
                              </div>
                            ) : text('not specified')}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className={styles.text_block}>
                    <p>{contractor.description || text('not specified')}</p>
                  </div>

                  <section className={styles.order_block}>
                    <h2>{text('What is included in the offer')}</h2>
                    <div className={styles.order_block__row}>
                      <p>{productName}</p>
                      <div className={styles.flexGrow1} />
                      <p>
                        {text('Ready to start up in')} <br />
                        {offer.readyIn?.value} {text(offer.readyIn?.unit || 'hours')}
                      </p>
                      <p>
                        {text('Price')} <br />
                        {offer.price} ₽
                      </p>
                    </div>
                    <div className={styles.line}></div>
                  </section>
                  <div className={styles.buttons}>
                    {currentOrder.status === OrderStatus.PUBLISHED &&
                      <button
                        className={styles.button}
                        onClick={() => handleAcceptOffer(offer.contractorId, offer.price)}
                      >
                        {text('Select contractor')}
                      </button>
                    }
                    <Link to={`/order/${orderId}/chat/${offer.contractorId}`}>
                      <button className={styles.button}>{text('Chat with master')}</button>
                    </Link>
                    <Link to={`/client/feedback/${offer.contractorId}`}>
                      <button className={styles.button}>{text('Reviews about the contractor')}</button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </section>
        )}
      </div>

      {/* Модальное окно с слайдером для изображений заказа */}
      {isImageModalOpen && (
        <div className={styles.modal} onClick={closeImageModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeBtn} onClick={closeImageModal}>
              &times;
            </button>

            <Swiper
              initialSlide={currentImageIndex}
              navigation={true}
              modules={[Navigation]}
              className={styles.modalSwiper}
            >
              {currentOrder.attachments.map((image, index) => (
                <SwiperSlide key={getKeyFor(image)}>
                  <div className={styles.modalContentInfo}>
                    <AnyImage src={image} alt={`${text('Slide')} ${index + 1}`} className={styles.modalImage} />
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

export default Order;
