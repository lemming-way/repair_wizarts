import { useEffect, useState, useRef } from 'react';
import { Navigation } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import '../../scss/added.css';
import 'swiper/css';
import 'swiper/css/navigation';
import { createRequest } from '../../services/request.service';
import style from './AddDevices.module.css';
import { useSelector } from 'react-redux';

function Profile() {
  const fileInputRef = useRef();
  const navigate = useNavigate();
  const [URLSearchParams] = useSearchParams();
  const { categories } = useSelector((state) => state.categories);
  const title = URLSearchParams.get('title');
  const [error, setError] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [selectedCat, setSelectedCat] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [photos, setPhotos] = useState([
    'https://cdn.motor1.com/images/mgl/VzMq0z/s1/bugatti-chiron-1500.webp',
  ]);
  const [Sections, setSections] = useState([]);
  const [Subsections, setSubsections] = useState([]);
  const [Services, setServices] = useState([]);
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
          console.log(services);
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
  const onSubmit = (e) => {
    e.preventDefault();

    const data = {
      title,
      description,
      client_price: price,
      ...selectedService,
    };
    const files = fileInputRef.current?.files;
    return createRequest({
      data,
      files,
    })
      .then((d) => {
        console.log(d);
        console.log(data);
        navigate('/client/requests');
      })
      .catch((err) => {
        if (err.message) {
          return setError(err.message);
        }
        setError('Проверьте корректность введённых данных');
        console.error(err);
      });
  };

  useEffect(() => {
    document.title = 'Добавить устройства';
    getData('section');
  }, []);
  const [selectedService, setSelectedService] = useState({
    section: '',
    subsection: '',
    service: '',
  });
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
                          name=""
                          id=""
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
                        value={selectedService.section}
                        onChange={(e) => {
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
                          console.log(selectedService);
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
                        {/* {services.service_types.map((v) => Number(selectedCat) === v.category_id && (
                                                    <option value={v.id} key={v.id}>{v.name}</option>
                                                ))} */}
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
                        type="text"
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

export default Profile;
