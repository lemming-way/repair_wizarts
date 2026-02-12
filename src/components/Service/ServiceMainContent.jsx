import React, { useState } from 'react';
import { Navigation } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';

import YMap from '../Map';
import OrderFormBlock from './OrderFormBlock';

import style from './ServiceDetail.module.scss';

function ServiceMainContent({
  text,
  currentServiceDetails,
  prices,
  selectedServices,
  addRemoveService,
  selectedContractor,
  onSelectContractor,
  showOrderForm,
  setShowOrderForm,
  contractors,
  formError,
  setFormError,
  user,
  getSumPrice,
  ignoreSelectedServices,
  addRemoveIgnoreService,
  description,
  setDescription,
  address,
  setAddress,
  onSubmit,
}) {
  const [search, setSearch] = useState('');

  return (
    <div>
      <section
        className={`main__info container detail-container ${style.container_service}`}
      >
        <div className="main__info__content">
          <h1>
            {text('Repair service cost for')}{' '}
            <strong>{currentServiceDetails.name}</strong>
          </h1>
          <div className="df align-center">
            <img src="/img/search.png" className="paugfheotw" alt="" />
            <input
              type="text"
              placeholder={text('Search...')}
              className="searchaproblemEnter"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* блок с iphone */}
          <div className={`main__info__image ${style.iphone_mobile}`}>
            <img
              className={style.iphone_mobile__img}
              src="/img/detail-iphone.png"
              alt=""
            />
            <p>
              {text('Spare parts for the repair are already included in the service cost. This is the final price')}
            </p>
          </div>
          {/* блок, если не выбраны услуги */}
          {Object.keys(prices).length === 0 && (
            <div className="order__no-cards">
              <img src="/img/many_people.png" alt="" />
              <p>
                {text('Please select the organization closest to your home on the map below and place an order by choosing the services you need.')}
              </p>
            </div>
          )}

          {/* список услуг */}
          <div className={`order__cards__to__scrolls ${style.orders_list}`}>
            {Object.keys(prices).length > 0 &&
              Object.entries(prices).map(([id, obj]) => (
                <div
                  key={id}
                  className={`first__s__card ${style.order_row}`}
                >
                  <div className="main__info__content__card">
                    <div className="main__card__first">
                      <h4>{text('Service')}</h4>
                      <p>
                        {obj['name']} {obj['category']}
                      </p>
                    </div>
                    <div style={{ flex: 1 }}></div>
                    <div
                      className="main__card__price"
                      style={{ whiteSpace: 'nowrap' }}
                    >
                      <p>{obj['price']} ₽</p>
                    </div>
                    <div className="main__card__second">
                      <p>{obj['delivery']}</p>
                      <button
                        className="pickfaf"
                        onClick={() => addRemoveService(id)}
                      >
                        {selectedServices.includes(id)
                          ? text('Remove')
                          : text('Select')}
                      </button>
                    </div>
                    <div
                      className={`main__card__third ${
                        selectedServices.includes(id)
                          ? 'main__card__third--active'
                          : null
                      }`}
                    ></div>
                  </div>
                  <div className="main__card__third activeijpqwothweoruh"></div>
                </div>
              ))}
          </div>

          {/* todo: Перебрасывать на форму входа/регистрации, если пользователь не авторизован */}
          <div className={style.button_wrap}>
            <button
              className={style.button_services}
              onClick={() => {
                setShowOrderForm(true);
              }}
            >
              {text('Place an order')}
            </button>
          </div>

          <OrderFormBlock
            show={showOrderForm}
            setFormError={setFormError}
            setShow={setShowOrderForm}
            formError={formError}
            user={user}
            onSubmit={onSubmit}
            getSumPrice={getSumPrice}
            selectedServices={selectedServices}
            prices={prices}
            ignoreSelectedServices={ignoreSelectedServices}
            addRemoveIgnoreService={addRemoveIgnoreService}
            description={description}
            setDescription={setDescription}
            address={address}
            setAddress={setAddress}
          />
        </div>

        <div className={`main__info__image ${style.iphone_desktop}`}>
          <img
            src="/img/detail-iphone.png"
            alt=""
            style={{
              width: '540px',
              height: '570px',
              objectFit: 'contain',
            }}
          />
          <p>
            {text('Spare parts for the repair are already included in the service cost. This is the final price')}
          </p>
        </div>
      </section>

      {/* цены */}
      <section className="detail__price">
        <div className="container detail-price-container">
          <Swiper
            slidesPerView={4}
            spaceBetween={30}
            navigation={true}
            modules={[Navigation]}
            className={style.swiper_price}
            breakpoints={{
              0: {
                slidesPerView: 2,
              },
              800: {
                slidesPerView: 3,
              },
              1124: {
                slidesPerView: 4,
              },
            }}
          >
            {Object.entries(prices).map(([id, obj]) => (
              <SwiperSlide key={id} className="sliderr">
                <div
                  className={`detail__price__card ${
                    !selectedServices.includes(id) ? 'red' : null
                  }`}
                >
                  <div className="price">
                    <h1>{obj['price']}</h1>
                    <img width="10px" src="/img/rubl.png" alt="" />
                  </div>
                  <p>{obj['category']}</p>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </section>

      <section className="map">
        <YMap
          contractors={contractors}
          selectedContractor={selectedContractor}
          selectContractor={onSelectContractor}
        />
      </section>
    </div>
  );
}

export default ServiceMainContent;
