import cn from 'classnames';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Popup from 'reactjs-popup';
import { Navigation } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';

import style from './AddedDevice.module.css';
import formatDate from '../../utilities/formatDate';
import { AnyImage, getKeyFor } from '../../shared/ui';
import { useServices } from '../../state/site-data';
import { OrderStatus, orderStatusString, useUpdateOrder, useCancelOrder } from '../../state/order';
import { useLanguage } from '../../state/language';

const AddedDevice = (props) => {
  const text = useLanguage();
  const { categories, subcategories, services } = useServices();
  const {
    id,
    desiredPrice,
    description,
    contractorOffers,
    status,
    serviceId,
    createdAt,
    attachments,
  } = props;

  const { updateOrder } = useUpdateOrder();
  const { cancelOrder } = useCancelOrder();

  const subcategoryIdFromService = services?.[serviceId]?.parent ?? '';
  const categoryIdFromSubcategory = subcategories?.[subcategoryIdFromService]?.parent ?? '';

  const [selectedCategoryId, setSelectedCategoryId] = useState(categoryIdFromSubcategory);
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState(subcategoryIdFromService);
  const [selectedServiceId, setSelectedServiceId] = useState(serviceId);

  useEffect(() => {
    if (serviceId && !selectedSubcategoryId) {
      const subId = services[serviceId]?.parent;
      setSelectedSubcategoryId(subId);
      if (subId && !selectedCategoryId) {
        setSelectedCategoryId(subcategories[subId]?.parent);
      }
    }
  }, [subcategories, services, serviceId, selectedSubcategoryId, selectedCategoryId]);

  const [photos, setPhotos] = useState(attachments);

  useEffect(() => {
    setPhotos(attachments);
  }, [attachments]);

  // загрузка фото
  const handleImageChange = (event) => {
    const files = Array.from(event.target.files);
    const newPhotos = files
      .filter(file => photos.every(existing => {
        return !(existing instanceof File) ||
               existing.name !== file.name ||
               existing.size !== file.size ||
               existing.type !== file.type ||
               existing.lastModified !== file.lastModified;
      }));
    if (photos.length + newPhotos.length > 10) {
      //~ setError(text('You can upload no more than 10 files.'));
      return;
    }
    //~ setError('');
    setPhotos((prev) => [...prev, ...newPhotos]);
  };

  // Удаление фото по индексу
  const handleRemovePhoto = (index) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const [price, setPrice] = useState(desiredPrice);
  const [message, setMessage] = useState(description);

  const title = services?.[serviceId]?.name || '';
  const isEditable = status === OrderStatus.PUBLISHED || status === OrderStatus.NEGOTIATION;
  const isCancellable =
    status === OrderStatus.DRAFT ||
    status === OrderStatus.PUBLISHED ||
    status === OrderStatus.NEGOTIATION ||
    status === OrderStatus.CONTRACTOR_CONFIRMED;

  const onSubmit = async (e) => {
    e.preventDefault();

    await updateOrder({
      orderId: id,
      desiredPrice: Number(price),
      description: message,
      attachments: photos,
    });
  };

  const handleCancelOrder = async (closeModal) => {
    await cancelOrder({ orderId: id, reason: 'Client cancelled' }); // TODO: добавить ввод причины
    closeModal();
  };

  const buttonClassName = cn('dubl-btn-free', {
    'dubl-btn': status === OrderStatus.PUBLISHED || status === OrderStatus.NEGOTIATION,
    'dubl-but': status === OrderStatus.CONTRACTOR_CONFIRMED,
    'dubl-but-blue': status === OrderStatus.IN_PROGRESS,
    'dubl-but-green': status === OrderStatus.COMPLETED,
  });

  return (
    <div className={`archive-hee ${style.card_modile}`}>
      <div className={`nav_applications-3 df align`}>
        <div className={`nav_applications-text ${style.card_modile__heading}`}>
          <h2>{title}</h2>
        </div>
        <div className="nav_applications-2 df ">
          <div className={`applications_text-2 df align`}>
            <h4 className={style.card_modile__price}>{desiredPrice}₽</h4>

            {status !== OrderStatus.CLOSED && status !== OrderStatus.CANCELLED ? (
              <Link
                to={'/client/requests/my_order/' + id}
                className={style.desktop__count}
              >
                <h3>{contractorOffers?.length || 0}</h3>
              </Link>
            ) : (
              <h3 className={`number-of-offers ${style.desktop__count}`}>
                {contractorOffers?.length || 0}
              </h3>
            )}

            <div
              className={`double_buttons  ${style.card_modile__status_block}`}
            >
              <span className={buttonClassName}>{text(orderStatusString[status])}</span>
            </div>

            <div className={style.card__line}></div>

            <div className={style.card__count}>
              <Link to={'/client/requests/my_order/' + id}>
                {text('Offers')}: {contractorOffers?.length || 0}
              </Link>
            </div>

            <div className={`nav_applications-3 ${style.card_modile__buttons}`}>
              <div className="nav_applications-img">
                {isEditable && (
                  <Popup
                    trigger={<img src="/img/added_img/pencil.svg" alt="img absent" />}
                    modal
                    nested
                  >
                    {(close) => (
                      <div
                        className="modal-content order_edit-modal modal-content__edit"
                        style={{ backgroundColor: 'white', maxWidth: '95%' }}
                      >
                        <span onClick={close}>
                          <img
                            className="close"
                            src="/img/img-delete.png"
                            alt=""
                          />
                        </span>

                        <div className={style.top_block}>
                          <h1 style={{ textAlign: 'center' }}>
                            {text('Editing the project')}
                          </h1>
                          <div
                            className="modal-content__row_swiper"
                            style={{ flexWrap: 'wrap' }}
                          >
                            <Swiper
                              slidesPerView={4}
                              spaceBetween={30}
                              navigation={true}
                              modules={[Navigation]}
                              className="mySwiper"
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
                              {photos.map((photo, index) => (
                                <SwiperSlide key={getKeyFor(photo)} className="">
                                  <div style={{ position: 'relative' }}>
                                    <AnyImage src={photo} alt="" style={{ width: '100%' }} />
                                    <button
                                      type="button"
                                      style={{
                                        position: 'absolute',
                                        top: 0,
                                        right: 0,
                                        background: 'rgba(255,255,255,0.7)',
                                        border: 'none',
                                        cursor: 'pointer',
                                      }}
                                      onClick={() => handleRemovePhoto(index)}
                                    >
                                      ✕
                                    </button>
                                  </div>
                                </SwiperSlide>
                              ))}
                            </Swiper>

                            <div
                              className={`photo_upload ${style.photo_upload_block}`}
                            >
                              <div className="photo_upload-img ">
                                <label htmlFor="upimg">
                                  <img
                                    src="/img/accommodation_img/photo.png"
                                    alt="img absent"
                                  />
                                </label>
                                <input
                                  type="file"
                                  onChange={handleImageChange}
                                  accept="image/png, image/jpeg"
                                  multiple
                                  id="upimg"
                                  style={{ display: 'none' }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        <form
                          onSubmit={onSubmit}
                          style={{ display: 'flex', flexDirection: 'column' }}
                        >
                          <p className="form__light-text">
                            {text('Order description')}
                            <img
                              className="modal_edit__icon"
                              src="/img/pencil_modal.svg"
                              alt=""
                            />
                          </p>
                          <textarea
                            className="descdetail"
                            placeholder={text('Order description')}
                            style={{ resize: 'none' }}
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                          ></textarea>

                          <p className="form__light-text">
                            {text('Service category')}
                            <img
                              className="modal_edit__icon"
                              src="/img/multi_box.png"
                              alt=""
                            />
                          </p>
                          <div className="modal__many_select">
                            <select
                              className="pick__price"
                              value={selectedCategoryId}
                              onChange={(e) => {
                                setSelectedCategoryId(Number(e.target.value));
                                setSelectedSubcategoryId('');
                                setSelectedServiceId('');
                              }}
                            >
                              <option value="" disabled>
                                {text('Category')}
                              </option>
                              {Object.entries(categories).map(([id, category]) => (
                                <option key={id} value={id}>
                                  {category.name}
                                </option>
                              ))}
                            </select>
                            <select
                              className="pick__price"
                              value={selectedSubcategoryId}
                              disabled={!selectedCategoryId}
                              onChange={(e) => {
                                setSelectedSubcategoryId(Number(e.target.value));
                                setSelectedServiceId('');
                              }}
                            >
                              <option value="" disabled>
                                {text('Type of category')}
                              </option>
                              {selectedCategoryId && categories[selectedCategoryId]?.subcategories.map(subId => {
                                const subcategory = subcategories[subId];
                                return subcategory ? (
                                  <option key={subId} value={subId}>
                                    {subcategory.name}
                                  </option>
                                ) : null;
                              })}
                            </select>
                            <select
                              className="pick__price"
                              value={selectedServiceId}
                              onChange={(e) => setSelectedServiceId(Number(e.target.value))}
                              disabled={!selectedSubcategoryId}
                            >
                              <option value="" disabled>
                                {text('Service')}
                              </option>
                              {selectedSubcategoryId && subcategories[Number(selectedSubcategoryId)]?.services.map(srvId => {
                                const service = services[srvId];
                                return service ? (
                                  <option key={srvId} value={srvId}>
                                    {service.name}
                                  </option>
                                ) : null;
                              })}
                            </select>
                          </div>

                          <p className="form__light-text">
                            {text('Budget')}
                            <img
                              className="modal_edit__icon"
                              src="/img/price_icon.png"
                              alt=""
                            />
                          </p>
                          <input
                            type="text"
                            style={{ width: '200px', marginBottom: '20px' }}
                            placeholder={text('Price')}
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                          />

                          <button
                            style={{ width: '200px', margin: 'auto' }}
                            className="done button__edit"
                            type="submit"
                            onClick={close}
                          >
                            {text('Save')}
                          </button>
                        </form>
                      </div>
                    )}
                  </Popup>
                )}
                {isCancellable && (
                  <Popup
                    trigger={<img src="/img/added_img/fluent.svg" alt="img absent" />}
                    modal
                    nested
                  >
                    {(close) => (
                      <div
                        className="modal-content"
                        style={{
                          textAlign: 'center',
                          backgroundColor: 'white',
                          maxWidth: '95%',
                        }}
                      >
                        <span onClick={close}>
                          <img
                            className="close"
                            src="/img/img-delete.png"
                            alt=""
                          />
                        </span>
                        <h1>{text('Confirm deletion')}</h1>
                        <p style={{ width: '80%', margin: 'auto' }}>
                          {text('Do you confirm the stop of the project? Sellers will not be able to add their offers to it anymore.')}
                        </p>
                        <div className="df" style={{ justifyContent: 'center' }}>
                          <div className={style.form__row}>
                            <button
                              className="btn_6PopUpBack"
                              type="button"
                              style={{
                                margin: 0,
                                backgroundColor: 'unset',
                                color: 'black',
                                border: '1px solid black',
                              }}
                              onClick={close}
                            >
                              {text('Cancel')}
                            </button>
                            <button
                              className="btn_6PopUp"
                              type="button"
                              style={{ margin: 0 }}
                              onClick={() => handleCancelOrder(close)}
                            >
                              {text('Delete')}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </Popup>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className={style.info_block}>
        <div className="inf_text-1">
          <p>{text('Published')} {formatDate(createdAt)}</p>
        </div>
        <div className={style.view_row}>
          <img src="/img/icons/eye.png" alt="" />
          {text('viewed 20')} {/* TODO: добавить реальное количество просмотров */}
        </div>
      </div>
    </div>
  );
};

export default AddedDevice;
