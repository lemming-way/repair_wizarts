import style from './OrderRow.module.css';
import { Navigation } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import { useState } from 'react';
import ModalOfferGo from './ModalOfferGo';
import { useSelector } from 'react-redux';
import { selectUser } from '../../slices/user.slice';
import appFetch from '../../utilities/appFetch';

export default function OrderRowOffer({
  b_id,
  userName,
  projectsPosted,
  hiredPercent,
  deviceName,
  problemDescription,
  timeLeft,
  views,
  budget,
  images,
  profileImage = '/img/profil_img/1.png',
}) {
  const user = JSON.parse(localStorage.getItem('userdata')).user;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalImage, setModalImage] = useState('');
  const [visibleModalGo, setVisibleModalGo] = useState(false);
  const [visibleBlock, setVisibleBlock] = useState(false);
  const [comment, setComment] = useState('');
  const [price, setPrice] = useState('');
  const [time, setTime] = useState('');

  const openModal = (imageSrc) => {
    setModalImage(imageSrc);
    setIsModalOpen(true);
  };
  const closeModal = () => {
    setIsModalOpen(false);
  };
  const handleSubmit = async () => {
    try {
      if (!comment || !price || !time) {
        alert('Пожалуйста, заполните все поля');
        return;
      }

      const preparedData = {
        bind_amount: price,
        comment: comment,
        time: time,
      };
      let isHasBind;
      if (isHasBind) {
        alert('Вы уже отправили заявку');
      } else {
        console.log(user);
        isHasBind = await appFetch(`/drive/get/${b_id}`, {
          body: {
            u_a_role: 2,
            performer: 0,
            action: 'set_performer',
            data: JSON.stringify({
              c_id: user?.c_id || '1',
              c_payment_way: 2,
              c_options: {
                author: {
                  name: user?.name,
                  email: user?.email,
                  phone: user?.phone,
                  photo: user.u_photo,
                  ...user,
                },
                bind_amount: preparedData.bind_amount,
                comment: preparedData.comment,
                time: preparedData.time,
              },
            }),
          },
        });
      }
      console.log(isHasBind);
      console.log('Успешно отправлено предложение!');
      setVisibleModalGo(true);
    } catch (error) {
      console.error('Ошибка при отправке:', error);
      alert(error.message || 'Ошибка при отправке предложения');
    }
  };

  return (
    <>
      {visibleModalGo && <ModalOfferGo setVisibleModalGo={setVisibleModalGo} />}

      <div className={style.order_row}>
        <div className={style.left}>
          <div className={style.profile}>
            {/* <img src={profileImage} alt="Профиль" /> */}
            <div className={style.profile__col}>
              <p className={style.name}>{userName}</p>
              <p>Размещено проектов на бирже {projectsPosted}</p>
              <p>Нанято {hiredPercent}%</p>
            </div>
          </div>
          <div style={{ flex: 1 }}></div>
          <p className={style.description}>{deviceName}</p>
          <p className={style.description}>{problemDescription}</p>
          <p className={style.small_text}>
            <span>осталось {timeLeft}</span>
            <span className={style.flex}>
              <img src="/img/icons/eye.png" alt="Просмотры" />
              {views} просмотрено
            </span>
          </p>
        </div>

        <div className={style.right}>
          <p>
            Желаемый бюджет <span className={style.price}>{budget} ₽</span>
          </p>
          <Swiper
            slidesPerView={4}
            spaceBetween={30}
            navigation={true}
            modules={[Navigation]}
            className={style.swiper}
            breakpoints={{
              0: { slidesPerView: 1 },
              800: { slidesPerView: 1 },
              1124: { slidesPerView: 1 },
            }}
          >
            {images.map((src, index) => (
              <SwiperSlide key={index} className={style.swiperSlide}>
                {/* <img onClick={() => openModal(src)} src={src} alt="" /> */}
              </SwiperSlide>
            ))}
          </Swiper>
          <button
            className={style.button}
            onClick={() => setVisibleBlock(true)}
          >
            Предложить услугу
          </button>
        </div>
      </div>

      {visibleBlock && (
        <>
          <p className={style.heading}>Предложить услугу</p>
          <form
            className={style.comment_wrap2}
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
          >
            <div className={style.comment_block}>
              <div className={style.icon_chat2}>
                <img src="/img/chat.png" alt="" />
              </div>
              {/* <div className={style.error}>
          Пожалуйста пополните баланс на 100 рублей
        </div> */}

              <textarea
                style={{ marginBottom: '30px' }}
                className={style.comment__input}
                rows={4}
                placeholder="Напишите как вы почините устройства клиента.."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />

              <div className={style.last_row}>
                <img className={style.dollar_img} src="/img/baks.png" alt="" />
                <div className={style.price_block}>
                  <label className={style.label_price} htmlFor="price">
                    Стоимость
                  </label>
                  <input
                    className={style.input_price}
                    placeholder="укажите стоимость"
                    type="text"
                    id="price"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                  <img src="/img/simvol_rubl.png" alt="" />
                </div>

                <div className={style.timer_block}>
                  <img src="/img/timer.png" alt="" />
                  <select
                    className={style.select_timer}
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                  >
                    <option value="">Выберите</option>
                    <option value="ready">Готов выехать</option>
                    <option value="1">1 час</option>
                    <option value="2">2 часа</option>
                    <option value="3">3 часа</option>
                    <option value="4">4 часа</option>
                    <option value="6">6 часов</option>
                    <option value="8">8 часов</option>
                    <option value="24">24 часа</option>
                    <option value="72">3 дня</option>
                    <option value="168">7 дней</option>
                  </select>
                </div>
              </div>

              <div className={style.flex_row}>
                <button type="submit" className={style.button_go}>
                  Продолжить
                </button>
              </div>
            </div>
          </form>
        </>
      )}

      {isModalOpen && (
        <div className="modal" onClick={closeModal}>
          <div className="modalContent" onClick={(e) => e.stopPropagation()}>
            <button className="closeBtn" onClick={closeModal}>
              &times;
            </button>
            <Swiper
              initialSlide={images.indexOf(modalImage)}
              navigation={true}
              modules={[Navigation]}
              className="modalSwiper"
            >
              {images.map((image, index) => (
                <SwiperSlide key={index}>
                  <div className="modal-content-info">
                    <img src={image} alt={`Slide ${index + 1}`} />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      )}

      <style jsx>{`
        .modal {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 9999;
        }
        .modalContent {
          position: relative;
          padding: 20px;
          background: white;
          width: 60%;
          height: 80%;
          overflow: hidden;
        }
        .modal-content-info {
          display: flex;
          justify-content: center;
          align-items: center;
          width: 100%;
          height: 100%;
        }
        .modal img {
          width: auto;
          height: 80%;
        }
        .closeBtn {
          position: absolute;
          right: 10px;
          top: 0px;
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
        @media screen and (max-width: 1000px) {
          .modalContent {
            height: 50% !important;
          }
          .modal img {
            width: 100% !important;
            height: auto !important;
          }
        }
      `}</style>
    </>
  );
}
