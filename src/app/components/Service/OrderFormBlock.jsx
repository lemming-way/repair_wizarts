import React, { useState } from 'react';
import { useLanguage } from '../../state/language';
import style from './ServiceDetail.module.scss';

// todo: Может быть, следует переделать в модалку?
function OrderFormBlock({
  show,
  setFormError,
  setShow,
  formError,
  user,
  onSubmit,
  getSumPrice,
  selectedServices,
  prices,
  ignoreSelectedServices,
  addRemoveIgnoreService,
  description,
  setDescription,
  address,
  setAddress,
}) {
  const text = useLanguage();
  const [visibleListSelectedServices, setVisibleListSelectedServices] = useState(false);

  if (!show) {
    return null;
  }

  return (
    <div className="popupdetailfwpruhwe">
      <div className="modfdfsdafasal-content">
        <div className="modal-content oformitzayavka werwertttt">
          <span
            onClick={() => {
              setFormError('');
              setShow(false);
            }}
          >
            <img className="close" src="/img/img-delete.png" alt="" />
          </span>
          <h1
            className="detailpopuptitle"
            style={{ paddingBottom: '10px' }}
          >
            {text('Place an order')}
          </h1>
          {selectedServices.length > 0 && <p style={{ marginBottom: '10px' }}>{text('Official prices')}</p>}

          {!user.id ? (
            <div
              className="modfdfsdafasal-error"
              style={{ marginBottom: '10px' }}
            >
              {text('Please sign up or log in')}
            </div>
          ) : null}

          <form onSubmit={onSubmit}>
            {formError && (
              <div className="auth-err" style={{ width: '100%' }}>
                {text(formError)}
              </div>
            )}

            <div className={`df ${style.modal_from_row}`}>
              <input type="text" placeholder={text('Your name')} defaultValue={user.name} disabled />
              <input className="ismrf" type="text" placeholder={text('Phone number')} defaultValue={user.phone} disabled />
            </div>

            <input
              type="text"
              placeholder={text('Address')}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              style={{ marginBottom: '10px' }}
              required
            />

            {selectedServices.length > 0 && (
              <div className="selected_service">
                <div className="selected_service__heading">
                  <p>{text('Selected services')}</p>
                  <div style={{ flex: 1 }}></div>
                  <p className="selected_service__text-light">{text('Total')}</p>
                  <p className="selected_service__text-price">
                    {getSumPrice()} ₽
                  </p>
                  <div
                    className="selected_service__arrow"
                    style={{
                      rotate: visibleListSelectedServices
                        ? '-90deg'
                        : '90deg',
                    }}
                    onClick={() =>
                      setVisibleListSelectedServices((prev) => !prev)
                    }
                  >
                    <img src="/img/sliderright.png" alt="" />
                  </div>
                </div>
                {visibleListSelectedServices ? (
                  <div className="selected_service__services">
                    {selectedServices.map(serviceName => (
                      <div
                        key={serviceName}
                        className="selected_service__service-row"
                      >
                        <p className="selected_service__name">
                          {prices[serviceName]?.name}
                        </p>
                        <div style={{ flex: 1 }}></div>
                        <p className="selected_service__price">
                          {prices[serviceName]?.price} ₽
                        </p>
                        <p className="selected_service__delivery">
                          {prices[serviceName]?.delivery}
                        </p>
                        <div className="selected_service__checkbox">
                          <input
                            checked={
                              !ignoreSelectedServices.includes(serviceName)
                            }
                            type="checkbox"
                            name=""
                            id=""
                            onChange={() => addRemoveIgnoreService(serviceName)}
                          />
                        </div>
                      </div>
                    ))}
                    <div className="selected_service__final">
                      <p className="selected_service__text-light">
                        {text('Total')}
                      </p>
                      <p className="selected_service__text-price">
                        {getSumPrice()} ₽
                      </p>
                    </div>
                  </div>
                ) : null}
              </div>
            )}

            <textarea
              className="descdetail"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={text('Problem description')}
              cols="30"
              rows="10"
            />
            <button
              className={`done ${style.fix_btn}`}
              type="submit"
              disabled={selectedServices.length === 0 || selectedServices.length === ignoreSelectedServices.length}
            >
              {text('Submit')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default OrderFormBlock;
