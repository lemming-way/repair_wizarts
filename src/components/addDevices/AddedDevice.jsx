import cn from 'classnames';
import { useEffect, useState } from 'react';
import { useRef } from 'react';
import { Link } from 'react-router-dom';
import Popup from 'reactjs-popup';
import { Navigation } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';

import style from './AddedDevice.module.css';
import ModalConfirmDelete from './ModalConfirmDelete';
import ModalConfirmPause from './ModalConfirmPause';
import { deleteRequest, updateRequest } from '../../services/request.service';
import appFetch from '../../utilities/appFetch';
import formatDate from '../../utilities/formatDate';
import { useLanguage } from '../../state/language';
// Вспомогательная функция для преобразования файла в base64
const fileToBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
// Функция для загрузки фото
const uploadPhoto = async (file) => {
  try {
    const base64String = await fileToBase64(file);
    const fileObject = {
      file: JSON.stringify({
        base64: base64String,
        name: file.name,
      }),
    };
    // appFetch как админ (3-й аргумент true)
    const response = await appFetch(
      '/dropbox/file/',
      {
        method: 'POST',
        body: fileObject,
      },
      true,
    );
    const result = await response;
    return `https://ibronevik.ru/taxi/api/v1/dropbox/file/${result.data.dl_id}`;
  } catch (error) {
    console.error('Ошибка в функции uploadPhoto:', error);
    throw error;
  }
};

const getDropboxUrl = (urlOrId) => {
  // Если это уже полный url, вернуть как есть
  if (urlOrId.startsWith('http')) return urlOrId;
  // Если это только dl_id
  return `https://ibronevik.ru/taxi/api/v1/dropbox/file/${urlOrId}`;
};

const StatusEnum = {
  ACTIVE: 'Active',
  PAUSED: 'Paused',
  WORKING: 'In progress',
  //~ COMPLETED: 'Completed',
  COMPLETED: 'Completed',
  CANCELED: 'Canceled',
};

// Компонент для отображения dropbox-фото через POST-запрос
const DropboxImage = ({ url, alt = '' }) => {
  const [imgUrl, setImgUrl] = useState(url.startsWith('blob:') ? url : null);
  const urlRef = useRef(null);
  useEffect(() => {
    let revoked = false;
    if (url.startsWith('blob:')) {
      setImgUrl(url);
      return;
    }
    // Получаем id из url
    const match = url.match(/\/dropbox\/file\/(\d+)/);
    const id = match ? match[1] : null;
    if (!id) return;
    fetch(
      `https://ibronevik.ru/taxi/c/tutor/api/v1/dropbox/file/${id}`,
      {
        method: 'POST',
        body: new URLSearchParams({
          token: 'bbdd06a50ddcc1a4adc91fa0f6f86444',
          u_hash:
            'VLUy4+8k6JF8ZW3qvHrDZ5UDlv7DIXhU4gEQ82iRE/zCcV5iub0p1KhbBJheMe9JB95JHAXUCWclAwfoypaVkLRXyQP29NDM0NV1l//hGXKk6O43BS3TPCMgZEC4ymtr',
        }),
      },
      true,
    ).then(async (res) => {
      const blob = await (res.blob ? res.blob() : res);
      console.log(blob);
      const objectUrl = URL.createObjectURL(blob);
      urlRef.current = objectUrl;
      if (!revoked) setImgUrl(objectUrl);
    });
    return () => {
      revoked = true;
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    };
  }, [url]);
  if (!imgUrl)
    return (
      <div style={{ width: '100%', height: 120, background: '#eee' }}>
        Loading...
      </div>
    );
  return <img src={imgUrl} alt={alt} style={{ width: '100%' }} />;
};

const AddedDevice = (props) => {
  const text = useLanguage();
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
    photoUrls = [],
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
  // photos: [{url, file?}]
  const [photos, setPhotos] = useState(
    photoUrls && Array.isArray(photoUrls) && photoUrls.length > 0
      ? photoUrls.map((url) => ({ url: getDropboxUrl(url) }))
      : [],
  );
  // При открытии модалки редактирования — подгружать реальные фото из props
  useEffect(() => {
    if (photoUrls && Array.isArray(photoUrls) && photoUrls.length > 0) {
      setPhotos(photoUrls.map((url) => ({ url: getDropboxUrl(url) })));
    }
  }, [photoUrls]);

  // загрузка фото
  const handleImageChange = (event) => {
    const files = Array.from(event.target.files);
    if (photos.length + files.length > 10) {
      // Можно добавить setError, если нужно
      return;
    }
    const newPhotos = files.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));
    setPhotos((prev) => [...prev, ...newPhotos]);
  };

  // Удаление фото по индексу
  const handleRemovePhoto = (index) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
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
          default:
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

  const onSubmit = async (e) => {
    e.preventDefault();
    // 1. Загрузить новые фото (у которых есть file)
    const uploadedUrls = [];
    for (const photo of photos) {
      if (photo.file) {
        const url = await uploadPhoto(photo.file);
        uploadedUrls.push(url);
      } else if (photo.url) {
        uploadedUrls.push(photo.url);
      }
    }
    // 2. Отправить обновление
    return updateRequest(id, {
      title,
      client_price: price,
      description: message,
      status,
      photoUrls: uploadedUrls,
      section: selectedService.section,
      subsection: selectedService.subsection,
      service: selectedService.service,
    }).then((v) => {
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
                {text('Offers')}: {number_of_offers}
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
                          {text('Editing the project')}
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
                            {photos.map((photo, index) => (
                              <SwiperSlide key={index} className="">
                                <div style={{ position: 'relative' }}>
                                  <DropboxImage url={photo.url} alt="" />
                                  <button
                                    type="button"
                                    style={{
                                      position: 'absolute',
                                      top: 0,
                                      right: 0,
                                      background: 'rgba(255,255,255,0.7)',
                                      border: 'none',
                                      cursor: 'pointer',
                                    }}
                                    onClick={() => handleRemovePhoto(index)}
                                  >
                                    ✕
                                  </button>
                                </div>
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
                          {text('Title')}
                          <img
                            className="modal_edit__icon"
                            src="/img/blank.png"
                            alt=""
                          />
                        </p>
                        <input
                          type="text"
                          placeholder={text('Title')}
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                        />

                        <p className="form__light-text">
                          {text('Order description')}
                          <img
                            className="modal_edit__icon"
                            src="/img/pencil_modal.svg"
                            alt=""
                          />
                        </p>
                        <textarea
                          className="descdetail"
                          placeholder={text('Order description')}
                          style={{ resize: 'none' }}
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                        ></textarea>

                        <p className="form__light-text">
                          {text('Service category')}
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
                              {text('Category')}
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
                              {text('Type of category')}
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
                              {text('Brand')}
                            </option>
                            {Services.map((item) => (
                              <option value={item.value} key={item.value}>
                                {item.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <p className="form__light-text">
                          {text('Budget')}
                          <img
                            className="modal_edit__icon"
                            src="/img/price_icon.png"
                            alt=""
                          />
                        </p>
                        <input
                          type="text"
                          style={{ width: '200px', marginBottom: '20px' }}
                          placeholder={text('Price')}
                          value={price}
                          onChange={(e) => setPrice(e.target.value)}
                        />

                        <button
                          style={{ width: '200px', margin: 'auto' }}
                          className="done button__edit"
                          type="submit"
                        >
                          {text('Save')}
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
                      <h1>{text('Confirm deletion')}</h1>
                      <p style={{ width: '80%', margin: 'auto' }}>
                        {text('Do you confirm the stop of the project? Sellers will not be able to add their offers to it anymore.')}
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
                            {text('Cancel')}
                          </button>
                          <button
                            className="btn_6PopUp"
                            type="submit"
                            style={{ margin: 0 }}
                            onClick={() => setStatus(StatusEnum.CANCELED)}
                          >
                            {text('Delete')}
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
          <p>{text('Published')} {formatDate(created_at)}</p>
        </div>
        <div className={style.view_row}>
          <img src="/img/icons/eye.png" alt="" />
          {text('viewed 20')}
        </div>
      </div>
    </div>
  );
};

export default AddedDevice;
