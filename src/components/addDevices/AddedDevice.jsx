import { useEffect, useState } from 'react';
import cn from 'classnames';
import { Link } from 'react-router-dom';
import Popup from 'reactjs-popup';
import formatDate from '../../utilities/formatDate';
import { deleteRequest, updateRequest } from '../../services/request.service';
import ModalConfirmPause from './ModalConfirmPause';
import ModalConfirmDelete from './ModalConfirmDelete';

import { Navigation } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import style from './AddedDevice.module.css';

const StatusEnum = {
  ACTIVE: 'Активно',
  PAUSED: 'Пауза',
  WORKING: 'В работе',
  COMPLETED: 'Выполнено',
  COMPLETED: 'Завершено',
  CANCELED: 'Отменено',
};

const AddedDevice = (props) => {
  const {
    id,
    title: titleProps,
    client_price,
    description,
    number_of_offers,
    status: statusProps,
    onUpdate: onDeviceUpdate,
    service,
    subsection,
    section,
    created_at,
  } = props;

  const [isVisibleConfirmPause, setVisibleConfirmPause] = useState(false);
  const [isVisibleConfirmDelete, setVisibleConfirmDelete] = useState(false);
  const [Sections, setSections] = useState([]);
  const [Subsections, setSubsections] = useState([]);
  const [Services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState({
    section: section,
    subsection: subsection,
    service: service,
  });
  // тестовый список для слайдера
  const [photos, setPhotos] = useState([
    'https://cdn.motor1.com/images/mgl/VzMq0z/s1/bugatti-chiron-1500.webp',
  ]);

  // загрузка фото
  const handleImageChange = (event) => {
    const file = event.target.files[0];
    console.log('внутри функции');

    if (file) {
      // Создаем URL для выбранного изображения
      const imageUrl = URL.createObjectURL(file);

      // добавить фото в общий список
      var spisok = [...photos];
      spisok.push(imageUrl);
      setPhotos(spisok);
      console.log(spisok);
    }
  };
  const getData = async (type, sectionId, subsectionId) => {
    try {
      switch (type) {
        case 'section':
          const sectionsResponse = await fetch(
            'https://profiback.itest24.com/api/sections',
            {
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${'123'}`,
              },
            },
          );
          const sections = await sectionsResponse.json();
          setSections(
            sections.map((section) => ({
              value: section.id,
              label: section.name,
            })),
          );
          break;
        case 'subsection':
          const subsectionResponse = await fetch(
            `https://profiback.itest24.com/api/subsections/?section_id=${sectionId}`,
            {
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${'123'}`,
              },
            },
          );
          const subsections = await subsectionResponse.json();
          setSubsections(
            subsections.map((subsection) => ({
              value: subsection.id,
              label: subsection.name,
            })),
          );
          break;
        case 'service':
          console.log(sectionId, subsectionId);
          const serviceResponse = await fetch(
            `https://profiback.itest24.com/api/services/?subsection_id=${subsectionId}&section_id=${sectionId}`,
            {
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${'123'}`,
              },
            },
          );
          const services = await serviceResponse.json();
          setServices(
            services.map((service) => ({
              value: service.id,
              label: service.name,
            })),
          );
          break;
      }
    } catch (error) {
      console.error(error);
    }
  };
  const [price, setPrice] = useState(client_price);
  const [title, setTitle] = useState(titleProps);
  const [message, setMessage] = useState(description);
  const [status, setStatus] = useState(statusProps);

  const isEditable =
    status === StatusEnum.ACTIVE || status === StatusEnum.PAUSED;

  const onSubmit = (e) => {
    e.preventDefault();

    return updateRequest(id, {
      title,
      client_price: price,
      description: message,
      status,
    }).then((v) => {
      console.log(v);
      onDeviceUpdate();
    });
  };

  const onDelete = (e) => {
    e.preventDefault();
    return deleteRequest(id).then((v) => {
      console.log(v, id);
      onDeviceUpdate();
    });
  };
  const setRequestStatus = (status) => {
    return updateRequest(id, { status: status }).then((v) => {
      onDeviceUpdate();
    });
  };
  const buttonClassName = cn('dubl-btn-free', {
    'dubl-btn': status === StatusEnum.ACTIVE,
    'dubl-but': status === StatusEnum.PAUSED,
    'dubl-but-blue': status === StatusEnum.WORKING,
    'dubl-but-green': status === StatusEnum.COMPLETED,
  });
  useEffect(() => {
    getData('section');
    getData('subsection', section);
    getData('service', section, subsection);
  }, [section, subsection, service]);
  return (
    <div className={`archive-hee ${style.card_modile}`}>
      {isVisibleConfirmPause ? (
        <ModalConfirmPause
          setVisibleAddFeedback={setVisibleConfirmPause}
          setStatus={setStatus}
          onClick={setRequestStatus}
          StatusEnum={StatusEnum}
        />
      ) : null}
      {isVisibleConfirmDelete ? (
        <ModalConfirmDelete setVisibleAddFeedback={setVisibleConfirmDelete} />
      ) : null}

      <div className={`nav_applications-3 df align`}>
        <div className={`nav_applications-text ${style.card_modile__heading}`}>
          <h2>{titleProps}</h2>
        </div>
        <div className="nav_applications-2 df ">
          <div className={`applications_text-2 df align`}>
            <h4 className={style.card_modile__price}>{client_price}₽</h4>

            {status === StatusEnum.ACTIVE ? (
              <Link
                to={'/client/requests/my_order/' + id}
                className={style.desktop__count}
              >
                <h3>{number_of_offers}</h3>
              </Link>
            ) : (
              <h3 className={`number-of-offers ${style.desktop__count}`}>
                {number_of_offers}
              </h3>
            )}

            <div
              className={`double_buttons  ${style.card_modile__status_block}`}
            >
              <span className={buttonClassName}>{status}</span>
            </div>

            <div className={style.card__line}></div>

            <div className={style.card__count}>
              <Link to={'/client/requests/my_order/' + id}>
                Предложений: {number_of_offers}
              </Link>
            </div>

            <div className={`nav_applications-3 ${style.card_modile__buttons}`}>
              <div className="nav_applications-img">
                {isEditable && (
                  <form onSubmit={onSubmit}>
                    {status === StatusEnum.ACTIVE ? (
                      <button className="btn-rand">
                        {/* <img src="/img/added_img/pause.svg" onClick={() => setStatus(StatusEnum.PAUSED)} alt="img absent" /> */}
                        <img
                          src="/img/added_img/pause.svg"
                          onClick={() => setVisibleConfirmPause(true)}
                          alt="img absent"
                        />
                      </button>
                    ) : (
                      <button className="btn-rand">
                        <img
                          src="/img/added_img/pause.png"
                          onClick={() => {
                            setStatus(StatusEnum.ACTIVE);
                            setRequestStatus(StatusEnum.ACTIVE);
                          }}
                          alt="img absent"
                        />
                      </button>
                    )}
                  </form>
                )}
                <Popup
                  trigger={
                    isEditable && (
                      <img src="/img/added_img/pencil.svg" alt="img absent" />
                    )
                  }
                  modal
                  nested
                >
                  {(close) => (
                    <div
                      className="modal-content order_edit-modal modal-content__edit"
                      style={{ backgroundColor: 'white', maxWidth: '95%' }}
                    >
                      <span onClick={close}>
                        <img
                          className="close"
                          src="/img/img-delete.png"
                          alt=""
                        />
                      </span>

                      <div className={style.top_block}>
                        <h1 style={{ textAlign: 'center' }}>
                          Редактирование проекта
                        </h1>
                        <div
                          className="modal-content__row_swiper"
                          style={{ flexWrap: 'wrap' }}
                        >
                          <Swiper
                            slidesPerView={4}
                            spaceBetween={30}
                            navigation={true}
                            modules={[Navigation]}
                            className="mySwiper"
                            breakpoints={{
                              0: {
                                slidesPerView: 1,
                              },
                              800: {
                                slidesPerView: 1,
                              },
                              1124: {
                                slidesPerView: 1,
                              },
                            }}
                          >
                            {photos.map((src, index) => (
                              <SwiperSlide key={index} className="">
                                <img src={src} alt="" />
                              </SwiperSlide>
                            ))}
                          </Swiper>

                          <div
                            className={`photo_upload ${style.photo_upload_block}`}
                          >
                            <div className="photo_upload-img ">
                              <label htmlFor="upimg">
                                <img
                                  src="/img/accommodation_img/photo.png"
                                  alt="img absent"
                                />
                              </label>
                              <input
                                type="file"
                                onChange={handleImageChange}
                                accept="image/png, image/jpeg"
                                multiple
                                id="upimg"
                                style={{ display: 'none' }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      <form
                        onSubmitCapture={onSubmit}
                        onSubmit={close}
                        style={{ display: 'flex', flexDirection: 'column' }}
                      >
                        <p className="form__light-text">
                          Заголовок
                          <img
                            className="modal_edit__icon"
                            src="/img/blank.png"
                            alt=""
                          />
                        </p>
                        <input
                          type="text"
                          placeholder="Заголовок"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                        />

                        <p className="form__light-text">
                          Описание заказа
                          <img
                            className="modal_edit__icon"
                            src="/img/pencil_modal.svg"
                            alt=""
                          />
                        </p>
                        <textarea
                          className="descdetail"
                          placeholder="Описание заказа"
                          style={{ resize: 'none' }}
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                        ></textarea>

                        <p className="form__light-text">
                          Категория услуг
                          <img
                            className="modal_edit__icon"
                            src="/img/multi_box.png"
                            alt=""
                          />
                        </p>
                        <div className="modal__many_select">
                          <select
                            className="pick__price"
                            value={selectedService.section}
                            onChange={(e) => {
                              setSelectedService((prev) => ({
                                ...prev,
                                service: '',
                                subsection: '',
                              }));
                              getData('subsection', e.target.value);
                              setSelectedService((prev) => ({
                                ...prev,
                                section: e.target.value,
                              }));
                            }}
                          >
                            <option value="" disabled>
                              Категория
                            </option>
                            {Sections.map((item) => (
                              <option key={item.value} value={item.value}>
                                {item.label}
                              </option>
                            ))}
                          </select>
                          <select
                            className="pick__price"
                            value={selectedService.subsection}
                            disabled={!selectedService.section}
                            onChange={(e) => {
                              setSelectedService((prev) => ({
                                ...prev,
                                service: '',
                              }));
                              getData(
                                'service',
                                selectedService.section,
                                e.target.value,
                              );
                              setSelectedService((prev) => ({
                                ...prev,
                                subsection: e.target.value,
                              }));
                            }}
                          >
                            <option value="" disabled>
                              Вид категории
                            </option>
                            {Subsections.map((item) => (
                              <option value={item.value} key={item.value}>
                                {item.label}
                              </option>
                            ))}
                          </select>
                          <select
                            className="pick__price"
                            value={selectedService.service}
                            onChange={(e) =>
                              setSelectedService((prev) => ({
                                ...prev,
                                service: e.target.value,
                              }))
                            }
                            disabled={!selectedService.subsection}
                          >
                            <option value="" disabled>
                              Бренд
                            </option>
                            {Services.map((item) => (
                              <option value={item.value} key={item.value}>
                                {item.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <p className="form__light-text">
                          Бюджет
                          <img
                            className="modal_edit__icon"
                            src="/img/price_icon.png"
                            alt=""
                          />
                        </p>
                        <input
                          type="text"
                          style={{ width: '200px', marginBottom: '20px' }}
                          placeholder="Цена"
                          value={price}
                          onChange={(e) => setPrice(e.target.value)}
                        />

                        <button
                          style={{ width: '200px', margin: 'auto' }}
                          className="done button__edit"
                          type="submit"
                        >
                          Сохранить
                        </button>
                      </form>
                    </div>
                  )}
                </Popup>
                <Popup
                  trigger={
                    isEditable && (
                      <img src="/img/added_img/fluent.svg" alt="img absent" />
                    )
                  }
                  modal
                  nested
                >
                  {(close) => (
                    <div
                      className="modal-content"
                      style={{
                        textAlign: 'center',
                        backgroundColor: 'white',
                        maxWidth: '95%',
                      }}
                    >
                      <span onClick={close}>
                        <img
                          className="close"
                          src="/img/img-delete.png"
                          alt=""
                        />
                      </span>
                      <h1>Подтверждение удаление</h1>
                      <p style={{ width: '80%', margin: 'auto' }}>
                        Вы подтверждаете остановку проекта? Продавцы не смогут
                        больше добавлять в него свои предложения.
                      </p>
                      <div className="df" style={{ justifyContent: 'center' }}>
                        <form
                          className={style.form__row}
                          onSubmitCapture={onDelete}
                          onSubmit={close}
                        >
                          <button
                            className="btn_6PopUpBack"
                            type="button"
                            style={{
                              margin: 0,
                              backgroundColor: 'unset',
                              color: 'black',
                              border: '1px solid black',
                            }}
                            onClick={close}
                          >
                            Отмена
                          </button>
                          <button
                            className="btn_6PopUp"
                            type="submit"
                            style={{ margin: 0 }}
                            onClick={() => setStatus(StatusEnum.CANCELED)}
                          >
                            Удалить
                          </button>
                        </form>
                      </div>
                    </div>
                  )}
                </Popup>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className={style.info_block}>
        <div className="inf_text-1">
          <p>Опубликованно {formatDate(created_at)}</p>
        </div>
        <div className={style.view_row}>
          <img src="/img/icons/eye.png" alt="" />
          просмотрено 20
        </div>
      </div>
    </div>
  );
};

export default AddedDevice;
