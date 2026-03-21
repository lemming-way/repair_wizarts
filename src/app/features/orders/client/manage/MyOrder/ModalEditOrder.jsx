import { useState, useEffect } from 'react';
import { Navigation } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';

import style from '../../../OrderModals.module.css';
import { AnyImage, getKeyFor } from 'app/shared/ui';
import { useServices } from 'app/state/site-data';
import { useUpdateOrder } from 'app/state/order';
import { useLanguage } from 'app/state/language';

export default function ModalEditOrder({
  order,
  onSuccess,
  onCancel
}) {
  const text = useLanguage();
  const [address, setAddress] = useState(order?.address || '');
  const [description, setDescription] = useState(order?.description || '');
  const [desiredPrice, setDesiredPrice] = useState(order?.desiredPrice || '');
  const [attachments, setAttachments] = useState(Object.values(order?.attachments || {}));

  const { services } = useServices();
  const { updateOrder } = useUpdateOrder();

  useEffect(() => {
    setAddress(order?.address || '');
    setDescription(order?.description || '');
    setDesiredPrice(order?.desiredPrice || '');
    setAttachments(order?.attachments || []);
  }, [order]);

  const addImages = (event) => {
    const files = Array.from(event.target.files);
    const filteredFiles = files
      .filter(file => attachments.every(existing => {
        return !existing.file ||
               existing.file.name !== file.name ||
               existing.file.size !== file.size ||
               existing.file.type !== file.type ||
               existing.file.lastModified !== file.lastModified;
      }));
    if (attachments.length + filteredFiles.length > 10) {
      //~ setError(text('You can upload no more than 10 files.'));
      return;
    }
    //~ setError('');
    setAttachments([...attachments, ...filteredFiles]);
  };

  const removeImage = (imageToRemove) => {
    setAttachments(prev => prev.filter(image => image !== imageToRemove));
  };

  const onSubmitEdit = async (e) => {
    e.preventDefault();
    const payload = {
      orderId: order.id,
      address,
      description,
      desiredPrice: Number(desiredPrice),
      attachments
    };

    try {
      await updateOrder(payload);
      onSuccess?.();
    } catch (error) {
      console.error('Failed to update order:', error);  // todo: Добавить видимое сообщение об ошибке
    }
  };

  return (
    <>
      <div className={style.wrap}>
        <div className={`${style.block} ${style.block_width_95}`}>
          <div
            className={style.close}
            onClick={() => onCancel?.()}
          >
            <img src="/img/close.svg" alt="" />
          </div>

          <h1 className={style.modal_heading_centered}>
            {text('Editing the project')}
          </h1>
          <div
            className={`${style.modal_edit_order__swiper_row} ${style.modal_edit_order__flex_wrap_row}`}
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
              {attachments.map(image => (
                <SwiperSlide key={getKeyFor()} className={style.modal_edit_order__slide_with_delete}>
                  <AnyImage src={image} alt="" />
                  <button className={style.modal_edit_order__delete_image_btn} onClick={() => removeImage(image)}>
                    &times;
                  </button>
                </SwiperSlide>
              ))}
            </Swiper>

            <div
              className={`${style.modal_edit_order__photo_upload} ${style.modal_edit_order__photo_upload_block}`}
            >
              <div className={style.modal_edit_order__photo_upload_img}>
                <label htmlFor="upimg">
                  <img
                    src="/img/accommodation_img/photo.png"
                    alt="no absent"
                  />
                </label>
                <input
                  type="file"
                  onChange={addImages}
                  accept="image/png, image/jpeg"
                  multiple
                  id="upimg"
                  className={style.modal_edit_order__hidden_input}
                />
              </div>
            </div>
          </div>

          <form
            onSubmit={onSubmitEdit}
            className={style.modal_edit_order__flex_column_form}
          >
            <p className={style.modal_edit_order__form_light_text}>
              {text('Service')}
              <img
                className={style.modal_edit_order__icon}
                src="/img/multi_box.png"
                alt=""
              />
            </p>
            <p className={style.modal_edit_order__input_small_width_margin_bottom}>
              {services?.[order.serviceId]?.name ?? ''}
            </p>

            <p className={style.modal_edit_order__form_light_text}>
              {text('Address')}
              <img
                className={style.modal_edit_order__icon}
                src="/img/pencil_modal.svg"
                alt=""
              />
            </p>
            <input
              type="number"
              className={style.modal_edit_order__input_small_width_margin_bottom}
              placeholder={text('Address')}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />

            <p className={style.modal_edit_order__form_light_text}>
              {text('Order description')}
              <img
                className={style.modal_edit_order__icon}
                src="/img/pencil_modal.svg"
                alt=""
              />
            </p>
            <textarea
              className={`${style.textarea} ${style.textarea_margin_bottom_20}`}
              placeholder={text('Order description')}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            ></textarea>

            <p className={style.modal_edit_order__form_light_text}>
              {text('Budget')}
              <img
                className={style.modal_edit_order__icon}
                src="/img/price_icon.png"
                alt=""
              />
            </p>
            <input
              type="number"
              className={style.modal_edit_order__input_small_width_margin_bottom}
              placeholder={text('Price')}
              value={desiredPrice}
              onChange={(e) => setDesiredPrice(e.target.value)}
            />

            <button
              className={`${style.modal_edit_order__button_done} ${style.modal_edit_order__button_edit} ${style.modal_edit_order__button_small_width_margin_auto}`}
              type="submit"
            >
              {text('Save')}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
