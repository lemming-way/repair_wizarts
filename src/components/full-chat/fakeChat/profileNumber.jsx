import React, {useEffect} from "react";
import '../scss/profileNumber.css'
import Sidebar from "../sidebar";
import '../scss/swiper.css'
import { Swiper, SwiperSlide } from "swiper/react";
import Popup from 'reactjs-popup';
import { Navigation } from "swiper";
import { Pagination } from "swiper";
import { Link } from "react-router-dom";


function App() {

    useEffect(() => {
        document.title = 'Чат';
    }, []);

    return (
        <div className='main nal df'>
            <div className="block-info-5">

                <div className="block-info-content-5 df">
                    <h1 className="roboto">Номер профиля</h1>
                    <Link className="roboto"  to="/review">
                        Запросить отзыв
                    </Link>

                </div>

                <div className="content-box">
                    <div className="star-small-content df">
                        <h3 className="inter">4,6</h3>
                        <img src="img/img-star.png" alt="Star" />
                        <img src="img/img-star.png" alt="Star" />
                        <img src="img/img-star.png" alt="Star" />
                        <img src="img/img-star.png" alt="Star" />
                        <img src="img/img-star.png" alt="Star" />

                    </div>

                    <div className="h4">
                        <h4 className="inter">На основании 11 оценок</h4>
                    </div>

                    <div className="main-line">
                        <div className="line-content df">
                            <div className="img-line">
                                <img src="./img/img-small-star.png" alt="Star" />
                                <img src="./img/img-small-star.png" alt="Star" />
                                <img src="./img/img-small-star.png" alt="Star" />
                                <img src="./img/img-small-star.png" alt="Star" />
                                <img src="./img/img-small-star.png" alt="Star" />
                            </div>

                            <div className="big-line">
                                <div className="small-line"></div>
                            </div>

                            <div>
                                <p className="inter">10</p>
                            </div>
                        </div>

                        <div className="line-content df">
                            <div className="img-line">
                                <img src="./img/img-small-star.png" alt="Star" />
                                <img src="./img/img-small-star.png" alt="Star" />
                                <img src="./img/img-small-star.png" alt="Star" />
                                <img src="./img/img-small-star.png" alt="Star" />
                                <img src="./img/img-small-star-white.png" alt="Star" />
                            </div>

                            <div className="big-line">
                            </div>

                            <div>
                                <p className="inter">0</p>
                            </div>
                        </div>

                        <div className="line-content df">
                            <div className="img-line">
                                <img src="./img/img-small-star.png" alt="Star" />
                                <img src="./img/img-small-star.png" alt="Star" />
                                <img src="./img/img-small-star.png" alt="Star" />
                                <img src="./img/img-small-star-white.png" alt="Star" />
                                <img src="./img/img-small-star-white.png" alt="Star" />
                            </div>

                            <div className="big-line">
                            </div>

                            <div>
                                <p className="inter">0</p>
                            </div>
                        </div>

                        <div className="line-content df">
                            <div className="img-line">
                                <img src="./img/img-small-star.png" alt="Star" />
                                <img src="./img/img-small-star.png" alt="Star" />
                                <img src="./img/img-small-star-white.png" alt="Star" />
                                <img src="./img/img-small-star-white.png" alt="Star" />
                                <img src="./img/img-small-star-white.png" alt="Star" />
                            </div>

                            <div className="big-line">
                            </div>

                            <div>
                                <p className="inter">0</p>
                            </div>
                        </div>

                        <div className="line-content df">
                            <div className="img-line">
                                <img src="./img/img-small-star.png" alt="Star" />
                                <img src="./img/img-small-star-white.png" alt="Star" />
                                <img src="./img/img-small-star-white.png" alt="Star" />
                                <img src="./img/img-small-star-white.png" alt="Star" />
                                <img src="./img/img-small-star-white.png" alt="Star" />
                            </div>

                            <div className="big-line">
                                <div className="small-line-2"></div>
                            </div>

                            <div>
                                <p className="inter">1</p>
                            </div>
                        </div>
                    </div>

                    <div className="portifoly-photo">
                        <div className="portifoly-img df">
                            <img src="./img/img-kiril.png" alt="Kiril" />
                            <div>
                                <h2 className="inter">Кирилл Воронов</h2>
                                <p className="inter">26 августа</p>
                            </div>
                        </div>

                        <div className="star-portifoly df">
                            <img src="./img/img-small-star.png" alt="Star" />
                            <img src="./img/img-small-star.png" alt="Star" />
                            <img src="./img/img-small-star.png" alt="Star" />
                            <img src="./img/img-small-star.png" alt="Star" />
                            <img src="./img/img-small-star.png" alt="Star" />

                            <h4 className="inter">Заказ выполнен на отлично.</h4>
                        </div>

                        <div className="slider-main-content df">
                            <div className="content-portifoly">
                                <h3 className="inter">Комментарий</h3>

                                <p className="inter">Donec non justo elit. Praesent nec auctor tellus. Donec quam orci, tincidunt nec diam
                                    at, mollis commodo libero. Nulla a ante aliquam augue mattis dapibus eget eu ipsum.
                                    Integer fringilla vitae orci at laoreet. Quisque a justo augue. Proin a facilisis
                                    ante. Cras at nibh ultricies magna aliquet rutrum eget in lectus. Nullam sed ornare
                                    arcu. Curabitur bibendum ultrices sapien, eget viverra velit lobortis vel. Vivamus
                                    eu auctor elit.</p>

                                <div>
                                    <Popup
                                        trigger={<button>Оставить ответ</button> }
                                        modal
                                        nested
                                    >
                                        {close => (
                                            <div className="modal-content modal-content-profile">
                                                <img  className="close" src="img/not-close.svg" onClick={close} alt="" />
                                                <span >
                                                    <img className="close"  src="not-close.svg" onClick={close} alt="" />
                                                </span>
                                                <h1 className="popupmodal__title">Ответ на отзыв</h1>
                                                <form>
                                                    <input className="form__textarea" placeholder="В ответе не должно быть оскорбления или мата " type="text" />
                                                    <button className="done form__done" type='button'>Отправить</button>
                                                </form>
                                            </div>
                                        )}
                                    </Popup>
                                    
                                </div>

                            </div>
                            <div className="swiper mySwiper">
                                <div className="swiper-wrapper">
                                    {/*<div className="img__2 swiper-slide">*/}
                                    {/*    <img src="./img/img-iPhone.png" alt=""/>*/}
                                    {/*</div>*/}

                                    <Swiper pagination={true} navigation={true} modules={[Navigation, Pagination]} className="mySwipetr">
                                        <SwiperSlide className="swiper-slidetr sliderr"><img src="./img/img-iPhone.png" alt="" /></SwiperSlide>
                                        <SwiperSlide className="swiper-slidetr sliderr"><img src="./img/img-iPhone.png" alt="" /></SwiperSlide>
                                    </Swiper>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    )
}


export default App;
