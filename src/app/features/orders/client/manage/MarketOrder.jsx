import cn from 'classnames';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Popup from 'reactjs-popup';

import formatDate from 'app/utilities/formatDate';
import { AnyImage, getKeyFor } from 'app/shared/ui';
import { useProducts } from 'app/state/site-data';
import { OrderStatus, orderStatusString, useUpdateOrder, useCancelOrder } from 'app/state/order';
import { useLanguage } from 'app/state/language';
import style from './MarketOrder/MarketOrder.module.css';

const MarketOrder = (props) => {
  const {
    id,
    contractorId,
    desiredPrice,
    description,
    contractorsCount,
    status,
    productId,
    createdAt,
    attachments,
  } = props;

  const text = useLanguage();
  const { categories, subcategories, products } = useProducts();

  const { updateOrder } = useUpdateOrder();
  const { cancelOrder } = useCancelOrder();

  const subcategoryIdFromProduct = products?.[productId]?.parent ?? '';
  const categoryIdFromSubcategory = subcategories?.[subcategoryIdFromProduct]?.parent ?? '';

  const [selectedCategoryId, setSelectedCategoryId] = useState(categoryIdFromSubcategory);
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState(subcategoryIdFromProduct);
  const [selectedProductId, setSelectedProductId] = useState(productId);

  useEffect(() => {
    if (productId && !selectedSubcategoryId) {
      const subId = products[productId]?.parent;
      setSelectedSubcategoryId(subId);
      if (subId && !selectedCategoryId) {
        setSelectedCategoryId(subcategories[subId]?.parent);
      }
    }
  }, [subcategories, products, productId, selectedSubcategoryId, selectedCategoryId]);

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

  const title = products?.[productId]?.name || '';
  const isEditable = status === OrderStatus.PUBLISHED || status === OrderStatus.REQUESTED;
  const isCancellable =
    status === OrderStatus.DRAFT ||
    status === OrderStatus.PUBLISHED ||
    status === OrderStatus.REQUESTED ||
    status === OrderStatus.APPOINTED;
  const hasChat = !!contractorId;

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
    'dubl-btn': status === OrderStatus.PUBLISHED || status === OrderStatus.REQUESTED,
    'dubl-but': status === OrderStatus.APPOINTED,
    'dubl-but-blue': status === OrderStatus.IN_PROGRESS,
    'dubl-but-green': status === OrderStatus.COMPLETED,
  });

  return (
    <div className={`archive-hee ${style.card_modile} ${style.orderCard}`}>
      <div className={`nav_applications-3 ${style.orderGrid}`}>
        <div className={`nav_applications-text ${style.card_modile__heading}`}>
          <h2 title={title}>{title}</h2>
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
        <div className={`nav_applications-2 ${style.orderDetails}`}>
          <div className={`applications_text-2 ${style.orderColumns}`}>
            <h4 className={style.card_modile__price}>{desiredPrice}₽</h4>

            {status !== OrderStatus.CLOSED && status !== OrderStatus.CANCELLED ? (
              <Link
                to={'/client/requests/my_order/' + id}
                className={style.desktop__count}
              >
                <h3>{contractorsCount || 0}</h3>
              </Link>
            ) : (
              <h3 className={`number-of-offers ${style.desktop__count}`}>
                {contractorsCount || 0}
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
                {text('Offers')}: {contractorsCount || 0}
              </Link>
            </div>

            <div className={`nav_applications-3 ${style.card_modile__buttons}`}>
              <div className="nav_applications-img">
                {isEditable && (
                  <Popup
                    trigger={<img className={style.actionIcon} src="/img/added_img/pencil.svg" alt={text('Edit order')} />}
                    modal
                    nested
                  >
                    {(close) => (
                      <div
                        className={`modal-content order_edit-modal modal-content__edit ${style.editModal}`}
                      >
                        <button type="button" className={style.closeButton} onClick={close}>
                          <img
                            src="/img/img-delete.png"
                            alt={text('Close')}
                          />
                        </button>

                        <div className={style.top_block}>
                          <h1 className={style.modalTitle}>
                            {text('Editing the project')}
                          </h1>
                          <div className={style.photoGrid}>
                              {photos.map((photo, index) => (
                                <div key={getKeyFor(photo)} className={style.photoItem}>
                                    <AnyImage src={photo} alt="" />
                                    <button
                                      type="button"
                                      className={style.removePhoto}
                                      onClick={() => handleRemovePhoto(index)}
                                    >
                                      ✕
                                    </button>
                                </div>
                              ))}

                            <div className={style.photo_upload_block}>
                                <label htmlFor="upimg">
                                  <img
                                    src="/img/accommodation_img/photo.png"
                                    alt={text('Add photo')}
                                  />
                                  <span>{text('Add photo')}</span>
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

                        <form
                          onSubmit={onSubmit}
                          className={style.editForm}
                        >
                          <p className={`form__light-text ${style.fieldLabel}`}>
                            {text('Order description')}
                            <img
                              className={`modal_edit__icon ${style.fieldIcon}`}
                              src="/img/pencil_modal.svg"
                              alt=""
                            />
                          </p>
                          <textarea
                            placeholder={text('Order description')}
                            className={style.descriptionInput}
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                          ></textarea>

                          <p className={`form__light-text ${style.fieldLabel}`}>
                            {text('Service category')}
                            <img
                              className={`modal_edit__icon ${style.fieldIcon}`}
                              src="/img/multi_box.png"
                              alt=""
                            />
                          </p>
                          <div className={style.selectGrid}>
                            <select
                              className={style.selectInput}
                              value={selectedCategoryId}
                              onChange={(e) => {
                                setSelectedCategoryId(Number(e.target.value));
                                setSelectedSubcategoryId('');
                                setSelectedProductId('');
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
                              className={style.selectInput}
                              value={selectedSubcategoryId}
                              disabled={!selectedCategoryId}
                              onChange={(e) => {
                                setSelectedSubcategoryId(Number(e.target.value));
                                setSelectedProductId('');
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
                              className={style.selectInput}
                              value={selectedProductId}
                              onChange={(e) => setSelectedProductId(Number(e.target.value))}
                              disabled={!selectedSubcategoryId}
                            >
                              <option value="" disabled>
                                {text('Service')}
                              </option>
                              {selectedSubcategoryId && subcategories[Number(selectedSubcategoryId)]?.products.map(prodId => {
                                const product = products[prodId];
                                return product ? (
                                  <option key={prodId} value={prodId}>
                                    {product.name}
                                  </option>
                                ) : null;
                              })}
                            </select>
                          </div>

                          <p className={`form__light-text ${style.fieldLabel}`}>
                            {text('Budget')}
                            <img
                              className={`modal_edit__icon ${style.fieldIcon}`}
                              src="/img/price_icon.png"
                              alt=""
                            />
                          </p>
                          <input
                            type="text"
                            className={style.priceInput}
                            placeholder={text('Price')}
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                          />

                          <button
                            className={style.saveButton}
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
                    trigger={<img className={style.actionIcon} src="/img/added_img/fluent.svg" alt={text('Cancel order')} />}
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
                {hasChat &&
                  <Link className={style.actionLink} to={`/order/${id}/chat/${contractorId}`}>
                    <img className={style.actionIcon} src="/img/chat.png" alt={text('Chat with contractor')} />
                  </Link>
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketOrder;
