import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';

import '../../scss/detail.scss';
import '../../scss/media.css';
//~ import { getContractorRepairs } from '../../services/service.service';
import { Navigation } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';

import style from './ServiceDetail.module.scss';
import { createRequest } from '../../services/request.service';
import appFetch from '../../utilities/appFetch';
import { useLanguage } from '../../state/language';
import { useUser } from '../../state/user';
import { useServices } from '../../state/site-data';
import { useContractors } from '../../state/order';

import PaymentBlock from './PaymentBlock';
import ConfirmationBlock from './ConfirmationBlock';
import ContractorInfoModals from './ContractorInfoModals';
import ServiceMainContent from './ServiceMainContent';

function ServiceDetail() {
  const text = useLanguage();
  const [selectedServices, setSelectedServices] = useState([]);

  const [visibleConfirm, setVisibleConfirm] = useState(false);
  const [ignoreSelectedServices, setIgnoreSelectedServices] = useState([]);
  const { id } = useParams();

  const { categories, subcategories, services } = useServices();
  const { user } = useUser();

  const serviceId = isFinite(id) ? Number(id) : 0;
  const subcategoryId = services[serviceId]?.parent || 0;
  const categoryId = subcategories[subcategoryId]?.parent || 0;

  const currentServiceDetails = {
    id: serviceId,
    name: services[serviceId]?.name || text('Unknown service'),
    subcategoryName: subcategories[subcategoryId]?.name || text('Unknown subcategory'),
    categoryName: categories[categoryId]?.name || text('Unknown category'),
  };

  const [formError, setFormError] = useState('');
  const [visibleBlockPayment, setVisibleBlockPayment] = useState(0);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');

  const [selectedContractor, setSelectedContractor] = useState({});
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [showSmallModal, setShowSmallModal] = useState(false);
  const [showBigModal, setShowBigModal] = useState(false);

  const [contractorCarData, setContractorCarData] = useState(null);

  // todo: получить город из формы
  const { users: contractors } = useContractors({ service: serviceId, city: 105 });

  //~ // todo: вынести загрузку пользователя в глобальное состояние
  //~ useEffect(() => {
    //~ appFetch('user', { body: { lc: 99999999999 } }, true)
      //~ .then((response) => {
        //~ if (response && response.data && response.data.user) {
          //~ const allUsers = Object.values(response.data.user);

          //~ const filteredContractors = allUsers
            //~ .filter((user) => user.u_details && user.u_details.business_model)
            //~ .map((user) => {
              //~ const details = user.u_details || {};
              //~ return {
                //~ id: user.u_id,
                //~ username: user.u_name,
                //~ name: `${user.u_name || ''} ${user.u_family || ''}`.trim(),
                //~ latitude: 59.9343 + (Math.random() - 0.5) * 0.1,
                //~ longitude: 30.3351 + (Math.random() - 0.5) * 0.2,
                //~ info: text(details.business_model || 'Independent technician'),
                //~ rating: details.rating || 5,
                //~ reviews: details.reviews || 0,
                //~ address: details.address || text('Address not specified'),
                //~ orgName: details.organization_name || text('Private practice'),
                //~ experience: `${details.experience || 1} ${text('Years unit')}`,
                //~ onSiteSince: user.u_created
                  //~ ? new Date(user.u_created * 1000).getFullYear()
                  //~ : '2023',
                //~ status: user.u_active ? 'Online' : 'Offline',
                //~ ordersCompleted: details.ordersCompleted || 0,
                //~ successRate: `${details.successRate || 100}%`,
                //~ repeatOrders: `${details.repeatOrders || 0}%`,
                //~ categoryView:
                  //~ details.section?.map((item) => item.label).join(', ') ||
                  //~ text('Electronics'),
                //~ categories:
                  //~ details.subsection?.map((item) => item.label).join(', ') ||
                  //~ text('Phone repair'),
                //~ brands:
                  //~ details.services?.map((item) => item.label).join(', ') ||
                  //~ text('All brands'),
                //~ activity: details.specialty || text('Equipment repair'),
                //~ mainFocus: details.main_business || text('General repair'),
                //~ businessType: details.business_model || text('Service center'),
                //~ aboutOrg:
                  //~ details.about_organization ||
                  //~ text('Organization information is not available.'),
              //~ };
            //~ });

          //~ setContractorsList(filteredContractors);
        //~ }
      //~ })
      //~ .catch((error) => {
        //~ console.error('Ошибка при загрузке пользователей:', error);
      //~ });
  //~ }, [text]);

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

  // `search` и `setSearch` теперь внутренние состояния ServiceMainContent

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
      title: selectedServices.map(itemId => prices[itemId]?.name).join(' '),
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

      setShowOrderForm(false);
      setVisibleBlockPayment(true);
    } catch (err) {
      console.error('Произошла ошибка в процессе создания/назначения заказа:', err);
      setFormError(err.message || 'An unknown error occurred.');
    }
  };

  useEffect(() => {
    document.title = currentServiceDetails.name;
  }, [currentServiceDetails.name]);

  function getSumPrice() {
    let sum = 0;
    selectedServices.forEach(id => {
      if (!ignoreSelectedServices.includes(id)) {
        sum += prices[id]?.price || 0;
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
  // Dynamically generate prices based on selected category/subcategory/service
  const prices = useMemo(() => {
    const servicePrice = 100; // Default price, can be dynamic if available from API

    const servicesForSubcategory = {};
    const subcategory = subcategories[subcategoryId];

    if (subcategory) {
      subcategory.services.forEach(srvId => {
        const serviceName = services[srvId]?.name;
        if (serviceName) {
          servicesForSubcategory[srvId] = {
            price: servicePrice,
            category: subcategory.name,
            delivery: 'From 30 minutes',
            name: serviceName,
            img: 'https://cdn-icons-png.flaticon.com/512/10473/10473245.png', // Placeholder image
          };
        }
      });
    }
    return servicesForSubcategory;
  }, [subcategoryId, subcategories, services]);

  return <>
    {/* блок с оплатой */}
    <PaymentBlock
      visibleBlockPayment={visibleBlockPayment}
      setVisibleBlockPayment={setVisibleBlockPayment}
      selectedIdx={selectedIdx}
      setSelectedIdx={setSelectedIdx}
      setVisibleConfirm={setVisibleConfirm}
    />

    {/* Вы подтвердили производителя работ */}
    <ConfirmationBlock
      visibleConfirm={visibleConfirm}
      setVisibleConfirm={setVisibleConfirm}
    />

    <ServiceMainContent
      text={text}
      currentServiceDetails={currentServiceDetails}
      prices={prices}
      selectedServices={selectedServices}
      addRemoveService={addRemoveService}
      selectedContractor={selectedContractor}
      onSelectContractor={onSelectContractor}
      showOrderForm={showOrderForm}
      setShowOrderForm={setShowOrderForm}
      contractors={contractors}
      formError={formError}
      setFormError={setFormError}
      user={user}
      name={name}
      setName={setName}
      phone={phone}
      setPhone={setPhone}
      getSumPrice={getSumPrice}
      ignoreSelectedServices={ignoreSelectedServices}
      addRemoveIgnoreService={addRemoveIgnoreService}
      description={description}
      setDescription={setDescription}
      onSubmit={onSubmit}
    />

    {/* Условный рендеринг модальных окон */}
    <ContractorInfoModals
      selectedContractor={selectedContractor}
      showSmallModal={showSmallModal}
      showBigModal={showBigModal}
      handleCloseModals={handleCloseModals}
      handleShowBigModal={handleShowBigModal}
    />

    {/* Модальное окно с слайдером (удалено, так как test_price не используется для изображений) */}
    {isModalOpen && (
      <div className={style.modal} onClick={closeModal}>
        <div className={style.modalContent} onClick={(e) => e.stopPropagation()}>
          <button className={style.closeBtn} onClick={closeModal}>
            ×
          </button>

          {/* Слайдер внутри модального окна */}
          <Swiper
            navigation={true}
            modules={[Navigation]}
            className={style.modalSwiper}
          >
            {/* Если нужны картинки, их нужно будет брать из другого источника */}
            <SwiperSlide>
                <div className={style['modal-content-info']}>
                  {/* Placeholder for image if needed */}
                  <p>{text('No image available')}</p>
                </div>
              </SwiperSlide>
          </Swiper>
        </div>
      </div>
    )}
  </>
}

export default ServiceDetail;
