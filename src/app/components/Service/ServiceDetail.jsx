import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';

import '../../scss/detail.scss';
import '../../scss/media.css';
import { Navigation } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';

import style from './ServiceDetail.module.scss';
import { useLanguage } from '../../state/language';
import { useGlobalState } from '../../state/global';
import { useUser } from '../../state/user';
import { useProducts } from '../../state/site-data';
import { useContractors, useCreateOrder } from '../../state/order';

import PaymentBlock from './PaymentBlock';
import ConfirmationBlock from './ConfirmationBlock';
import ContractorInfoModals from './ContractorInfoModals';
import ServiceMainContent from './ServiceMainContent';

function ServiceDetail() {
  const text = useLanguage();
  const currentCity = useGlobalState('currentCity');
  const [selectedContractorServices, setSelectedContractorServices] = useState([]);

  const [visibleConfirm, setVisibleConfirm] = useState(false);
  const [ignoreContractorServices, setIgnoreContractorServices] = useState([]);
  const { id } = useParams();

  const { products } = useProducts();
  const { user } = useUser();

  const productId = isFinite(id) ? Number(id) : 0;

  const currentProductDetails = {
    id: productId,
    name: products[productId]?.name || text('Unknown service'),
  };

  const [formError, setFormError] = useState('');
  const [visibleBlockPayment, setVisibleBlockPayment] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState(0);

  const [selectedContractor, setSelectedContractor] = useState({});
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [showSmallModal, setShowSmallModal] = useState(false);
  const [showBigModal, setShowBigModal] = useState(false);

  const { contractors } = useContractors({ product: productId, city: currentCity });
  const { createOrder } = useCreateOrder();

  const onSelectContractor = async (contractorData) => {
    setSelectedContractor(contractorData);
    setShowSmallModal(true);
    setShowBigModal(false);

    setSelectedContractorServices([]);
    setIgnoreContractorServices([]);
  };

  const handleCloseModals = () => {
    setShowSmallModal(false);
    setShowBigModal(false);
    setSelectedContractor({});
    setSelectedContractorServices([]);
    setIgnoreContractorServices([]);
    setFormError('');
  };

  const handleShowBigModal = () => {
    setShowSmallModal(false);
    setShowBigModal(true);
  };

  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!selectedContractor.id) {
      setFormError(text('Please select a contractor.'));
      return;
    }

    // Фильтруем игнорируемые услуги и формируем список для отправки
    const servicesToOrder = selectedContractorServices
      .filter(serviceName => !ignoreContractorServices.includes(serviceName))
      .map(serviceName => ({
        service: serviceName,
        price: prices[serviceName]?.price || 0
      }));

    if (servicesToOrder.length === 0) {
      setFormError(text('Please select at least one service.'));
      return;
    }

    const orderData = {
      cityId: currentCity,
      address,
      productId,
      description,
      price: getSumPrice(),
      contractorId: selectedContractor.id,
      services: servicesToOrder,
    };
    // todo: Добавить загрузку изображений в форму
    //~ attachments?: File[];

    try {
      console.log('Создание заказа...');
      const newOrderId = await createOrder(orderData);

      if (!newOrderId) {
        throw new Error('Failed to retrieve the created order ID.');
      }
      console.log(`Заказ успешно создан. ID: ${newOrderId}`);

      setShowOrderForm(false);
      setVisibleBlockPayment(true);
    } catch (err) {
      console.error('Произошла ошибка в процессе создания заказа:', err);
      setFormError(err.message || 'An unknown error occurred.');
    }
  };

  useEffect(() => {
    document.title = currentProductDetails.name;
  }, [currentProductDetails.name]);

  function getSumPrice() {
    let sum = 0;
    selectedContractorServices.forEach(serviceName => {
      if (!ignoreContractorServices.includes(serviceName)) {
        sum += prices[serviceName]?.price || 0;
      }
    });
    return sum;
  }

  function addRemoveIgnoreService(serviceName) {
    const list =
      ignoreContractorServices.includes(serviceName) ?
        ignoreContractorServices.filter((name) => name !== serviceName)
      :
        [...ignoreContractorServices, serviceName];
    setIgnoreContractorServices(list);
  }

  const [isModalOpen, setIsModalOpen] = useState(false);

  // todo: Временно удалено, нужно восстановить функционал
  //~ const openModal = () => {
    //~ setIsModalOpen(true);
  //~ };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  function addRemoveService(serviceName) {
    if (ignoreContractorServices.includes(serviceName)) {
      setIgnoreContractorServices(ignoreContractorServices.filter((name) => name !== serviceName));
    }

    const list =
      selectedContractorServices.includes(serviceName) ?
        selectedContractorServices.filter((name) => name !== serviceName)
      :
        [...selectedContractorServices, serviceName];
    setSelectedContractorServices(list);
  }

  // Динамически генерируем цены на основе услуг выбранного мастера
  const prices = useMemo(() => {
    const contractorProductServices = selectedContractor.services?.[productId] || [];
    const pricesMap = {};
    contractorProductServices.forEach(serviceDetail => {
      pricesMap[serviceDetail.service] = {
        name: serviceDetail.service,
        price: serviceDetail.price,
        delivery: `${text('From')} ${serviceDetail.durationFrom.value} ${text(serviceDetail.durationFrom.unit)}` +
          (serviceDetail.durationTo ? ` ${text('to')} ${serviceDetail.durationTo.value} ${text(serviceDetail.durationTo.unit)}` : ''),
      };
    });
    return pricesMap;
  }, [selectedContractor, productId, text]);


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
      currentServiceDetails={currentProductDetails}
      prices={prices}
      selectedServices={selectedContractorServices}
      addRemoveService={addRemoveService}
      selectedContractor={selectedContractor}
      onSelectContractor={onSelectContractor}
      showOrderForm={showOrderForm}
      setShowOrderForm={setShowOrderForm}
      contractors={contractors}
      formError={formError}
      setFormError={setFormError}
      user={user}
      getSumPrice={getSumPrice}
      ignoreSelectedServices={ignoreContractorServices}
      addRemoveIgnoreService={addRemoveIgnoreService}
      description={description}
      setDescription={setDescription}
      address={address}
      setAddress={setAddress}
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
