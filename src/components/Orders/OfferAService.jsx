import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { getRequestById } from '../../services/request.service'
import { createOffer } from "../../services/offer.service";
import { sendOfferCreate } from "../../services/notification.service";
import '../../scss/OfferAService.css'
import '../../scss/swiper.css'
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import { Link } from "react-router-dom";
import { Navigation, Pagination } from "swiper";
import { useService } from "../../hooks/useService";
import SERVER_PATH from "../../constants/SERVER_PATH";

function App() {
    const navigate = useNavigate()

    const { id } = useParams()
    const [error, setError] = useState("")
    const request = useService(getRequestById.bind(null, id), { })

    const [message, setMessage] = useState("")
    const [price, setPrice] = useState("")
    const [time, setTime] = useState("")

    const onSubmit = () => createOffer({
        message,
        price,
        time,
        request_id: id
    }).then((res) => {
        sendOfferCreate(request.data.client_id, +id)
        navigate('/master/requests')
    }).catch((err) => {
        if (typeof err.message === "string") {
            return setError(err.message)
        }

        return setError("Невозможно выполнить запрос")
    })

    return (
        <>

            <form onSubmit={(e) => e.preventDefault()}>
                <div>
                    <div className="two-content df">
                        <h1 className="roboto">Предложить услугу</h1>
                        <div>
                            <Link to="/master/requests"><button className="abel">Назад</button></Link>
                        </div>
                    </div>
                </div>
                <div className="info-about-person df">
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
                                <h4>{request.data.client?.name} {request.data.client?.lastname}</h4>
                                <h4>{request.data.client?.phone.slice(0, 5) + "*****" + request.data.client?.phone.slice(10)}</h4>
                            </div>
                        </div>
                        <div className="small-content-user">
                            <h4>{request.data.service_type?.name}</h4>
                            <h5>{request.data.description}</h5>
                            <div className="small-into-small df">
                                <p className="offer-small-text">
                                    Осталось {new Date(Date.parse(request.data.expires_at) - Date.parse(new Date())).getUTCHours()} ч. {new Date(Date.parse(request.data.expires_at) - new Date()).getUTCMinutes()} мин.
                                </p>
                                <p className="offer-small-text">Предложений: {request.data.number_of_offers}</p>
                            </div>
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
                            <div className="swiper mySwiper">
                                <div className="swiper-wrapper">
                                    <Swiper pagination={true} navigation={{
                                        nextEl: ".image-swiper-button-next",
                                        prevEl: ".image-swiper-button-prev",
                                    }} slidesPerView="auto" modules={[Navigation, Pagination]} className="mySwipetr">
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
                            </div>

                        </div>
                        <div>
                        </div>
                    </div>

                </div>

                <div className="area-content">
                    <h1>Предложить услугу</h1>
                    {error && (
                        <div className="auth-err">
                            {error}
                        </div>
                    )}
                    <div className="area df">
                        <img src="/img/img-chat.png" alt="massage" />&nbsp; &nbsp;
                        <textarea required className="offersertextares" name="text"
                            placeholder="Напишите как вы почините устройства клиента"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}></textarea>
                    </div>
                </div>

                <div className="option-content df">

                    <div className="first-option df">
                        <img src="/img/img-dollar.png" alt="Dollar" />
                        <h2>Стоимость</h2>
                    </div>

                    <div className="second-option">
                        <div className="input-option">
                            <input required type="text" value={price} onChange={(e) => setPrice(e.target.value)} />
                            <img src="/img/img-rubl.png" alt="" />&nbsp;

                        </div>
                    </div>

                    <div className="third-option">
                        <img src="/img/img-cloack.png" alt="" />
                        <select required id="time" value={time} onChange={(e) => setTime(e.target.value)}>
                            <option value="" className="color" disabled>Выберите</option>
                            <option value="0">Готов выехать</option>
                            <option value="1">1 часa</option>
                            <option value="2">2 часa</option>
                            <option value="3">3 часa</option>
                            <option value="4">4 часa</option>
                        </select>
                    </div>
                </div>
                <div className="offer-continue__wrapper">
                    <button className="offer-continue" onClick={onSubmit}>Продолжить</button>
                </div>
            </form>
        </>
    )
}


export default App;
