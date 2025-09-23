import { useEffect, useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { selectUI } from '../../slices/ui.slice';
import { Navigation } from 'swiper';
import { useParams } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { selectUser } from '../../slices/user.slice';
import { selectServices } from '../../slices/services.slice';
import YMap from '../Map';
import ServiceDetailContext from './ServiceDetailContext';
import '../../scss/detail.scss';
import '../../scss/media.css';
//~ import { getMasterRepairs } from '../../services/service.service';
import { Link } from 'react-router-dom';
import { Rating } from 'react-simple-star-rating';

import style from './serviceDetail.module.scss';
import appFetch from '../../utilities/appFetch';
import { createRequest } from '../../services/request.service';

const EMPTY_ARRAY = []

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
  const [selectedService, setSelectedService] = useState([]);

  const [visibleListSelectedServices, setVisibleListSelectedServices] =
    useState(false);
  const [visibleConfirm, setVisibleConfirm] = useState(false);
  const [ignoreSelectedServices, setIgnoreSelectedServices] = useState([]);
  const { id } = useParams();
  const { categories } = useSelector((state) => state.categories);
  const user =
    Object.values(useSelector(selectUser)?.data?.user || {})[0] || {};
  const ui = useSelector(selectUI);
  const services = useSelector(selectServices);
  //~ const repairMasters = getMasterRepairs();
  const { sectionId, subsectionId } = useParams();
  const device =
    useMemo(
      () => services?.find((v) => v.id === +id) || {},
      [services, id],
    ) || EMPTY_ARRAY;

  const [show, setShow] = useState(false);

  const [formError, setFormError] = useState('');
  const [visibleBlockPayment, setVisibleBlockPayment] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [errorBalance] = useState(true);
  const [errorCash] = useState(true);
  const [errorSumm] = useState(true);

  const [selected, setSelected] = useState([]);
  const selectedValue = useMemo(() => ({ selected, setSelected }), [selected]);

  const [selectedMaster, setSelectedMaster] = useState({});
  const [showSmallModal, setShowSmallModal] = useState(false);
  const [showBigModal, setShowBigModal] = useState(false);

  const [mastersList, setMastersList] = useState([]);
  const [masterCarData, setMasterCarData] = useState(null);

  // todo: вынести загрузку пользователя в глобальное состояние
  useEffect(() => {
    appFetch('user', { body: { lc: 99999999999 } }, true)
      .then((response) => {
        if (response && response.data && response.data.user) {
          const allUsers = Object.values(response.data.user);

          const filteredMasters = allUsers
            .filter((user) => user.u_details && user.u_details.business_model)
            .map((user) => {
              const details = user.u_details || {};
              return {
                id: user.u_id,
                username: user.u_name,
                name: `${user.u_name || ''} ${user.u_family || ''}`.trim(),
                latitude: 59.9343 + (Math.random() - 0.5) * 0.1,
                longitude: 30.3351 + (Math.random() - 0.5) * 0.2,
                info: details.business_model || 'Частный мастер',
                rating: details.rating || 5,
                reviews: details.reviews || 0,
                address: details.address || 'Адрес не указан',
                orgName: details.organization_name || 'Частная практика',
                experience: `${details.experience || 1} год/лет`,
                onSiteSince: user.u_created
                  ? new Date(user.u_created * 1000).getFullYear()
                  : '2023',
                status: user.u_active ? 'онлайн' : 'офлайн',
                ordersCompleted: details.ordersCompleted || 0,
                successRate: `${details.successRate || 100}%`,
                repeatOrders: `${details.repeatOrders || 0}%`,
                categoryView:
                  details.section?.map((item) => item.label).join(', ') ||
                  'Электроника',
                categories:
                  details.subsection?.map((item) => item.label).join(', ') ||
                  'Ремонт телефонов',
                brands:
                  details.services?.map((item) => item.label).join(', ') ||
                  'Все бренды',
                activity: details.specialty || 'Ремонт техники',
                mainFocus: details.main_business || 'Общий ремонт',
                businessType: details.business_model || 'Сервис',
                aboutOrg:
                  details.about_organization ||
                  'Информация об организации отсутствует.',
              };
            });

          setMastersList(filteredMasters);
        }
      })
      .catch((error) => {
        console.error('Ошибка при загрузке пользователей:', error);
      });
  }, []);

  useEffect(() => {
    setPhone(user.u_phone);
    setName(user.u_name);
  }, [user.u_phone, user.u_name]);

  const onSelectMaster = async (masterData) => {
    setSelectedMaster(masterData);
    setShowSmallModal(true);
    setShowBigModal(true);
    setMasterCarData(null);

    try {
      console.log(`Загрузка данных о машине для мастера ID: ${masterData.id}`);
      const carResponse = await appFetch(
        'user/authorized/car',
        {
          method: 'POST',
          body: { u_a_id: masterData.id },
        },
        true,
      );
      console.log(carResponse);

      if (carResponse && carResponse.data && carResponse.data.car) {
        const cars = Object.values(carResponse.data.car);
        if (cars.length > 0) {
          setMasterCarData(cars[0]);
          console.log('Данные о машине успешно загружены:', cars[0]);
        } else {
          console.warn(
            `У мастера ID: ${masterData.id} нет зарегистрированных машин.`,
          );
        }
      }
    } catch (error) {
      console.error(
        `Ошибка при загрузке данных о машине для мастера ID: ${masterData.id}`,
        error,
      );
      setFormError('Не удалось загрузить данные о машине мастера.');
    }
  };

  const handleCloseModals = () => {
    setShowSmallModal(false);
    setShowBigModal(false);
    setSelectedMaster({});
    setMasterCarData(null);
  };

  //~ const [invoice, setInvoice] = useState({
    //~ final: 0,
    //~ list: [],
  //~ });
  const [description, setDescription] = useState('');

  const masters = useMemo(() => mastersList, [mastersList]);

  //~ // непонятный код, основанный на побочных эффектах. привести в понятный вид
  //~ const repairFiltered = useMemo(
    //~ () => repairMasters,
    //~ [selectedMaster.username],
  //~ );

  //~ useEffect(() => {
    //~ const invoiceDefault = {
      //~ final: 0,
      //~ list: [],
    //~ };
    //~ const invoice = selected.reduce((state, value) => {
      //~ const { name, price } = repairFiltered.find((v) => v.id === value);
      //~ return {
        //~ final: state.final + price,
        //~ list: [
          //~ ...state.list,
          //~ {
            //~ name,
            //~ price,
          //~ },
        //~ ],
      //~ };
    //~ }, invoiceDefault);
    //~ setInvoice(invoice);
  //~ }, [selected]);

  const [search, setSearch] = useState('');

  /**
   * Асинхронная функция для назначения мастера на заказ в качестве КАНДИДАТА.
   * @param {string} orderId - ID только что созданного заказа.
   * @param {object} master - Объект выбранного мастера.
   */
  const assignMasterToOrder = async (orderId, master) => {
    if (!orderId || !master.id) {
      console.error(
        'ID заказа или ID мастера отсутствуют. Назначение невозможно.',
      );
      throw new Error('ID заказа или мастера не определены.');
    }
    if (!masterCarData) {
      console.error(
        'Данные о машине мастера не загружены. Назначение невозможно.',
      );
    }
    const assignmentPayload = {
      c_id: masterCarData?.c_id || '1',
      c_payment_way: 2,
      c_options: {
        author: {
          ...master,
        },
        bind_amount: getSumPrice(),
        comment: 'Выполню',
        time: 30,
      },
    };
    const requestBody = {
      action: 'set_performer',
      performer: 0,
      u_a_role: 2,
      u_a_id: master.id,
      data: JSON.stringify(assignmentPayload),
    };

    try {
      const url = `drive/get/${orderId}`;
      console.log(
        `Попытка назначения мастера ${master.id} КАНДИДАТОМ на заказ ${orderId}. URL: ${url}`,
      );
      console.log('Тело запроса:', requestBody);

      // Отправляем запрос с новым телом
      await appFetch(
        url,
        {
          body: requestBody,
        },
        true,
      ).then((v) => console.log('trueble', v));

      console.log(
        `Мастер ${master.name} (ID: ${master.id}) успешно добавлен в поездку (ID: ${orderId}) как кандидат.`,
      );
    } catch (error) {
      console.error(
        `Ошибка при назначении мастера на заказ ${orderId}:`,
        error,
      );
      throw error;
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (selectedService.length === 0) {
      setFormError('Выберите услуги');
      return;
    }
    if (!selectedMaster.id) {
      setFormError('Сначала выберите мастера на карте');
      return;
    }

    const orderData = {
      title: selectedService.map((item) => prices[item].name).join(' '),
      description,
      client_price: getSumPrice(),
      section: sectionId,
      subsection: subsectionId,
      service: selectServices[0],
      orderType: 'request',
      winnerMaster: selectedMaster.id,
      type: 'order',
    };

    try {
      console.log('Создание заказа...');
      const creationResponse = await createRequest({ data: orderData });
      const newOrderId = creationResponse?.data?.b_id;

      if (!newOrderId) {
        throw new Error('Не удалось получить ID созданного заказа.');
      }
      console.log(`Заказ успешно создан. ID: ${newOrderId}`);

      await assignMasterToOrder(newOrderId, selectedMaster);

      setShow(false);
      setVisibleBlockPayment(true);
    } catch (err) {
      console.error(
        'Произошла ошибка в процессе создания/назначения заказа:',
        err,
      );
      setFormError(err.message || 'Произошла неизвестная ошибка.');
    }
  };

  useEffect(() => {
    document.title = device.name;
  }, [device.name]);

  const [goToR] = useState(false);

  function getSumPrice() {
    var sum = 0;
    selectedService.forEach((index) => {
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
  //~ const [modalImage, setModalImage] = useState('');

  const openModal = (imageSrc) => {
    //~ setModalImage(imageSrc);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
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
  // todo: проверить, совпадают ли типы categ.id, sectionId, subsec.id, subsectionId и можно ли использовать строгое сравнение
  const prices = categories.flatMap((categ) => {
    return categ.id == sectionId
      ? categ.subsections.flatMap((subsec) => {
          return subsec.id == subsectionId
            ? subsec.services.map((service) => ({
                price: 100,
                model: subsec.name,
                delivery: `от 30 мин`,
                name: service.name,
                img: 'https://cdn-icons-png.flaticon.com/512/10473/10473245.png',
              }))
            : [];
        })
      : [];
  });
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

            <Link
              to="/client/requests/my_orders/#order"
              className={style.button_confirm}
            >
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
            {prices.length === 0 && (
              <div className="order__no-cards">
                <img src="/img/many_people.png" alt="" />
                <p>
                  Пожалуйста, выберите на карте ниже организацию которая ближе к
                  вашему дому и оформите заказ выбрав те услуги которые вам
                  необходимы!
                </p>
              </div>
            )}

            {/* список услуг */}
            <div className={`order__cards__to__scrolls ${style.orders_list}`}>
              {prices.length > 0 &&
                prices.map((obj, index) => (
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

            {/* Условный рендеринг кнопки "Оформить заказ" */}
            {selectedMaster.id && (
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
            )}

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
                    Оформить заказ
                  </h1>
                  <p style={{ marginBottom: '10px' }}>Официальные цены</p>

                  {!ui.isAuthorized ? (
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
                        defaultValue={user.u_name}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        // disabled
                      />
                      <input
                        className="ismrf"
                        type="text"
                        placeholder="Номер телефона"
                        defaultValue={user.u_phone}
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        // disabled
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
                                {prices[index]['name']}
                              </p>
                              <div style={{ flex: 1 }}></div>
                              <p className="selected_service__price">
                                {prices[index]['price']} ₽
                              </p>
                              <p className="selected_service__delivery">
                                {prices[index]['delivery']}
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
                    <button className={`done ${style.fix_btn}`} type="submit">
                      Отправить
                    </button>
                  </form>
                </div>
              </div>
            </div>
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
              {prices.map((obj, index) => (
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

        <section className="map">
          <YMap
            masters={masters}
            selectedMaster={selectedMaster}
            selectMaster={onSelectMaster}
          />
        </section>
      </div>

      {/* Условный рендеринг модальных окон */}
      {selectedMaster.id && (
        <div style={{ display: 'flex', position: 'absolute' }}>
          <div
            style={{
              position: 'absolute',
              zIndex: 1,
              bottom: '0',
              left: '370px',
              display: 'flex',
              gap: '10px',
            }}
          >
            {showSmallModal && (
              <div className="info_master">
                <div
                  className="info_master__close"
                  onClick={handleCloseModals}
                  style={{ cursor: 'pointer' }}
                >
                  <img src="/img/close.svg" alt="" />
                </div>

                <div className="info_master__row1">
                  <img src="/img/profile__image.png" alt="" />
                  <div className="info_master__about">
                    <p>{selectedMaster.name}</p>
                    <p>{selectedMaster.info}</p>
                    <div className="info_master__stars">
                      <Rating
                        size={18}
                        readonly
                        initialValue={selectedMaster.rating}
                        allowFraction
                        fillColor="#FFC107"
                        emptyColor="#E4E5E9"
                      />
                    </div>
                    <div className="info_master__row-links">
                      <Link to={`/client/feedback/${selectedMaster.id}`}>
                        {selectedMaster.reviews} отзыва
                      </Link>
                      <a href="#">Подробнее</a>
                    </div>
                  </div>
                </div>

                <p className="info_master__info">{selectedMaster.address}</p>
                <p className="info_master__info">Открыт: с 9 до 21</p>
                <p className="info_master__text-about">
                  <span className="info_master__text-about-light">
                    Имя организации
                  </span>
                  {selectedMaster.orgName}
                </p>
                <p className="info_master__text-about">
                  <span className="info_master__text-about-light">Опыт</span>
                  {selectedMaster.experience}
                </p>
                <p className="info_master__text-about">
                  <span className="info_master__text-about-light">
                    На сайте
                  </span>
                  с {selectedMaster.onSiteSince}
                </p>
                <p className="info_master__text-about">
                  <span className="info_master__text-about-light">Статус</span>
                  {selectedMaster.status}
                </p>
                <p className="info_master__text-about--accent">
                  <span className="info_master__text-about-light">Оценка</span>
                  {selectedMaster.rating}
                </p>
                <p className="info_master__text-about--accent">
                  <span className="info_master__text-about-light">
                    заказов выполнено
                  </span>
                  {selectedMaster.ordersCompleted}
                </p>
                <p className="info_master__text-about--accent">
                  <span className="info_master__text-about-light">
                    Заказов успешно сдано
                  </span>
                  {selectedMaster.successRate}
                </p>
                <p className="info_master__text-about--accent">
                  <span className="info_master__text-about-light">
                    2 повторных заказов
                  </span>
                  {selectedMaster.repeatOrders}
                </p>
              </div>
            )}
            {showBigModal && (
              <div className="info_master_big">
                <div>
                  <div
                    className="info_master__close"
                    onClick={handleCloseModals}
                    style={{ cursor: 'pointer' }}
                  >
                    <img src="/img/close.svg" alt="" />
                  </div>

                  <p className="info_master_big__text-about">
                    <span className="info_master_big__text-about-light">
                      Вид категории
                    </span>
                    {selectedMaster.categoryView}
                  </p>
                  <p className="info_master_big__text-about">
                    <span className="info_master_big__text-about-light">
                      Категория
                    </span>
                    {selectedMaster.categories}
                  </p>
                  <p className="info_master_big__text-about">
                    <span className="info_master_big__text-about-light">
                      Бренды
                    </span>
                    {selectedMaster.brands}
                  </p>
                  <p className="info_master_big__text-about">
                    <span className="info_master_big__text-about-light">
                      Ваша деятельность
                    </span>
                    {selectedMaster.activity}
                  </p>

                  <p className="info_master_big__text-about">
                    <span className="info_master_big__text-about-light">
                      Основное направление
                    </span>
                    {selectedMaster.mainFocus}
                  </p>
                  <p className="info_master_big__text-about">
                    <span className="info_master_big__text-about-light">
                      Основной бизнес
                    </span>
                    {selectedMaster.businessType}
                  </p>
                  <p className="info_master_big__text-about">
                    <span className="info_master_big__text-about-light">
                      Об организации:{' '}
                    </span>
                  </p>
                  <p className="info_master_big__text">
                    {selectedMaster.aboutOrg}
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
                        <SwiperSlide
                          key={index}
                          className={style.swiper__slide}
                        >
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
            )}
          </div>
        </div>
      )}

      {/* Модальное окно с слайдером */}
      {isModalOpen && (
        <div className="modal" onClick={closeModal}>
          <div className="modalContent" onClick={(e) => e.stopPropagation()}>
            <button className="closeBtn" onClick={closeModal}>
              ×
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
