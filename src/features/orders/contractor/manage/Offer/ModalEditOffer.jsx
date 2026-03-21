import { useState, useEffect } from 'react';
import style from '../../../OrderModals.module.css';
import { useLanguage } from '../../../../../state/language';
import { useCreateOffer, useUpdateOffer, TimeUnit } from '../../../../../state/order';
import { useUser, UserRole } from '../../../../../state/user';

// Вспомогательная функция для преобразования offer.readyIn в значение для select
function getReadyInSelectValue(readyIn) {
  if (!readyIn) return '';
  const { value, unit } = readyIn;
  if (value === 0) return 'ready';
  if (unit === TimeUnit.HOURS) {
    const hoursOptions = [1, 2, 3, 4, 6, 8, 24];
    if (hoursOptions.includes(value)) {
      return String(value);
    }
  }
  if (value === 3 && unit === TimeUnit.DAYS) return '72'; // 3 дня соответствуют 72 часам в селекте
  if (value === 1 && unit === TimeUnit.WEEKS) return '168'; // 7 дней соответствуют 168 часам в селекте
  return 'ready'; // По умолчанию или для несовпадающих значений
}

export default function ModalEditOffer({ orderId, offer, onSuccess, onCancel }) {
  const text = useLanguage();
  const { user } = useUser();

  const isEditing = !!offer;
  const { createOffer, isPending: isCreating } = useCreateOffer();
  const { updateOffer, isPending: isUpdating } = useUpdateOffer();
  const isPending = isCreating || isUpdating;

  const [error, setError] = useState('');
  const [comment, setComment] = useState(offer?.comment || '');
  const [price, setPrice] = useState(offer?.price ? String(offer.price) : '');
  const [readyInValue, setReadyInValue] = useState(getReadyInSelectValue(offer?.readyIn));

  useEffect(() => {
    setComment(offer?.comment || '');
    setPrice(offer?.price ? String(offer.price) : '');
    setReadyInValue(getReadyInSelectValue(offer?.readyIn));
    setError('');
  }, [offer]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (!comment || !price || !readyInValue) {
        setError(text('Please fill in all mandatory fields.'));
        return;
      }

      if (user.role !== UserRole.Contractor) {
        setError(text('Only contractors can make offers.'));
        return;
      }

      const parsedPrice = Number(price);
      if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
        setError(text('Please enter a valid price.'));
        return;
      }

      let value = Number(readyInValue);
      let unit = TimeUnit.HOURS; // По умолчанию часы

      if (readyInValue === 'ready') {
        value = 0;
      }
      else if (readyInValue === '72') { // 3 дня
        value = 3;
        unit = TimeUnit.DAYS;
      }
      else if (readyInValue === '168') { // 7 дней
        value = 1;
        unit = TimeUnit.WEEKS;
      }

      const payload = {
        orderId: orderId,
        comment: comment,
        price: parsedPrice,
        readyIn: { value, unit },
      };

      if (isEditing) {
        await updateOffer({ offerId: offer.id, ...payload });
        console.log('Успешно обновлено предложение!');
      }
      else {
        await createOffer(payload);
        console.log('Успешно отправлено предложение!');
      }

      onSuccess?.();
    } catch (err) {
      console.error('Ошибка при отправке/обновлении:', err);
      setError(text(err.message || (isEditing ? 'Failed to update offer. Please try again.' : 'Error sending offer')));
    }
  };

  return (
    <>
      <div className={style.wrap}>
        <div className={style.block}>
          <div
            className={style.close}
            onClick={() => onCancel?.()}
          >
            <img src="/img/close.svg" alt="" />
          </div>

          <h1 className={style.modal_heading_centered}>
            {text(isEditing ? 'Editing offer' : 'Offer a service')}
          </h1>

          {error && <p className={style.error}>{error}</p>}

          <form
            className={style.modal_edit_offer__comment_wrap}
            onSubmit={handleSubmit}
          >
            <div className={style.modal_edit_offer__comment_block}>
              <div className={style.modal_edit_offer__icon_chat}>
                <img src="/img/chat.png" alt="" />
              </div>
              {/* <div className={style.error}>
              Пожалуйста пополните баланс на 100 рублей
            </div> */}

              <textarea
                style={{ marginBottom: '30px' }}
                className={style.modal_edit_offer__comment_input}
                rows={4}
                placeholder={text("Write how you will fix the client's device..")}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                disabled={isPending}
              />

              <div className={style.modal_edit_offer__last_row}>
                <img className={style.modal_edit_offer__dollar_img} src="/img/baks.png" alt="" />
                <div className={style.modal_edit_offer__price_block}>
                  <label className={style.modal_edit_offer__label_price} htmlFor="price">
                    {text('Cost')}
                  </label>
                  <input
                    className={style.modal_edit_offer__input_price}
                    placeholder={text('specify the cost')}
                    type="text"
                    id="price"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    min="0"
                    disabled={isPending}
                  />
                  <img className={style.modal_edit_offer__price_block_ruble_img} src="/img/simvol_rubl.png" alt="" />
                </div>

                <div className={style.modal_edit_offer__timer_block}>
                  <img src="/img/timer.png" alt="" />
                  <select
                    className={style.modal_edit_offer__select_timer}
                    value={readyInValue}
                    onChange={(e) => setReadyInValue(e.target.value)}
                    disabled={isPending}
                  >
                    <option value="">{text('Select')}</option>
                    <option value="ready">{text('Ready to go')}</option>
                    <option value="1">1 {text('hour')}</option>
                    <option value="2">2 {text('hours')}</option>
                    <option value="3">3 {text('hours')}</option>
                    <option value="4">4 {text('hours')}</option>
                    <option value="6">6 {text('hours')}</option>
                    <option value="8">8 {text('hours')}</option>
                    <option value="24">24 {text('hours')}</option>
                    <option value="72">3 {text('days')}</option>
                    <option value="168">7 {text('days')}</option>
                  </select>
                </div>
              </div>

              <div className={style.modal_edit_offer__flex_row}>
                <button type="submit" className={style.modal_edit_offer__button_go} disabled={isPending}>
                  {isPending ? text('Saving...') : text(isEditing ? 'Save' : 'Continue')}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
