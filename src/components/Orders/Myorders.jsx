import { useState, useEffect } from "react";
import { getRequestById } from '../../services/request.service'
import '../../scss/orders.css'
import Sidebar from "../sidebar";
import '../../scss/OfferAService.css'
import '../../scss/swiper.css'
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import { Link, useParams } from "react-router-dom";
import { Navigation, Pagination } from "swiper";
import Popup from 'reactjs-popup';
import { useService } from "../../hooks/useService";
import SERVER_PATH from "../../constants/SERVER_PATH";



function App() {
    const { id } = useParams()
    const request = useService(getRequestById.bind(null, id), {})

    const [yesGo, isYesGo] = useState(false)

    return (
        <>

                <div className="huge-content">
                    <h1>Заказы</h1>

                    <div className="huge-fasfdsoiXC df df">
                        <div className="two-input">
                            <Link to='/master/requests'>
                                <div className="myorders">
                                    <p>Мои заказы</p>
                                </div>
                            </Link>
                            <Link to='/master/requests'>
                                <div className="myorders">
                                    <p>Все заказы </p>
                                </div>
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="info-about-personadsfsaddas df">


                    <div className="user-info">
                        <div className="img-user df">
                            <img
                                src={SERVER_PATH + request.data.client?.avatar}
                                alt=""
                                width="96px"
                                height="96px"
                                style={{ objectFit: "cover", borderRadius: "48px" }}
                            />
                            <div>
                                <h4>{request.data.client?.name}</h4>
                                <h4>{request.data.client?.phone.slice(0, 5) + "*****" + request.data.client?.phone.slice(10)}</h4>
                            </div>
                        </div>

                        <div className="small-content-user">
                            <h4>Бренд устройства: {request.data.service_type?.name}</h4>
                            <h2 style={{ marginTop: "10px" }}>{request.data.title}</h2>
                            <h5>{request.data.description}</h5>
                        </div>
                    </div>

                    <div className="slider-user">
                        <div className="slider-content df">
                            <div className="desired-price">
                                Желаемый бюджет:
                                <span className="desired-price__highlight">
                                    {request.data.client_price}₽
                                </span>
                            </div>
                            <Swiper pagination={true} navigation={{
                                nextEl: ".image-swiper-button-next",
                                prevEl: ".image-swiper-button-prev",
                            }} modules={[Navigation, Pagination]} slidesPerView="auto" className="mySwipetr mobile-mySwipetr image-swiper">
                                <div className="swiper-button image-swiper-button-next">
                                    <img className="image-swiper-button-next" src="/img/sliderright.png" alt="asdfdsa" />
                                </div>
                                <div className="swiper-button image-swiper-button-prev">
                                    <img src="/img/sliderleft.png" alt="sdfdsa" />

                                </div>
                                {request.data.pictures?.map((v, i) => (
                                    <SwiperSlide className="swiper-slidetr sliderr pew97rtewug" key={i}>
                                        <img src={SERVER_PATH + v} alt="" className="vpupi" />
                                    </SwiperSlide>
                                ))}
                            </Swiper>

                        </div>
                        <div>
                            <Link to={'/master/offers/create/' + id}>
                                <button>Предложить услугу</button>
                            </Link>
                        </div>
                    </div>
                </div>

        </>
    )
}


export default App;
