import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navigation } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';

import '../../scss/added.css';
import 'swiper/css';
import 'swiper/css/navigation';
import style from './AddDevices.module.css';
import { useLanguage } from '../../state/language';
import { useServices } from '../../state/site-data';
import { useCreateOrder } from '../../state/order';

function AddDevices() {
  const text = useLanguage();
  const fileInputRef = useRef();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [photos, setPhotos] = useState([]);

  const { createOrder } = useCreateOrder();

  const { categories, subcategories, services } = useServices();
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [selectedService, setSelectedService] = useState('');

  const categoriesOptions = Object.entries(categories).map(([id, category]) => ({
      value: String(id),
      label: category.name,
  }));

  const subcategoriesOptions =
    selectedCategory && categories && subcategories
    ? categories[selectedCategory]
        .subcategories
        .map(subId => ({ value: String(subId), label: subcategories[subId].name }))
    : [];

  const servicesOptions =
    selectedSubcategory && subcategories && services
    ? subcategories[selectedSubcategory]
        .services
        .map(serviceId => ({ value: String(serviceId), label: services[serviceId].name }))
    : [];

  // загрузка фото
  const handleImageChange = (event) => {
    const files = Array.from(event.target.files);
    if (photos.length + files.length > 10) {
      setError(text('You can upload no more than 10 files.'));
      return;
    }
    setError('');
    const newPhotos = files.map((file) => ({
      file: file,
      url: URL.createObjectURL(file),
    }));
    setPhotos((prev) => [...prev, ...newPhotos]);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const rawFiles = photos.map(p => p.file).filter(Boolean);

    // Используем заглушку для cityId
    // todo: получить город из блока выбора города
    const cityId = 105;

    if (!address || !selectedService || !description || !price) {
        setError(text('Mandatory parameter is empty.'));
        return;
    }

    try {
      await createOrder({
        cityId: cityId,
        address: address,
        serviceId: Number(selectedService),
        description: description,
        attachments: rawFiles,
        price: Number(price),
      });

      navigate('/client/requests');
    } catch (err) {
      // Обработка ошибок
      let errorMessage = text('Check the correctness of the entered data');
      if (err instanceof Error && err.message) {
          errorMessage = err.message;
      }
      setError(errorMessage);
      console.error(err);
    }
  };

  useEffect(() => {
    document.title = text('Add device');
  }, [text]);

  useEffect(() => {
    // Очищаем все Object URL при размонтировании компонента
    return () => {
      photos.forEach((photo) => URL.revokeObjectURL(photo.url));
    };
  }, [photos]);

  return (
    <section className="page_8">
      <div className="accommodation mobile-accommodation">
        <form
          className={`g add-device-center mobile-g ${style.form}`}
          onSubmit={onSubmit}
        >
          <div className={style.form_row}>
            <div className={`h h-mobile ${style.left_block}`}>
              <div className="accommodation_text df align">
                <div className="accom_1 mobile-accom_1">
                  <h2>Разместить устройство которого нет в списке</h2>
                  <h3>
                    Как сделать лучшее описание, чтобы получить отклики лучших
                    специалистов
                  </h3>
                </div>
              </div>
              <div className="service_category">
                <div className="service_category-text">
                  <h2>Категория услуги</h2>
                </div>
                <div className="servis df align servis-mobile">
                  <div className="servics_text-big mobile-servics_text-big">
                    <div className="servic_text df align servic_text-mobile">
                      <div className="servic_img">
                        <img
                          src="/img/accommodation_img/Vector 100.png"
                          alt="img absent"
                        />
                      </div>
                      <h2>Уточните обьем работ</h2>
                    </div>
                    <div className="servic_text df align servic_text-mobile">
                      <div className="servic_img">
                        <img
                          src="/img/accommodation_img/Vector 100.png"
                          alt="img absent"
                        />
                      </div>
                      <h2>Как можно точно опишите результат</h2>
                    </div>
                    <div
                      className={`servic_text df align servic_text-mobile ${style.text_block}`}
                    >
                      <div className="servic_img">
                        <img
                          src="/img/accommodation_img/Vector 100.png"
                          alt="img absent"
                        />
                      </div>
                      <h2>Опишите с каким мастером вы хотите работать</h2>
                    </div>

                    <div className="description">
                      <div className="description_text mobile-description_text">
                        <h2>Адрес выполнения работ</h2>
                      </div>
                      <div className="descrip df mobile-descrip">
                        <div className="description_img mobile-description_img">
                          <img
                            src="/img/accommodation_img/Group.svg"
                            alt="img absent"
                          />
                        </div>
                        <input
                          placeholder="Укажите адрес..."
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="description">
                      <div className="description_text mobile-description_text">
                        <h2>Детальное описание задачи</h2>
                      </div>
                      <div className="descrip df mobile-descrip">
                        <div className="description_img mobile-description_img">
                          <img
                            src="/img/accommodation_img/Group.svg"
                            alt="img absent"
                          />
                        </div>
                        <textarea
                          required
                          placeholder="Опишите подробно, что нужно сделать..."
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="big_headings">
                <div className="heading">
                  <div className="heading_text mobile-heading_text">
                    <h2>Рубрика</h2>
                  </div>
                  <div className="big_heading df align">
                    <div className="heading_text-img mobile-heading_text-img">
                      <img
                        src="/img/accommodation_img/category.svg"
                        alt="img absent"
                      />
                    </div>
                    <div className="select-device__box">
                      <select
                        className="pick__price"
                        value={selectedCategory}
                        onChange={(e) => {
                          setSelectedCategory(Number(e.target.value));
                          setSelectedSubcategory('');
                          setSelectedService('');
                        }}
                      >
                        <option value="" disabled>
                          Категория
                        </option>
                        {categoriesOptions.map((item) => (
                          <option key={item.value} value={item.value}>
                            {item.label}
                          </option>
                        ))}
                      </select>
                      <select
                        className="pick__price"
                        value={selectedSubcategory}
                        disabled={!selectedCategory}
                        onChange={(e) => {
                          setSelectedSubcategory(Number(e.target.value));
                          setSelectedService('');
                        }}
                      >
                        <option value="" disabled>
                          Вид категории
                        </option>
                        {subcategoriesOptions.map((item) => (
                          <option value={item.value} key={item.value}>
                            {item.label}
                          </option>
                        ))}
                      </select>
                      <select
                        required
                        className="pick__price"
                        value={selectedService}
                        onChange={(e) =>
                          setSelectedService(Number(e.target.value))
                        }
                        disabled={!selectedSubcategory}
                      >
                        <option value="" disabled>
                          Бренд
                        </option>
                        {servicesOptions.map((item) => (
                          <option value={item.value} key={item.value}>
                            {item.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
                <div className="heading">
                  <div className="heading_text mobile-heading_text">
                    <h2>Назначьте цену себе</h2>
                  </div>
                  <div className="big_heading df align">
                    <div className="heading_text-img mobile-heading_text-img">
                      <img
                        src="/img/accommodation_img/money.svg"
                        alt="img absent"
                      />
                    </div>
                    <div className="heading_input df align">
                      <input
                        required
                        type="number"
                        placeholder="цена.."
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className={`right_col_photo ${style.photo_block}`}>
              <div className="accom_2 mobile-accom_2">
                <h2>Файлы</h2>
                <h3>Загрузите до 10 файлов</h3>
              </div>
              <div className={style.swiper_photo_row}>
                <Swiper
                  slidesPerView={1}
                  spaceBetween={30}
                  navigation={true}
                  modules={[Navigation]}
                  className="mySwiper"
                >
                  {photos.length <= 0 ? (
                    <SwiperSlide>
                      <img
                        src="/img/img-camera.png"
                        className={style.swiperPhoto}
                        alt=""
                      />
                    </SwiperSlide>
                  ) : (
                    photos.map((photo, index) => (
                      <SwiperSlide key={index}>
                        <img
                          src={photo.url}
                          alt={`upload-preview-${index}`}
                          className={style.swiperPhoto}
                        />
                      </SwiperSlide>
                    ))
                  )}
                </Swiper>
                <div className="photo_upload">
                  <div className="photo_upload-img mobile-photo_upload-img">
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
                      ref={fileInputRef}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div
            className="heading_button mobile-heading_button"
            style={{ width: '100%' }}
          >
            {error && (
              <div
                className="auth-err"
                style={{
                  maxWidth: '420px',
                  margin: 'auto',
                  marginBottom: '20px',
                }}
              >
                {error}
              </div>
            )}
            <button type="submit">Разместить</button>
          </div>
        </form>
      </div>
    </section>
  );
}

export default AddDevices;
