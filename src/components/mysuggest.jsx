import { useEffect, useMemo } from "react";
import { getOffers } from "../services/offer.service";
import styles from "./mysuggest.module.css"
import '../scss/mysuggest.css'
import { Link, useParams } from 'react-router-dom'
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import { Navigation, Pagination } from "swiper";
import { useSelector } from "react-redux";
import { selectUser } from "../slices/user.slice";
import Suggest from "./suggest";
import { useService } from "../hooks/useService";
import { getClientRequests } from "../services/request.service";
import SERVER_PATH from "../constants/SERVER_PATH";


function MySuggest() {
    const { id } = useParams()
    const requests = useService(getClientRequests, [])
    const offers = useService(getOffers.bind(null, id), [])
    const user = useSelector(selectUser)
    const req = useMemo(() =>
        requests.data.find((v) => v.id === Number(id)), [requests.data, id])

    const getDate = (exp) => {
        const d = new Date(Date.parse(exp) - Date.now())
        return `${d.getUTCHours()} ч., ${d.getUTCMinutes()} мин.`
    }

    useEffect(() => {
        document.title = 'Мои предложения';
    }, [id]);

    return (
        <section className={`page_6 ${styles.main_block}`}>
            <div className="sentence font_inter mobile-sentence">
                <div className="sentence_text align">
                    <div className="sentence_text-1 mobile-sentence_text-1">
                        <h2 className={styles.heading}>Мои предложения</h2>
                    </div>
                    <div className="sentence_but">
                        <Link to="/client/requests"><button>Назад</button></Link>
                    </div>
                </div>
            </div>
            



                {/* верстка */}

                <div className={styles.block_order}>
                    <div className={styles.left}>
                        <div className={styles.left_row}>
                            <img
                                src="/img/profil_img/2.png"
                                width="120px"
                                height="120px"
                                style={{ borderRadius: "60px", objectFit: "cover" }}
                                alt=""
                            />
                            <div className={styles.block_info}>
                                <h2>Имя и фамилия с заявки инфа</h2>
                                <h3>Размещено 10 проектов</h3>
                                <h3>Нанято 100 %</h3>
                            </div>
                        </div>
                        <div className={styles.description}>
                            <p>Название устройства инфа со страници н1</p>
                            <p>клиент описывает свою проблему, страница н1</p>
                        </div>
                        <div className={styles.left_row_bottom}>
                            <p>Осталось 70 часа 45 минут </p>
                            <p className={styles.view}><img src="/img/icons/eye.png" alt="" />20 просмотрено</p>
                        </div>
                    </div>
                    <div className={styles.right}>
                        <p>Желаемый бюджет <span className={styles.price}>1000 ₽</span></p>

                        <div className={styles.swiper}>
                        <Swiper
                            slidesPerView={4}
                            spaceBetween={30}
                            navigation={true}
                            className="myMiniSwiper"
                            modules={[Navigation]}
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

                            {[1,2,3].map((_, index) =>
                                <SwiperSlide key={index}>
                                    <div className={styles.miniSlider}>
                                        <img src="/img/sentence_img/iphone-x.png" alt="" />
                                    </div>
                                </SwiperSlide>
                            )}
                        </Swiper>
                        </div>
                        
                        {/* <Swiper pagination={true} navigation={{
                                nextEl: ".image-swiper-button-next",
                                prevEl: ".image-swiper-button-prev",
                            }} modules={[Navigation, Pagination]} 
                            slidesPerView="auto" 
                            className={styles.swiper}>
                                <div className="swiper-button image-swiper-button-next">
                                    <img className="image-swiper-button-next" src="/img/sliderright.png" alt="asdfdsa" />
                                </div>
                                <div className="swiper-button image-swiper-button-prev">
                                    <img src="/img/sliderleft.png" alt="sdfdsa" />
                                </div>
                                {[1,2,3].map((v, i) => (
                                    <SwiperSlide  key={i}>
                                        <img src="/img/sentence_img/iphone-x.png" alt="" className="vpupi" />
                                    </SwiperSlide>
                                ))}
                            </Swiper> */}
                            <div className={styles.order_row}>
                                <div className={styles.order_button}>Сбор предложений</div>
                                <div>
                                    <img src="/img/pause.png" alt="" />
                                </div>
                                <div>
                                    <img src="/img/pencil.png" alt="" />
                                </div>
                                <div>
                                    <img src="/img/basket.png" alt="" />
                                </div>
                            </div>
                    </div>
                </div>

               



                {/* связан с бэком */}
                <div className="big_id-block align mobile-big_id-block">
                    <div className="id_block df align">
                        <div className="bloc-1 df">
                            <div className="bloc_img">
                                <img
                                    src={SERVER_PATH + user.avatar}
                                    width="120px"
                                    height="120px"
                                    style={{ borderRadius: "60px", objectFit: "cover" }}
                                    alt=""
                                />
                            </div>
                            <div className="bloc_text">
                                <h2>{user.name} {user.lastname}</h2>
                                <h3>{user.phone}</h3>
                            </div>
                        </div>
                        <div className="bloc-2 df align mobile-bloc-2">
                            <Swiper pagination={true} navigation={{
                                nextEl: ".image-swiper-button-next",
                                prevEl: ".image-swiper-button-prev",
                            }} modules={[Navigation, Pagination]} slidesPerView="auto" className="mySwipetr mobile-mySwipetr">
                                <div className="swiper-button image-swiper-button-next">
                                    <img className="image-swiper-button-next" src="/img/sliderright.png" alt="asdfdsa" />
                                </div>
                                <div className="swiper-button image-swiper-button-prev">
                                    <img src="/img/sliderleft.png" alt="sdfdsa" />
                                </div>
                                {req?.pictures.map((v, i) => (
                                    <SwiperSlide className="swiper-slidetr sliderr pew97rtewug" key={i}>
                                        <img src={SERVER_PATH + v} alt="" className="vpupi" />
                                    </SwiperSlide>
                                ))}
                            </Swiper>
                        </div>
                    </div>
                    <div className="tit df align mobile-tit">
                        <div className="title font_robo df">
                            <div className="title_text">
                                <h2>{req?.title}</h2>
                                <h3>{req?.description}</h3>
                            </div>
                            <div className="title_text-2">
                                <h2>
                                    {req?.client_price}₽
                                </h2>
                            </div>
                        </div>
                    </div>

                    <div className="day font_robo df align">
                        <div className="day_text-1 mobile-day_text-1">
                            <h2>Осталось {getDate(req?.expires_at)}</h2>
                        </div>

                        <div className="day_text-2 df align-center">
                            <p style={{marginLeft: '10px'}}>Предложений: {req?.number_of_offers}</p>
                        </div>

                        <div style={{flex:1}}></div>
                        <div className={styles.order_row}>
                            <div className={styles.order_button}>Сбор предложений</div>
                            <div>
                                <img src="/img/pause.png" alt="" />
                            </div>
                            <div>
                                <img src="/img/pencil.png" alt="" />
                            </div>
                            <div>
                                <img src="/img/basket.png" alt="" />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="sentence-2 font_abel">
                    <div className="sentaince_text mobile-sentaince_text">
                        {offers.data.length > 0 && (
                            <h2>Предложения мастеров</h2>
                        )}
                    </div>
                </div>
                {offers.data.map((v) => (
                    <Suggest key={v.id} {...v} />
                ))}
   
            
        </section>
    )
}


export default MySuggest;