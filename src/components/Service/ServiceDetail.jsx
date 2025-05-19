import { useEffect, useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { selectUI } from '../../slices/ui.slice';
import { Navigation } from 'swiper';
import { useNavigate, useParams } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { selectUser } from '../../slices/user.slice';
import { selectServices } from '../../slices/services.slice';
import { getMasterByUsername } from '../../services/user.service';
import { createOrder } from '../../services/order.service';
import { useService } from '../../hooks/useService';
import Map from '../Map';
import ServiceDetailContext from './ServiceDetailContext';
import '../../scss/detail.scss';
import '../../scss/media.css';
import { getMasterRepairs } from '../../services/service.service';
import { Link } from 'react-router-dom';

import style from './serviceDetail.module.scss';

function ServiceDetail() {
  const test_price = [
    {
      price: 500,
      model: 'iphone 15 pro max',
      delivery: 'от 30 мин',
      name: 'Замена стекла',
      img: 'https://cdn-icons-png.flaticon.com/512/10473/10473245.png',
    },
    {
      price: 300,
      model: 'iphone 14',
      delivery: 'от 30 мин',
      name: 'Замена аккумулятора',
      img: 'https://cdn-icons-png.flaticon.com/512/310/310273.png',
    },
    {
      price: 450,
      model: 'samsung s23',
      delivery: 'от 1 часа',
      name: 'Ремонт дисплея',
      img: 'https://cdn-icons-png.flaticon.com/512/3050/3050525.png',
    },
    {
      price: 350,
      model: 'xiaomi 13',
      delivery: 'от 2 часов',
      name: 'Чистка устройства',
      img: 'https://cdn-icons-png.flaticon.com/512/10342/10342978.png',
    },
    {
      price: 700,
      model: 'google pixel 7',
      delivery: 'от 1 часа',
      name: 'Замена задней крышки',
      img: 'https://cdn-icons-png.flaticon.com/512/10473/10473240.png',
    },
    {
      price: 550,
      model: 'oneplus 10',
      delivery: 'от 3 часов',
      name: 'Ремонт камеры',
      img: 'https://cdn-icons-png.flaticon.com/512/2830/2830340.png',
    },
    {
      price: 400,
      model: 'sony xperia 1 iv',
      delivery: 'от 2 часов',
      name: 'Обновление программного обеспечения',
      img: 'https://cdn-icons-png.flaticon.com/512/3281/3281309.png',
    },
    {
      price: 600,
      model: 'samsung s22 ultra',
      delivery: 'от 1 часа',
      name: 'Замена зарядного порта',
      img: 'https://cdn-icons-png.flaticon.com/512/310/310272.png',
    },
  ];

  // выбор услуг
  const [selectedService, setSelectedService] = useState([]);

  const [visibleListSelectedServices, setVisibleListSelectedServices] =
    useState(false);
  const [visibleConfirm, setVisibleConfirm] = useState(false);

  const [ignoreSelectedServices, setIgnoreSelectedServices] = useState([]);

  const navigate = useNavigate();
  const { id } = useParams();

  const user = useSelector(selectUser);
  const services = useSelector(selectServices);
  const repairMasters = useService(getMasterRepairs, []);
  const device =
    useMemo(
      () => services?.find((v) => v.id === +id) || {},
      [services.devices, id],
    ) || [];

  const [show, setShow] = useState(false);

  const [formError, setFormError] = useState('');
  const [visibleBlockPayment, setVisibleBlockPayment] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [errorBalance] = useState(true);
  const [errorCash] = useState(true);
  const [errorSumm] = useState(true);

  const [selected, setSelected] = useState([]);
  const selectedValue = useMemo(() => ({ selected, setSelected }), [selected]);

  const [selectedMaster, setSelectedMaster] = useState({});

  const onSelectMaster = (e, data) => {
    return getMasterByUsername(data).then(setSelectedMaster);
  };

  const [invoice, setInvoice] = useState({
    final: 0,
    list: [],
  });
  const [description, setDescription] = useState('');

  const masters = useMemo(
    () =>
      repairMasters.data.reduce(
        (
          arr,
          { master_id, repair_id, address_latitude, address_longitude },
        ) => {
          if (arr.find((v) => v.id === master_id)) {
            return arr;
          }
          const repairService = services.repair_types.find(
            ({ id: repid, device_id }) =>
              device_id === +id && repair_id === repid,
          );
          if (!repairService) {
            return arr;
          }
          if (master_id === user.master?.[0]?.username) {
            return arr;
          }

          return [
            ...arr,
            {
              id: master_id,
              latitude: address_latitude,
              longitude: address_longitude,
            },
          ];
        },
        [],
      ),
    [repairMasters.data, user.master, services],
  );
  const repairFiltered = useMemo(
    () =>
      repairMasters.data.reduce(
        (arr, { master_id, repair_id, price, time }) => {
          if (master_id !== selectedMaster.username) {
            return arr;
          }

          const repairService = services.repair_types.find(
            ({ id: repid, device_id }) =>
              device_id === +id && repair_id === repid,
          );
          if (!repairService) {
            return arr;
          }

          arr.push({ ...repairService, price, time });
          return arr;
        },
        [],
      ),
    [selectedMaster.username],
  );

  useEffect(() => {
    const invoiceDefault = {
      final: 0,
      list: [],
    };
    const invoice = selected.reduce((state, value) => {
      const { name, price } = repairFiltered.find((v) => v.id === value);
      return {
        final: state.final + price,
        list: [
          ...state.list,
          {
            name,
            price,
          },
        ],
      };
    }, invoiceDefault);
    setInvoice(invoice);
  }, [selected]);

  const [search, setSearch] = useState('');

  const onSubmit = (e) => {
    e.preventDefault();

    const payload = {
      client_message: description,
      client_price: invoice.final,
      repairs_id: selected,
      device_id: +id,
      master_username: selectedMaster.username,
    };

    return createOrder(payload)
      .then(() => navigate('/client/chat'))
      .catch((err) => setFormError(err.message));
  };

  useEffect(() => {
    document.title = device.name;
  }, [device]);

  const [goToR] = useState(false);

  function getSumPrice() {
    var sum = 0;
    selectedService.map((index) => {
      if (!ignoreSelectedServices.includes(index)) {
        sum += test_price[index]['price'];
      }
    });
    return sum;
  }

  function addRemoveIgnoreService(index) {
    var list = [...ignoreSelectedServices];
    if (list.includes(index)) {
      list = list.filter((number) => number !== index);
    } else {
      list.push(index);
    }
    setIgnoreSelectedServices(list);
  }

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalImage, setModalImage] = useState('');

  // Массив картинок для слайдера в модальном окне
  // const images = [
  //     '/img/sentence_img/iphone-x.png',
  //     '/img/sentence_img/iphone-x.png', // Здесь можно добавить другие изображения
  //     '/img/sentence_img/iphone-x.png',
  // ]; ###

  // Функция для открытия модального окна
  const openModal = (imageSrc) => {
    setModalImage(imageSrc); // Устанавливаем путь к картинке
    setIsModalOpen(true); // Открываем модальное окно
  };

  // Функция для закрытия модального окна
  const closeModal = () => {
    setIsModalOpen(false); // Закрываем модальное окно
  };

  function addRemoveService(index) {
    var list = [...selectedService];
    if (list.includes(index)) {
      list = list.filter((number) => number !== index);
    } else {
      list.push(index);
    }
    setSelectedService(list);
  }

  return (
    <ServiceDetailContext.Provider value={selectedValue}>
      {/* блок с оплатой */}
      {visibleBlockPayment ? (
        <div className={style.blockPayment_wrap}>
          {errorBalance ? (
            <div className={style.error}>
              Пополните, пожалуйста, баланс на 500р
            </div>
          ) : null}

          {errorCash ? (
            <div className={style.error}>Оплатите мастеру при встрече</div>
          ) : null}

          {errorSumm ? (
            <div className={style.error}>
              С вашего баланса спишется 500 рублей{' '}
            </div>
          ) : null}

          <div className={style.blockPayment}>
            <div
              className={style.close}
              onClick={() => setVisibleBlockPayment(false)}
            >
              <img src="/img/close.svg" alt="" />
            </div>

            <h2>Оплата</h2>
            <div className={style.row}>
              <div className={style.block_v2}>
                <p>Оплата через сайт</p>
                <div className={style.radio}>
                  <input
                    type="radio"
                    id="inputSite"
                    name="radioPayments"
                    checked={selectedIdx === 0}
                    onChange={() => setSelectedIdx(0)}
                  />
                  <label htmlFor="inputSite">Баланс: 0р</label>
                </div>
                <p>Обычная цена сделки без риска</p>
                <p className={style.mini_text}>
                  + 9% при пополнение кошелька баланса. Цена в отклике
                  исполнителя уже включает в себя комиссию
                </p>
              </div>

              <div
                className={style.block}
                style={{ position: 'relative', top: '35px' }}
              >
                {/* <p>Оплата наличными</p> */}
                <div className={style.radio}>
                  <input
                    type="radio"
                    id="inputCash"
                    name="radioPayments"
                    checked={selectedIdx === 1}
                    onChange={() => setSelectedIdx(1)}
                  />
                  <label htmlFor="inputCash">Оплата наличными</label>
                </div>
                <p className={style.mini_text}>
                  Оплата напрямую исполнителю <br /> Без гарантий и компенсаций
                  RepairWizarts: вы напрямую договариваетесь с исполнителем
                  об условиях и способе оплаты.
                </p>
              </div>
            </div>

            <div
              className={style.button_go}
              onClick={() => {
                setVisibleBlockPayment(false);
                setVisibleConfirm(true);
              }}
            >
              Перейти
            </div>
          </div>
        </div>
      ) : null}

      {/* Вы подтвердили производителя работ  */}
      {visibleConfirm ? (
        <div className={style.blockConfirm_wrap}>
          <div
            className={style.blockPayment}
            style={{ padding: '50px 50px 50px 50px' }}
          >
            <div
              className={style.close}
              onClick={() => setVisibleConfirm(false)}
            >
              <img src="/img/close.svg" alt="" />
            </div>

            <h2>Вы подтвердили производителя работ</h2>
            <div className={style.row}>
              <p>Подтверждая исполнителя вы открываете с ним диалог в чате</p>
            </div>

            <Link to="/client/chat/168789461" className={style.button_confirm}>
              Перейти
            </Link>
          </div>
        </div>
      ) : null}

      <div>
        <section
          className={`main__info container detail-container ${style.container_service}`}
        >
          <div className="main__info__content">
            <h1>
              Стоимость услуг по ремонту <strong>{device.name}</strong>
            </h1>
            <div className="df align-center">
              <img src="/img/search.png" className="paugfheotw" alt="" />
              <input
                type="text"
                placeholder="Поиск..."
                className="searchaproblemEnter"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* блок с iphone */}
            <div className={`main__info__image ${style.iphone_mobile}`}>
              <img
                // src={SERVER_PATH + device.picture}
                className={style.iphone_mobile__img}
                src="/img/detail-iphone.png"
                alt=""
              />
              <p>
                Запчасти для ремонта уже включены в стоимость работы. Это
                окончательная цена
              </p>
            </div>

            {/* блок, если не выбраны услуги */}
            <div className="order__no-cards">
              <img src="/img/many_people.png" alt="" />
              <p>
                Пожалуйста, выберите на карте ниже организацию которая ближе к
                вашему дому и оформите заказ выбрав те услуги которые вам
                необходимы!
              </p>
            </div>

            {/* список услуг */}
            <div className={`order__cards__to__scrolls ${style.orders_list}`}>
              {/* список услуг - так было */}
              {/* {repairFiltered?.length ? (
                                search.length > 0 ? (repairFiltered.map((v) => v.description.toLowerCase().includes(search.toLowerCase()) && (
                                    <ServiceDetailCard {...v} key={v.id} />
                                ))) : (repairFiltered?.map((v) => (
                                    <ServiceDetailCard {...v} key={v.id} />
                                )))
                            ) : (
                                <h1>Для отображения услуг выберите мастера на карте ниже.</h1>
                            )} */}

              {test_price.map((obj, index) => (
                <>
                  <div
                    key={index}
                    className={`first__s__card ${style.order_row}`}
                  >
                    <div className="main__info__content__card">
                      <div className="main__card__first">
                        <h4>Услуга</h4>
                        <p>
                          {obj['name']} {obj['model']}
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
                          onClick={() => addRemoveService(index)}
                        >
                          {selectedService.includes(index)
                            ? 'Убрать'
                            : 'Выбрать'}
                        </button>
                      </div>
                      <div
                        className={`main__card__third ${
                          selectedService.includes(index)
                            ? 'main__card__third--active'
                            : null
                        }`}
                      ></div>
                    </div>
                    <div className="main__card__third activeijpqwothweoruh"></div>
                  </div>
                </>
              ))}
            </div>
            <div className={style.button_wrap}>
              <button
                className={style.button_services}
                onClick={() => {
                  setShow(true);
                }}
              >
                {' '}
                Оформить заказ
              </button>
            </div>

            <div
              className="popupdetailfwpruhwe"
              style={show ? null : { display: 'none' }}
            >
              <div className="modfdfsdafasal-content">
                <div
                  className={
                    goToR
                      ? 'modal-content oformitzayavka gomodaldetailfgg werwertttt'
                      : 'modal-content oformitzayavka werwertttt'
                  }
                >
                  <span
                    onClick={() => {
                      setShow(false);
                    }}
                  >
                    <img className="close" src="/img/img-delete.png" alt="" />
                  </span>
                  <h1
                    className="detailpopuptitle"
                    style={{ paddingBottom: '10px' }}
                  >
                    Оформить заказ
                  </h1>
                  <p style={{ marginBottom: '10px' }}>Официальные цены</p>

                  {/* {!ui.isAuthorized  */}
                  {true ? (
                    <div
                      className="modfdfsdafasal-error"
                      style={{ marginBottom: '10px' }}
                    >
                      Пожалуйста, зарегистрируйтесь или войдите
                    </div>
                  ) : null}

                  <form onSubmit={onSubmit}>
                    {formError && (
                      <div className="auth-err" style={{ width: '100%' }}>
                        {formError}
                      </div>
                    )}

                    <div className={`df ${style.modal_from_row}`}>
                      <input
                        type="text"
                        placeholder="Ваше имя"
                        defaultValue={user.name}
                        disabled
                      />
                      <input
                        className="ismrf"
                        type="text"
                        placeholder="Номер телефона"
                        defaultValue={user.phone}
                        disabled
                      />
                    </div>

                    {/* список выбранных услуг */}
                    <div className="selected_service">
                      <div className="selected_service__heading">
                        <p>Выплывающий список проблемы</p>
                        <div style={{ flex: 1 }}></div>
                        <p className="selected_service__text-light">Всего</p>
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
                          {selectedService.map((index, i) => (
                            <div
                              key={i}
                              className="selected_service__service-row"
                            >
                              <p className="selected_service__name">
                                {test_price[index]['name']}
                              </p>
                              <div style={{ flex: 1 }}></div>
                              <p className="selected_service__price">
                                {test_price[index]['price']} ₽
                              </p>
                              <p className="selected_service__delivery">
                                {test_price[index]['delivery']}
                              </p>
                              <div className="selected_service__checkbox">
                                <input
                                  checked={
                                    !ignoreSelectedServices.includes(index)
                                  }
                                  type="checkbox"
                                  name=""
                                  id=""
                                  onChange={() => addRemoveIgnoreService(index)}
                                />
                              </div>
                            </div>
                          ))}
                          <div className="selected_service__final">
                            <p className="selected_service__text-light">
                              Всего
                            </p>
                            <p className="selected_service__text-price">
                              {getSumPrice()} ₽
                            </p>
                          </div>
                        </div>
                      ) : null}
                    </div>

                    <textarea
                      className="descdetail"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Описание проблемы"
                      cols="30"
                      rows="10"
                    />
                    {/* так был сделан вывод выбранных услуг */}
                    {/* <div className="service-detail-modal__price">
                                            <ul className="service-detail-modal-price__list">
                                                {invoice.list.map((v, i) => (
                                                    <li className="service-detail-modal-price__item" key={i}>
                                                        <span className="service-detail-modal-price__name">{v.name} — </span>
                                                        <span className="service-detail-modal-price__price">{v.price}₽</span>
                                                    </li>
                                                ))}
                                            </ul>
                                            <div className="service-detail-modal-price__final">Итого: {invoice.final}₽</div>
                                        </div> */}
                    <button
                      onClick={() => {
                        setShow(false);
                        setVisibleBlockPayment(true);
                      }}
                      className={`done ${style.fix_btn}`}

                      // type='submit'
                    >
                      Отправить
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>

          <div className={`main__info__image ${style.iphone_desktop}`}>
            <img
              // src={SERVER_PATH + device.picture}
              src="/img/detail-iphone.png"
              alt=""
              style={{
                width: '540px',
                height: '570px',
                objectFit: 'contain',
              }}
            />
            <p>
              Запчасти для ремонта уже включены в стоимость работы. Это
              окончательная цена
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
              {test_price.map((obj, index) => (
                <SwiperSlide key={index} className="sliderr">
                  <div
                    className={`detail__price__card ${
                      !selectedService.includes(index) ? 'red' : null
                    }`}
                  >
                    <div className="price">
                      <h1>{obj['price']}</h1>
                      <img width="10px" src="/img/rubl.png" alt="" />
                    </div>
                    <p>{obj['model']}</p>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </section>
        {/* цены - так было */}
        {/* <section className="detail__price">
                    <div className="container detail-price-container">
                        <Swiper
                            slidesPerView={4}
                            spaceBetween={30}
                            navigation={true}
                            modules={[Navigation]}
                            className="mySwiper"
                            breakpoints={{
                                0: {
                                    slidesPerView: 2
                                },
                                800: {
                                    slidesPerView: 3
                                },
                                1124: {
                                    slidesPerView: 4
                                },
                            }}
                        >
                            {repairFiltered?.map((v) => (
                                <SwiperSlide className="sliderr" key={v.id}>
                                    <ServiceDetailPrice
                                        {...v}
                                        price={v.price}
                                        repair_id={v.repair_id}
                                    />
                                </SwiperSlide>
                            ))}
                        </Swiper>
                    </div>
                </section> */}
        <section className="map">
          <Map
            masters={masters}
            selectedMaster={selectedMaster}
            selectMaster={onSelectMaster}
          />
        </section>
      </div>

      {/* инфо о мастере */}
      <div style={{ display: 'flex', position: 'absolute' }}>
        <div style={{position: 'absolute', zIndex: 1, bottom: "0", left: "370px", display: 'flex', gap: '10px'}}>
          <div className="info_master" >
            <div className="info_master__close">
              <img src="/img/close.svg" alt="" />
            </div>

            <div className="info_master__row1">
              <img src="/img/profile__image.png" alt="" />
              <div className="info_master__about">
                <p>Алексей Михеев</p>
                <p>Частный мастер</p>
                <div className="info_master__stars">
                  <img src="/img/star.png" alt="" />
                  <img src="/img/star.png" alt="" />
                  <img src="/img/star.png" alt="" />
                  <img src="/img/star.png" alt="" />
                  <img src="/img/star.png" alt="" />
                </div>
                <div className="info_master__row-links">
                  <Link to="/client/feedback/1">23 отзыва</Link>
                  <a href="#">Подробнее</a>
                </div>
              </div>
            </div>

            <p className="info_master__info">Санкт-Петербург, Каховского 7</p>
            <p className="info_master__info">Открыт: с 9 до 21</p>
            <p className="info_master__text-about">
              <span className="info_master__text-about-light">
                Имя организации
              </span>
              DeviseWorks
            </p>
            <p className="info_master__text-about">
              <span className="info_master__text-about-light">Опыт</span>2 года
            </p>
            <p className="info_master__text-about">
              <span className="info_master__text-about-light">На сайте</span>с
              2022 года
            </p>
            <p className="info_master__text-about">
              <span className="info_master__text-about-light">Статус</span>
              онлайн
            </p>
            <p className="info_master__text-about--accent">
              <span className="info_master__text-about-light">Оценка</span>5.0
            </p>
            <p className="info_master__text-about--accent">
              <span className="info_master__text-about-light">
                заказов выполнено
              </span>
              40
            </p>
            <p className="info_master__text-about--accent">
              <span className="info_master__text-about-light">
                Заказов успешно сдано
              </span>
              100%
            </p>
            <p className="info_master__text-about--accent">
              <span className="info_master__text-about-light">
                2 повторных заказов
              </span>
              54%
            </p>
          </div>

          <div className="info_master_big" >
            <div>
              <div className="info_master__close">
                <img src="/img/close.svg" alt="" />
              </div>

              <p className="info_master_big__text-about">
                <span className="info_master_big__text-about-light">
                  Вид категории
                </span>
                Электроника
              </p>
              <p className="info_master_big__text-about">
                <span className="info_master_big__text-about-light">
                  Категория
                </span>
                Ремотн телефонов, ремонт планшетов
              </p>
              <p className="info_master_big__text-about">
                <span className="info_master_big__text-about-light">
                  Бренды
                </span>
                iPhone, iPad, samsung
              </p>
              <p className="info_master_big__text-about">
                <span className="info_master_big__text-about-light">
                  Ваша деятельность
                </span>
                Занимаюсь ремонтом техники Apple{' '}
              </p>

              <p className="info_master_big__text-about">
                <span className="info_master_big__text-about-light">
                  Основное направление
                </span>
                Пайка, переклейка
              </p>
              <p className="info_master_big__text-about">
                <span className="info_master_big__text-about-light">
                  Основной бизнес
                </span>
                сервис
              </p>
              <p className="info_master_big__text-about">
                <span className="info_master_big__text-about-light">
                  Об организации:{' '}
                </span>
              </p>
              <p className="info_master_big__text">
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Culpa
                explicabo saepe eius natus non vel repudiandae perferendis quo
                quam sed, vitae sequi recusandae! Pariatur alias ad labore nemo
                odio itaque.
              </p>

              <div>
                <Swiper
                  slidesPerView={4}
                  spaceBetween={30}
                  navigation={true}
                  modules={[Navigation]}
                  className={style.swiper}
                  breakpoints={{
                    0: {
                      slidesPerView: 2,
                    },
                    800: {
                      slidesPerView: 2,
                    },
                    1124: {
                      slidesPerView: 3,
                    },
                  }}
                >
                  {test_price.map((obj, index) => (
                    <SwiperSlide key={index} className={style.swiper__slide}>
                      <div className={style.slide__empty}>
                        <img
                          onClick={() => openModal(obj.img)}
                          style={{ width: 100 }}
                          src={obj.img}
                          alt=""
                        />
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>
            </div>

            <div></div>
          </div>
        </div>
      </div>
      {/* Модальное окно с слайдером */}
      {isModalOpen && (
        <div className="modal" onClick={closeModal}>
          <div className="modalContent" onClick={(e) => e.stopPropagation()}>
            <button className="closeBtn" onClick={closeModal}>
              &times;
            </button>

            {/* Слайдер внутри модального окна */}
            <Swiper
              navigation={true}
              modules={[Navigation]}
              className="modalSwiper"
            >
              {test_price.map((image, index) => (
                <SwiperSlide key={index}>
                  <div className="modal-content-info">
                    <img src={image.img} alt={`Slide ${index + 1}`} />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      )}

      {/* Добавим стили для модального окна */}
      <style jsx>{`
        .modal {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.8);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 9999;
        }

        @media screen and (max-width: 1000px) {
          .modalContent {
            height: 50% !important;
          }
          .modal img {
            width: 100% !important;
            height: auto !important;
          }
        }

        .modal-content-info {
          display: flex;
          justify-content: center;
          align-items: center;
          width: 100%;
          height: 100%;
        }

        .modalContent {
          position: relative;
          padding: 20px;
          background: white;
          width: 60%;
          height: 80%;
          overflow: hidden;
        }

        .modal img {
          width: auto;
          height: 80%;
        }

        .closeBtn {
          top: 0px;
          position: absolute;
          right: 10px;
          font-size: 30px;
          background: none;
          border: none;
          color: #333;
          cursor: pointer;
        }

        .closeBtn:hover {
          color: red;
        }

        .modalSwiper {
          width: 100%;
          height: 100%;
        }
      `}</style>
    </ServiceDetailContext.Provider>
  );
}

export default ServiceDetail;
