import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';

import '../../scss/detail.scss';
import '../../scss/media.css';
//~ import { getContractorRepairs } from '../../services/service.service';
import { Link } from 'react-router-dom';
import { Rating } from 'react-simple-star-rating';
import { Navigation } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';

import style from './serviceDetail.module.scss';
import { createRequest } from '../../services/request.service';
import appFetch from '../../utilities/appFetch';
import YMap from '../Map';
import { useLanguage } from '../../state/language';
import { useUser } from '../../state/user';
import { useServices } from '../../state/site-data';

function ServiceDetail() {
  const text = useLanguage();
  const [selectedServices, setSelectedServices] = useState([]);

  const [visibleListSelectedServices, setVisibleListSelectedServices] =
    useState(false);
  const [visibleConfirm, setVisibleConfirm] = useState(false);
  const [ignoreSelectedServices, setIgnoreSelectedServices] = useState([]);
  const { id } = useParams();

  const { sections, subsections, services } = useServices();
  const { user } = useUser();

  const serviceId = isFinite(id) ? Number(id) : 0;
  const subsectionId = services[serviceId]?.parent || 0;
  const sectionId = subsections[subsectionId]?.parent || 0;

  const currentServiceDetails = {
    id: serviceId,
    name: services[serviceId]?.name || text('Unknown service'),
    subsectionName: subsections[subsectionId]?.name || text('Unknown subcategory'),
    sectionName: sections[sectionId]?.name || text('Unknown category'),
  };

  const [show, setShow] = useState(false);

  const [formError, setFormError] = useState('');
  const [visibleBlockPayment, setVisibleBlockPayment] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [errorBalance] = useState(true);
  const [errorCash] = useState(true);
  const [errorSumm] = useState(true);

  const [selectedContractor, setSelectedContractor] = useState({});
  const [showSmallModal, setShowSmallModal] = useState(false);
  const [showBigModal, setShowBigModal] = useState(false);

  const [contractorsList, setContractorsList] = useState([]);
  const [contractorCarData, setContractorCarData] = useState(null);

  // todo: вынести загрузку пользователя в глобальное состояние
  useEffect(() => {
    appFetch('user', { body: { lc: 99999999999 } }, true)
      .then((response) => {
        if (response && response.data && response.data.user) {
          const allUsers = Object.values(response.data.user);

          const filteredContractors = allUsers
            .filter((user) => user.u_details && user.u_details.business_model)
            .map((user) => {
              const details = user.u_details || {};
              return {
                id: user.u_id,
                username: user.u_name,
                name: `${user.u_name || ''} ${user.u_family || ''}`.trim(),
                latitude: 59.9343 + (Math.random() - 0.5) * 0.1,
                longitude: 30.3351 + (Math.random() - 0.5) * 0.2,
                info: text(details.business_model || 'Independent technician'),
                rating: details.rating || 5,
                reviews: details.reviews || 0,
                address: details.address || text('Address not specified'),
                orgName: details.organization_name || text('Private practice'),
                experience: `${details.experience || 1} ${text('Years unit')}`,
                onSiteSince: user.u_created
                  ? new Date(user.u_created * 1000).getFullYear()
                  : '2023',
                status: user.u_active ? 'Online' : 'Offline',
                ordersCompleted: details.ordersCompleted || 0,
                successRate: `${details.successRate || 100}%`,
                repeatOrders: `${details.repeatOrders || 0}%`,
                categoryView:
                  details.section?.map((item) => item.label).join(', ') ||
                  text('Electronics'),
                categories:
                  details.subsection?.map((item) => item.label).join(', ') ||
                  text('Phone repair'),
                brands:
                  details.services?.map((item) => item.label).join(', ') ||
                  text('All brands'),
                activity: details.specialty || text('Equipment repair'),
                mainFocus: details.main_business || text('General repair'),
                businessType: details.business_model || text('Service center'),
                aboutOrg:
                  details.about_organization ||
                  text('Organization information is not available.'),
              };
            });

          setContractorsList(filteredContractors);
        }
      })
      .catch((error) => {
        console.error('Ошибка при загрузке пользователей:', error);
      });
  }, [text]);

  useEffect(() => {
    setPhone(user.phone);
    setName(user.name);
  }, [user.phone, user.name]);

  const onSelectContractor = async (contractorData) => {
    setSelectedContractor(contractorData);
    setShowSmallModal(true);
    setShowBigModal(false);
    setContractorCarData(null);

    try {
      console.log(`Загрузка данных о машине для мастера ID: ${contractorData.id}`);
      const carResponse = await appFetch(
        'user/authorized/car',
        {
          method: 'POST',
          body: { u_a_id: contractorData.id },
        }
      );
      console.log(carResponse);

      if (carResponse && carResponse.data && carResponse.data.car) {
        const cars = Object.values(carResponse.data.car);
        if (cars.length > 0) {
          setContractorCarData(cars[0]);
          console.log('Данные о машине успешно загружены:', cars[0]);
        } else {
          console.warn(
            `У мастера ID: ${contractorData.id} нет зарегистрированных машин.`,
          );
        }
      }
    } catch (error) {
      console.error(
        `Ошибка при загрузке данных о машине для мастера ID: ${contractorData.id}`,
        error,
      );
      setFormError('Failed to load contractor car data.');
    }
  };

  const handleCloseModals = () => {
    setShowSmallModal(false);
    setShowBigModal(false);
    setSelectedContractor({});
    setContractorCarData(null);
  };

  const handleShowBigModal = () => {
    setShowSmallModal(false);
    setShowBigModal(true);
  };

  //~ const [invoice, setInvoice] = useState({
    //~ final: 0,
    //~ list: [],
  //~ });
  const [description, setDescription] = useState('');

  const contractors = useMemo(() => contractorsList, [contractorsList]);

  //~ // непонятный код, основанный на побочных эффектах. привести в понятный вид
  //~ const repairFiltered = useMemo(
    //~ () => repairContractors,
    //~ [selectedContractor.username],
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
   * @param {object} contractor - Объект выбранного мастера.
   */
  const assignContractorToOrder = async (orderId, contractor) => {
    if (!orderId || !contractor.id) {
      console.error('ID заказа или ID мастера отсутствуют. Назначение невозможно.');
      throw new Error('Order or contractor ID is undefined.');
    }
    if (!contractorCarData) {
      console.error('Данные о машине мастера не загружены. Назначение невозможно.');
    }
    const assignmentPayload = {
      c_id: contractorCarData?.c_id || '1',
      c_payment_way: 2,
      c_options: {
        author: {
          ...contractor,
        },
        bind_amount: getSumPrice(),
        comment: text('I will handle it'),
        time: 30,
      },
    };
    const requestBody = {
      action: 'set_performer',
      performer: 0,
      u_a_role: 2,
      u_a_id: contractor.id,
      data: JSON.stringify(assignmentPayload),
    };

    try {
      const url = `drive/get/${orderId}`;
      console.log(
        `Попытка назначения мастера ${contractor.id} КАНДИДАТОМ на заказ ${orderId}. URL: ${url}`,
      );
      console.log('Тело запроса:', requestBody);

      // Отправляем запрос с новым телом
      await appFetch(
        url,
        {
          body: requestBody,
        }
      ).then((v) => console.log('trueble', v));

      console.log(
        `Мастер ${contractor.name} (ID: ${contractor.id}) успешно добавлен в поездку (ID: ${orderId}) как кандидат.`,
      );
    } catch (error) {
      console.error(`Ошибка при назначении мастера на заказ ${orderId}:`, error);
      throw error;
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (selectedServices.length === 0) {
      setFormError('Select services');
      return;
    }
    if (!selectedContractor.id) {
      setFormError('Select a contractor on the map first');
      return;
    }

    const orderData = {
      title: selectedServices.map(itemId => prices[itemId].name).join(' '),
      description,
      client_price: getSumPrice(),
      service: serviceId,
      orderType: 'request',
      winnerContractor: selectedContractor.id,
      type: 'order',
    };

    try {
      console.log('Создание заказа...');
      const creationResponse = await createRequest({ data: orderData });
      const newOrderId = creationResponse?.data?.b_id;

      if (!newOrderId) {
        throw new Error('Failed to retrieve the created order ID.');
      }
      console.log(`Заказ успешно создан. ID: ${newOrderId}`);

      await assignContractorToOrder(newOrderId, selectedContractor);

      setShow(false);
      setVisibleBlockPayment(true);
    } catch (err) {
      console.error('Произошла ошибка в процессе создания/назначения заказа:', err);
      setFormError(err.message || 'An unknown error occurred.');
    }
  };

  useEffect(() => {
    document.title = currentServiceDetails.name;
  }, [currentServiceDetails.name]);

  const [goToR] = useState(false);

  function getSumPrice() {
    let sum = 0;
    selectedServices.forEach(id => {
      if (!ignoreSelectedServices.includes(id)) {
        sum += prices[id].price || 0;
      }
    });
    return sum;
  }

  function addRemoveIgnoreService(id) {
    let list = [...ignoreSelectedServices];
    if (list.includes(id)) {
      list = list.filter((number) => number !== id);
    } else {
      list.push(id);
    }
    setIgnoreSelectedServices(list);
  }

  const [isModalOpen, setIsModalOpen] = useState(false);

  // todo: Временно удалено, нужно восстановить функционал
  //~ const openModal = () => {
    //~ setIsModalOpen(true);
  //~ };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  function addRemoveService(id) {
    let list = [...selectedServices];
    if (list.includes(id)) {
      list = list.filter((number) => number !== id);
    } else {
      list.push(id);
    }
    setSelectedServices(list);
  }

  // todo: доработать логику выбора цены
  // Dynamically generate prices based on selected section/subsection/service
  const prices = useMemo(() => {
    const servicePrice = 100; // Default price, can be dynamic if available from API

    const servicesForSubsection = {};
    const subsection = subsections[subsectionId];

    if (subsection) {
      subsection.services.forEach(srvId => {
        const serviceName = services[srvId].name;
        if (serviceName) {
          servicesForSubsection[srvId] = {
            price: servicePrice,
            category: subsection.name,
            delivery: 'From 30 minutes',
            name: serviceName,
            img: 'https://cdn-icons-png.flaticon.com/512/10473/10473245.png', // Placeholder image
          };
        }
      });
    }
    return servicesForSubsection;
  }, [subsectionId, subsections, services]);

  return <>
    {/* блок с оплатой */}
    {visibleBlockPayment ? (
      <div className={style.blockPayment_wrap}>
        {errorBalance ? (
          <div className={style.error}>
            {text('Please top up your balance by 500 rubles')}
          </div>
        ) : null}

        {errorCash ? (
          <div className={style.error}>{text('Pay the contractor in person')}</div>
        ) : null}

        {errorSumm ? (
          <div className={style.error}>
            {text('500 rubles will be deducted from your balance')}{' '}
          </div>
        ) : null}

        <div className={style.blockPayment}>
          <div
            className={style.close}
            onClick={() => setVisibleBlockPayment(false)}
          >
            <img src="/img/close.svg" alt="" />
          </div>

          <h2>{text('Payment')}</h2>
          <div className={style.row}>
            <div className={style.block_v2}>
              <p>{text('Pay through the website')}</p>
              <div className={style.radio}>
                <input
                  type="radio"
                  id="inputSite"
                  name="radioPayments"
                  checked={selectedIdx === 0}
                  onChange={() => setSelectedIdx(0)}
                />
                <label htmlFor="inputSite">{text('Balance: 0₽')}</label>
              </div>
              <p>{text('Standard risk-free deal price')}</p>
              <p className={style.mini_text}>
                {text(
                  'A 9% fee applies when topping up your wallet. The price in the performer response already includes the commission.',
                )}
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
                <label htmlFor="inputCash">{text('Cash payment')}</label>
              </div>
              <p className={style.mini_text}>
                {text('Pay the performer directly')} <br />
                {text('No guarantees or compensation from RepairWizarts: you negotiate conditions and payment method directly with the performer.')}
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
            {text('Continue')}
          </div>
        </div>
      </div>
    ) : null}
    {/* Вы подтвердили производителя работ */}
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

          <h2>{text('You have confirmed the contractor')}</h2>
          <div className={style.row}>
            <p>
              {text('By confirming the performer you open a chat dialog with them')}
            </p>
          </div>

          <Link
            to="/client/requests/my_orders/#order"
            className={style.button_confirm}
          >
            {text('Continue')}
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
            {text('Repair service cost for') /* todo: Исправить текст */}{' '}
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
              // src={SERVER_PATH + device.picture}
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
                <>
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
                </>
              ))}
          </div>

          {/* Условный рендеринг кнопки "Оформить заказ" */}
          {selectedContractor.id && (
            <div className={style.button_wrap}>
              <button
                className={style.button_services}
                onClick={() => {
                  setShow(true);
                }}
              >
                {text('Place an order')}
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
                  {text('Place an order')}
                </h1>
                <p style={{ marginBottom: '10px' }}>{text('Official prices')}</p>

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
                    <input
                      type="text"
                      placeholder={text('Your name')}
                      defaultValue={user.name}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      // disabled
                    />
                    <input
                      className="ismrf"
                      type="text"
                      placeholder={text('Phone number')}
                      defaultValue={user.phone}
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
                        {selectedServices.map(id => (
                          <div
                            key={id}
                            className="selected_service__service-row"
                          >
                            <p className="selected_service__name">
                              {prices[id]['name']}
                            </p>
                            <div style={{ flex: 1 }}></div>
                            <p className="selected_service__price">
                              {prices[id]['price']} ₽
                            </p>
                            <p className="selected_service__delivery">
                              {prices[id]['delivery']}
                            </p>
                            <div className="selected_service__checkbox">
                              <input
                                checked={
                                  !ignoreSelectedServices.includes(id)
                                }
                                type="checkbox"
                                name=""
                                id=""
                                onChange={() => addRemoveIgnoreService(id)}
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

                  <textarea
                    className="descdetail"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={text('Problem description')}
                    cols="30"
                    rows="10"
                  />
                  <button className={`done ${style.fix_btn}`} type="submit">
                    {text('Submit')}
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

    {/* Условный рендеринг модальных окон */}
    {selectedContractor.id && (
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
            <div className="info_contractor">
              <div
                className="info_contractor__close"
                onClick={handleCloseModals}
                style={{ cursor: 'pointer' }}
              >
                <img src="/img/close.svg" alt="" />
              </div>

              <div className="info_contractor__row1">
                <img src="/img/profile__image.png" alt="" />
                <div className="info_contractor__about">
                  <p>{selectedContractor.name}</p>
                  <p>{selectedContractor.info}</p>
                  <div className="info_contractor__stars">
                    <Rating
                      size={18}
                      readonly
                      initialValue={selectedContractor.rating}
                      allowFraction
                      fillColor="#FFC107"
                      emptyColor="#E4E5E9"
                    />
                  </div>
                  <div className="info_contractor__row-links">
                    <Link to={`/client/feedback/${selectedContractor.id}`}>
                      {selectedContractor.reviews} {text('reviews received')}
                    </Link>
                    <button
                      type="button"
                      className="info_contractor__row-link"
                      onClick={handleShowBigModal}
                    >
                      {text('Learn more')}
                    </button>
                  </div>
                </div>
              </div>

              <p className="info_contractor__info">{selectedContractor.address}</p>
              <p className="info_contractor__info">{text('Open: from 9 to 21')}</p>
              <p className="info_contractor__text-about">
                <span className="info_contractor__text-about-light">
                  {text('Organization name')}
                </span>
                {selectedContractor.orgName}
              </p>
              <p className="info_contractor__text-about">
                <span className="info_contractor__text-about-light">
                  {text('Experience')}
                </span>
                {selectedContractor.experience}
              </p>
              <p className="info_contractor__text-about">
                <span className="info_contractor__text-about-light">
                  {text('On the platform')}
                </span>
                {text('since')} {selectedContractor.onSiteSince}
              </p>
              <p className="info_contractor__text-about">
                <span className="info_contractor__text-about-light">
                  {text('Status')}
                </span>
                {text(selectedContractor.status)}
              </p>
              <p className="info_contractor__text-about--accent">
                <span className="info_contractor__text-about-light">
                  {text('Rating')}
                </span>
                {selectedContractor.rating}
              </p>
              <p className="info_contractor__text-about--accent">
                <span className="info_contractor__text-about-light">
                  {text('Orders completed')}
                </span>
                {selectedContractor.ordersCompleted}
              </p>
              <p className="info_contractor__text-about--accent">
                <span className="info_contractor__text-about-light">
                  {text('Orders delivered successfully')}
                </span>
                {selectedContractor.successRate}
              </p>
              <p className="info_contractor__text-about--accent">
                <span className="info_contractor__text-about-light">
                  {text('Repeat orders')}
                </span>
                {selectedContractor.repeatOrders}
              </p>
            </div>
          )}
          {showBigModal && (
            <div className="info_contractor_big">
              <div>
                <div
                  className="info_contractor__close"
                  onClick={handleCloseModals}
                  style={{ cursor: 'pointer' }}
                >
                  <img src="/img/close.svg" alt="" />
                </div>

                <p className="info_contractor_big__text-about">
                  <span className="info_contractor_big__text-about-light">
                    {text('Category type')}
                  </span>
                  {selectedContractor.categoryView}
                </p>
                <p className="info_contractor_big__text-about">
                  <span className="info_contractor_big__text-about-light">
                    {text('Category')}
                  </span>
                  {selectedContractor.categories}
                </p>
                <p className="info_contractor_big__text-about">
                  <span className="info_contractor_big__text-about-light">
                    {text('Brands')}
                  </span>
                  {selectedContractor.brands}
                </p>
                <p className="info_contractor_big__text-about">
                  <span className="info_contractor_big__text-about-light">
                    {text('Your activity')}
                  </span>
                  {selectedContractor.activity}
                </p>

                <p className="info_contractor_big__text-about">
                  <span className="info_contractor_big__text-about-light">
                    {text('Main focus')}
                  </span>
                  {selectedContractor.mainFocus}
                </p>
                <p className="info_contractor_big__text-about">
                  <span className="info_contractor_big__text-about-light">
                    {text('Main business')}
                  </span>
                  {text(selectedContractor.businessType)}
                </p>
                <p className="info_contractor_big__text-about">
                  <span className="info_contractor_big__text-about-light">
                    {text('About the organization:')}{' '}
                  </span>
                </p>
                <p className="info_contractor_big__text">
                  {selectedContractor.aboutOrg}
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
                    {/* Слайдер картинок тестовых цен удален todo: Сделать новый блок цен */}
                  </Swiper>
                </div>
              </div>

              <div></div>
            </div>
          )}
        </div>
      </div>
    )}

    {/* Модальное окно с слайдером (удалено, так как test_price не используется для изображений) */}
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
            {/* Если нужны картинки, их нужно будет брать из другого источника */}
            <SwiperSlide>
                <div className="modal-content-info">
                  {/* Placeholder for image if needed */}
                  <p>{text('No image available')}</p>
                </div>
              </SwiperSlide>
          </Swiper>
        </div>
      </div>
    )}

    {/* Добавим стили для модального окна */}
    {/* todo: вынести стили в css/scss */}
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
  </>
}

export default ServiceDetail;
