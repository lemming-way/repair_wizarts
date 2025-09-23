import React, { useEffect, useState, useMemo } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper";
import { Rating } from "react-simple-star-rating";
import { getMasterByUsername } from "../../services/user.service";
import { getMasterRepairs } from "../../services/service.service";
import { useService } from "../../hooks/useService";
import { Link } from "react-router-dom";
import YMap from '../Map'
import './master.css'
import { useSearchParams } from "react-router-dom";
import Popup from "reactjs-popup";
import SERVER_PATH from "../../constants/SERVER_PATH";
import InfoBlock from "./InfoBlock";
import HeroSection from "../../features/HomePage/HeroSection/HeroSection";


function App() {
    const [params] = useSearchParams()
    const [master, setMaster] = useState({ })
    const repairs = useService(getMasterRepairs, [])
    // const counters = useService(getCounters, { })
    // const covers = useService(getCovers, [])
    const [picture, setPicture] = useState("")
    // const images = [
    //     '/img/sentence_img/iphone-x.png',
    //     '/img/sentence_img/iphone-x.png', // Здесь можно добавить другие изображения
    //     '/img/sentence_img/iphone-x.png',
    // ];
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Функция для открытия модального окна
    const openModal = (imageSrc) => {
        //~ setModalImage(imageSrc); // Устанавливаем путь к картинке
        setIsModalOpen(true); // Открываем модальное окно
    };

    // Функция для закрытия модального окна
    const closeModal = () => {
        setIsModalOpen(false); // Закрываем модальное окно
    };

    const masterId = params.get('id')
    const pics = params.get('pics')

    const masters = useMemo(() => repairs.data.reduce((state, repair) => {
        if (state.find((v) => v.id === repair.master_id)) {
            return state
        }

        return [...state, {
            id: repair.master_id,
            latitude: repair.address_latitude,
            longitude: repair.address_longitude
        }]
    }, []), [repairs.data])

    const onMasterSelect = (e, data) => {
        getMasterByUsername(data).then(setMaster)
    }

    useEffect(() => {
        if (pics) {
            setTimeout(() => {
                document.documentElement.scrollTop =
                    document.documentElement.scrollHeight - document.documentElement.clientHeight
            }, 1000);
        }
    }, [pics])

    useEffect(() => {
        if (masterId) {
            getMasterByUsername(masterId).then(setMaster)
        }

        document.title = 'Контакты';
    }, [masterId])

    // тестовые данные - услуги
    const test_price = [
        {
            "price": 500,
            "model": "iphone 15 pro max",
            "delivery": "от 30 мин",
            "name": "Замена стекла"
        },
        {
            "price": 300,
            "model": "iphone 14",
            "delivery": "от 30 мин",
            "name": "Замена аккумулятора"
        },
        {
            "price": 450,
            "model": "samsung s23",
            "delivery": "от 1 часа",
            "name": "Ремонт дисплея"
        },
        {
            "price": 350,
            "model": "xiaomi 13",
            "delivery": "от 2 часов",
            "name": "Чистка устройства"
        },
        {
            "price": 700,
            "model": "google pixel 7",
            "delivery": "от 1 часа",
            "name": "Замена задней крышки"
        },
        {
            "price": 550,
            "model": "oneplus 10",
            "delivery": "от 3 часов",
            "name": "Ремонт камеры"
        },
        {
            "price": 400,
            "model": "sony xperia 1 iv",
            "delivery": "от 2 часов",
            "name": "Обновление программного обеспечения"
        },
        {
            "price": 600,
            "model": "samsung s22 ultra",
            "delivery": "от 1 часа",
            "name": "Замена зарядного порта"
        }
    ]

    const [isVisibleInfo, setVisibleInfo] = useState(false)

    return (
        <main>

            {isVisibleInfo && <InfoBlock handlerClose={setVisibleInfo} />}

            {/* <section className="slider">
                <div className="container">
                    <div className="slider__content">
                        <h2>
                            Для любой поломки есть мастер техники
                            Apple
                        </h2>
                        <h4>Оригинальные запчасти</h4>
                        <h4>Разумные цены</h4>
                        <h4>Выезд</h4>
                        <div className="home-counters">
                            <div className="home-counters__top">
                                <div className="header-counters__dot"></div>
                                <div className="header-counters__item">
                                    Количество участников на сайте: {counters.data.masters}
                                </div>
                                <div className="header-counters__dot"></div>
                                <div className="header-counters__item">
                                    Выполнено заказов на сайте: {counters.data.submissions}
                                </div>
                            </div>
                            <Link
                                to="/register"
                                className="home-counters__button"
                            >
                                    Стать участником
                            </Link>
                        </div>
                    </div>
                    <Swiper
                        navigation={true}
                        modules={[Navigation, Pagination]}
                        pagination={true}
                        className="mySwiper"
                    >
                        {covers.data.map((v) => (
                            <SwiperSlide className='pqw9ueryewqir' key={v.id}>
                                <img
                                    className='swiper-slide-asfdfadsXg afewrweq'
                                    src={SERVER_PATH + v.image}
                                    alt=""
                                />
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </div>
            </section> */}

            <HeroSection />
            <section className="master__map">
                <h1 className="master__map__title">Карта наших мастеров </h1>
                <YMap
                    masters={masters}
                    selectedMaster={master}
                    selectMaster={onMasterSelect}
                />
            </section>
            <h2 className="master__h2">Информация о сервере</h2>
            <div className="section__blocks-row">

            <div className="info_master">
                <div className="info_master__row1">
                    <img src="/img/profile__image.png" alt="" />
                    <div className="info_master__about">
                        <p>Алексей Михеев</p>
                        <p>Частный мастер</p>
                        <div className="info_master__stars">
                            <img src="/img/star.png" alt="" />
                            <img src="/img/star.png" alt="" />
                            <img src="/img/star.png" alt="" />
                            <img src="/img/star.png" alt="" />
                            <img src="/img/star.png" alt="" />
                        </div>
                        <div className="info_master__row-links">
                            <Link to="/client/feedback/1">23 отзыва</Link>
                            <button className="info_master__row-link" href="#" onClick={()=> setVisibleInfo(true)}>Подробнее</button>
                        </div>
                    </div>
                </div>

                <p className="info_master__info">Санкт-Петербург, Каховского 7</p>
                <p className="info_master__info">Открыт: с 9 до 21</p>
                <p className="info_master__text-about"><span className="info_master__text-about-light">На сайте</span>с 2022 года</p>
                <p className="info_master__text-about"><span className="info_master__text-about-light">Статус</span>онлайн</p>
                <p className="info_master__text-about--accent"><span className="info_master__text-about-light">Оценка</span>5.0</p>
                <p className="info_master__text-about--accent"><span className="info_master__text-about-light">заказов выполнено</span>40</p>
                <p className="info_master__text-about--accent"><span className="info_master__text-about-light">Заказов успешно сдано</span>100%</p>
                <p className="info_master__text-about--accent"><span className="info_master__text-about-light">2 повторных заказов</span>54%</p>

            </div>

            <div className="info_master_big flex_right_block">
                
                <div className="contact__swiper" >
                    <Swiper
                        slidesPerView={4}
                        spaceBetween={30}
                        navigation={true}
                        modules={[Navigation]}
                        className="info_master_big_swiper"
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

                        {test_price.map((obj, index) =>
                            <SwiperSlide key={index} className="">
                                <div
                                    onClick={() => openModal('/img/sentence_img/iphone-x.png')}
                                    className="info_master_big__slide"></div>
                            </SwiperSlide>
                        )}
                    </Swiper>
                </div>
            </div>

                {master.username && (
                    <React.Fragment>
                        <h1 className="info__service">Информация о мастере</h1>
                        <div className="content__info">
                            <div className="oeeqwhfpihaepPUihf">
                                <section className="page_qrwewq9DXP79fg1">
                                    <div>
                                        <div className="cardfdsfsda font">
                                            <div className="card_iphone df">
                                                <div className="card_iphone-img">
                                                    <img
                                                        src={SERVER_PATH + master.avatar}
                                                        alt=""
                                                        style={{
                                                            width: "100px",
                                                            height: "100px",
                                                            borderRadius: "50px",
                                                            objectFit: "cover"
                                                        }}
                                                    />
                                                </div>
                                                <div className="big_card-phon_text">
                                                    <div className="card_iphone-text">
                                                        <h2>
                                                            {master.name} {master.lastname}
                                                        </h2>

                                                        <h3>
                                                            {master.business_model}
                                                        </h3>
                                                    </div>
                                                    <div className="card_iphone-img_2">
                                                        <Rating
                                                            initialValue={master.rating}
                                                            allowFraction
                                                            readonly
                                                            size="28"
                                                        />
                                                    </div>
                                                    <div className="card_iphone-text_3">
                                                        <Link to={"/client/feedback/" + master.username}>
                                                            {master.number_of_feedbacks} отзывов
                                                        </Link>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="organization_names">
                                                <div className="organization_text">
                                                    <h2>
                                                        {master.address}
                                                    </h2>
                                                </div>
                                            </div>
                                            <div className="infrormation">
                                                <div className="big_infoo df">
                                                    <div className="information_text df">
                                                        <div className="infoo_text">
                                                            <h2>На сайте:</h2>
                                                            <h2>Статус:</h2>
                                                            <h2>Оценка:</h2>
                                                        </div>

                                                        <div className="infoo_text-2">
                                                            <h2>с 2023 года</h2>
                                                            <h3>Оффлайн</h3>
                                                            <h3>{master.rating}</h3>
                                                        </div>
                                                    </div>
                                                    <div className="infoo_button">
                                                        <div className="but">
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </section>
                            </div>
                            <div className="asfdsafdspouhfewo ">
                                <div className="center__all__asfsiahg">
                                    <div className="swiper-button image-swiper-button-next">
                                        <img className="image-swiper-button-next" src="../img/sliderright.png" alt="asdfdsa" />
                                    </div>
                                    <div className="swiper-button image-swiper-button-prev">
                                        <img src="../img/sliderleft.png" alt="sdfdsa" />
                                    </div>
                                    <Swiper
                                        pagination={true}
                                        navigation={{
                                            nextEl: ".contact__image-swiper-button-next",
                                            prevEl: ".contact__image-swiper-button-prev",
                                        }}
                                        modules={[Pagination, Navigation]}
                                        className="mySwipetr qrpeqw9grfuilbdsjn"
                                        slidesPerView="auto"
                                    >
                                        {master.pictures.map((v) => (
                                            <SwiperSlide key={v} className="swiper-slidetr asfpwruwegiahbdfls sliderr">
                                                <img
                                                    className="contact-master__picture"
                                                    src={SERVER_PATH + v}
                                                    alt=""
                                                    onClick={() => setPicture(SERVER_PATH + v)}
                                                />
                                                <button
                                                    className="contact-master__open-button"
                                                    onClick={() => setPicture(SERVER_PATH + v)}
                                                >
                                                    Открыть картинку
                                                </button>
                                            </SwiperSlide>
                                        ))}
                                    </Swiper>
                                    <Popup
                                        open={picture !== ""}
                                        onClose={() => setPicture("")}
                                        className="contact-master__modal"
                                    >
                                        <img src={picture} className="contact-master-modal__picture" alt="absent" />
                                    </Popup>
                                </div>
                            </div>
                        </div>
                    </React.Fragment>
                )}
            </div>
            {/* Модальное окно с слайдером */}
            {isModalOpen && (
                <div className="modal" onClick={closeModal}>
                    <div className="modalContent" onClick={(e) => e.stopPropagation()}>
                        <button className="closeBtn" onClick={closeModal}>
                            &times;
                        </button>
                        <Swiper
                            navigation={true}
                            modules={[Navigation]}
                            className="modalSwiper"
                        >
                            {test_price.map((obj, index) =>
                                <SwiperSlide key={index} className="sliderr">
                                    <div className="info_master_big__slide info_master_big__slide-block"></div>
                                </SwiperSlide>
                            )}
                        </Swiper>
                    </div>
                </div>
            )}

            {/* Добавим стили для модального окна */}
            <style jsx>{`
.info_master_big__slide-block {
    width: 80%;
    height: 100%;
}
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
                    top: 0px;
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
                .sliderr {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }
            `}</style>

        </main>
    )
}


export default App;
