import style from "./OrderRow.module.css"
import { Navigation } from "swiper"
import { Swiper, SwiperSlide } from "swiper/react";
import { useState } from "react"
import ModalOfferGo from "./ModalOfferGo";

export default function OrderRowOffer () {
    // тестовый список для слайдера
    const [photos] = useState([
        "/img/sentence_img/iphone-x.png",
        "/img/sentence_img/iphone-x.png",
        "/img/sentence_img/iphone-x.png",
    ]);
    const images = [
        '/img/sentence_img/iphone-x.png',
        '/img/sentence_img/iphone-x.png', // Здесь можно добавить другие изображения
        '/img/sentence_img/iphone-x.png',
    ];
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalImage, setModalImage] = useState("");


    const [visibleModalGo, setVisibleModalGo] = useState(false)
    const [visibleBlock, setVisibleBlock] = useState(false)
    // Функция для открытия модального окна
    const openModal = (imageSrc) => {
        setModalImage(imageSrc); // Устанавливаем путь к картинке
        setIsModalOpen(true); // Открываем модальное окно
    };

    // Функция для закрытия модального окна
    const closeModal = () => {
        setIsModalOpen(false); // Закрываем модальное окно
    };

    return (
        <>
            {visibleModalGo ? <ModalOfferGo setVisibleModalGo={setVisibleModalGo} />: null}
            

            <div className={style.order_row}>
                <div className={style.left}>
                    <div className={style.profile}>
                        <img src="/img/profil_img/1.png" alt="" />
                        <div className={style.profile__col}>
                            <p className={style.name}>Имя фамилия </p>
                            <p>Размещено проектов на бирже 12</p>
                            <p>Нанято 90%</p>
                        </div>
                    </div>
                    <div style={{flex: 1}}></div>
                    <p className={style.description}>Название устройства </p>
                    <p className={style.description}>клиент описывает свою проблему </p>
                    <p className={style.small_text}><span>осталось 10 часов</span><span className={style.flex}><img src="/img/icons/eye.png" alt="" />20 просмотрено</span></p>
                   
                </div>

                <div className={style.right}>
                    <p>Желаемый бюджет <span className={style.price}>1000 ₽</span></p>
                    <Swiper
                            slidesPerView={4}
                            spaceBetween={30}
                            navigation={true}
                            modules={[Navigation]}
                            className={style.swiper}
                            breakpoints={{
                                0: {
                                    slidesPerView: 1
                                },
                                800: {
                                    slidesPerView: 1
                                },
                                1124: {
                                    slidesPerView: 1
                                },
                            }}
                        >

                            {photos.map((src, index) =>
                                <SwiperSlide key={index} className={style.swiperSlide}>
                                    <img
                                        onClick={() => openModal('/img/sentence_img/iphone-x.png')}
                                        src={src} alt="" />
                                </SwiperSlide>
                            )}
                    </Swiper>
                    <button className={style.button} onClick={()=>setVisibleBlock(true)}>Предложить услугу</button>
                </div>
            </div>

            {visibleBlock ?
            <>
            <p className={style.heading}>Предложить услугу</p>
            <div className={style.comment_wrap2}>
                
                {/* <div className={style.profile}>
                    <img src="/img/profil_img/1.png" alt="" />
                    <div className={style.profile__col}>
                        <p className={style.name}>Алексей Иванов</p>
                        <p>0 заказов</p>
                    </div>
                </div> */}

                <div className={style.comment_block}>
                    <div className={style.icon_chat2}>
                        <img src="/img/chat.png" alt="" />
                    </div>
                    <div className={style.error}>Пожалуйста пополните баланс на 100 рублей </div>
                    <textarea style={{marginBottom: "30px"}} className={style.comment__input} rows={4} placeholder="Напишите как вы почините устройства клиента.." />

                    <div className={style.last_row}>
                        <img className={style.dollar_img} src="/img/baks.png" alt="" />
                        <div className={style.price_block}>
                            <label className={style.label_price} htmlFor="price">Стоимость</label>
                            <input className={style.input_price} placeholder="укажите стоимость" type="text" id="price" />
                            <img src="/img/simvol_rubl.png" alt="" />
                        </div>
                        <div className={style.timer_block}>
                            <img src="/img/timer.png" alt="" />
                            <select className={style.select_timer} name="" id="">
                                <option value="">Выберите</option>
                                <option value="">Готов выехать</option>
                                <option value="">1 час</option>
                                <option value="">2 часа</option>
                                <option value="">3 часа</option>
                                <option value="">4 часа</option>
                                <option value="">6 часов</option>
                                <option value="">8 часов</option>
                                <option value="">24 часа</option>
                                <option value="">3 дня</option>
                                <option value="">7 дней</option>
                            </select>
                        </div>
                    </div>
                    <div className={style.flex_row}>
                        <button className={style.button_go} onClick={()=>setVisibleModalGo(true)}>Продолжить</button>
                    </div>
                </div>
            </div>
            </>
            : null}

            {/* Модальное окно с слайдером */}
            {isModalOpen && (
                <div className="modal" onClick={closeModal}>
                    <div className="modalContent" onClick={(e) => e.stopPropagation()}>
                        <button className="closeBtn" onClick={closeModal}>
                            &times;
                        </button>

                        {/* Слайдер внутри модального окна */}
                        <Swiper
                            initialSlide={images.indexOf(modalImage)} // Определяем текущий слайд
                            navigation={true}
                            modules={[Navigation]}
                            className="modalSwiper"
                        >
                            {images.map((image, index) => (
                                <SwiperSlide key={index}>
                                    <div className='modal-content-info'>
                                        <img src={image} alt={`Slide ${index + 1}`}/>
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
                    position: absolute;
                    right: 10px;
                    font-size: 30px;
                    background: none;
                    top: 0px;
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
    )
}