import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';

import '../../scss/detail.scss';
import '../../scss/media.css';
import { Navigation } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';

import style from './ServiceDetail.module.scss';
import { useLanguage } from '../../state/language';
import { useUser } from '../../state/user';
import { useServices } from '../../state/site-data';
import { useContractors, useCreateOrder } from '../../state/order';

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

  const [selectedContractor, setSelectedContractor] = useState({});
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [showSmallModal, setShowSmallModal] = useState(false);
  const [showBigModal, setShowBigModal] = useState(false);

  // todo: получить город из блока выбора города
  const selectedCity = 105;
  const { contractors } = useContractors({ service: serviceId, city: selectedCity });
  const { createOrder } = useCreateOrder();

  const onSelectContractor = async (contractorData) => {
    setSelectedContractor(contractorData);
    setShowSmallModal(true);
    setShowBigModal(false);
  };

  const handleCloseModals = () => {
    setShowSmallModal(false);
    setShowBigModal(false);
    setSelectedContractor({});
  };

  const handleShowBigModal = () => {
    setShowSmallModal(false);
    setShowBigModal(true);
  };

  const [description, setDescription] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    if (selectedServices.length === 0) {
      setFormError('Select services');
      return;
    }

    const orderData = {
      cityId: selectedCity,
      // todo: Добавить адрес в форму
      address: '',
      serviceId,
      description,
      price: getSumPrice(),
      type: 'order'
    };
    if (selectedContractor?.id) orderData.contractorId = selectedContractor.id;
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
