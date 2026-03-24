import { useRef, useState } from 'react';

import style from './AddOrderModal.module.css';
import { useLanguage } from '../../../state/language';
import { useUser, UserRole } from '../../../state/user';
import { useCreateOrder } from '../../../state/order';
import { useServices } from '../../../state/site-data';
import { AnyImage, getKeyFor } from '../../../shared/ui';

export default function AddOrderModal({
  setVisibleAddOrder,
  setVisibleOkModal,
  currentOrder,
}) {
  const text = useLanguage();
  const { user } = useUser();
  const { createOrder, isLoading } = useCreateOrder();
  const { services } = useServices();

  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState('');
  const [photos, setPhotos] = useState([]);
  const [formError, setFormError] = useState('');
  const inputRef = useRef(null);

  if (!currentOrder || !currentOrder.contractorId) {
    setVisibleAddOrder(false);
    return null;
  }

  const serviceId = currentOrder.serviceId;
  const cityId = currentOrder.city;
  const address = currentOrder.address;
  const contractorId = currentOrder.contractorId;
  const serviceName = services[serviceId]?.name || text('Unknown Service');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!user.id) {
      setFormError(text('You must be logged in to create an order.'));
      return;
    }
    if (user.role !== UserRole.Client) {
      setFormError(text('Only clients can create orders.'));
      return;
    }
    if (!description.trim()) {
      setFormError(text('Description cannot be empty.'));
      return;
    }
    const parsedBudget = Number(budget);
    if (!Number.isFinite(parsedBudget) || parsedBudget <= 0) {
      setFormError(text('Budget must be a positive number.'));
      return;
    }

    const fullDescription = description.trim();

    try {
      await createOrder({
        cityId,
        address,
        serviceId,
        contractorId,
        description: fullDescription,
        attachments: photos,
        price: parsedBudget,
      });
      setVisibleAddOrder(false);
      setVisibleOkModal(true);

      setDescription('');
      setBudget('');
      setPhotos([]);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : String(err));
    }
  };

  return (
    <div className={style.wrap}>
      <div className={style.block}>
        <div className={style.close} onClick={() => setVisibleAddOrder(false)}>
          <img src="/img/close.svg" alt="" />
        </div>
        <h2 className={style.heading}>{text('Propose an order')}</h2>
        {/* todo: загружать баланс отдельно */}
        {(user.details?.balance || 0) < 500 && (
          <p className={style.error}>
            {text('Please top up your balance by 500 rubles')}
          </p>
        )}
        {formError && (
          <p className={style.error}>{formError}</p>
        )}
        <div>
          <input
            className={style.input_heading}
            type="text"
            placeholder={text('Service')}
            value={serviceName}
            readOnly
          />
        </div>

        <div style={{ position: 'relative' }}>
          <p className={style.textarea_description}>{text('2000 characters, min 100')}</p>
          <textarea
            className={style.textarea}
            rows={8}
            placeholder={text('Write what needs to be done')}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          ></textarea>
        </div>

        <div className={style.row1}>
          <div>
            <p className={style.mini_heading}>{text('Budget')}</p>
            {/* todo: загружать баланс отдельно */}
            <p className={style.balance}>
              {text('Balance')} {0} ₽
            </p>
            <div className={style.icon}>
              <input
                className={style.input_balance}
                type="text"
                placeholder="500 - 20000"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className={style.block_photo}>
          <p className={style.heading_h3}>{text('Add photos')}</p>
          <div
            className={style.add_photo}
            onClick={() => !isLoading && inputRef.current?.click()}
            style={{ cursor: isLoading ? 'not-allowed' : 'pointer' }}
          >
            <img src="/img/icons/camera.png" alt="" />
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              multiple
              style={{ display: 'none' }}
              disabled={isLoading}
              onChange={(e) => {
                if (e.target.files) {
                  const files = Array.from(e.target.files);
                  setPhotos((prev) => [...prev, ...files].slice(0, 10));
                  e.target.value = '';
                }
              }}
            />
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            {photos.map((photo, idx) => (
              <div key={getKeyFor(photo)} style={{ position: 'relative' }}>
                <AnyImage
                  src={photo}
                  alt="preview"
                  style={{
                    width: 60,
                    height: 60,
                    objectFit: 'cover',
                    borderRadius: 8,
                  }}
                />
                <button
                  type="button"
                  style={{
                    position: 'absolute',
                    top: -5,
                    right: -5,
                    background: 'rgba(255,255,255,0.7)',
                    border: 'none',
                    cursor: 'pointer',
                    borderRadius: '50%',
                    width: 20,
                    height: 20,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 0,
                  }}
                  onClick={() =>
                    setPhotos((prev) => prev.filter((_, i) => i !== idx))
                  }
                  disabled={isLoading}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className={style.buttons}>
          <button
            className={style.button}
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? text('Loading...') : text('Send')}
          </button>
          <button
            type="button"
            className={style.button_back}
            onClick={() => setVisibleAddOrder(false)}
            disabled={isLoading}
          >
            {text('Back')}
          </button>
        </div>
      </div>
    </div>
  );
}
