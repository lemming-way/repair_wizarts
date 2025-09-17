import {useEffect} from 'react';
import '../scss/swiper.css'
import { useService } from '../hooks/useService';
import "swiper/css";
import "swiper/css/navigation";

import HeroSection from '../features/HomePage/HeroSection/HeroSection';
import WhyChooseUsBlock from "../features/HomePage/WhyChooseUsBlock/WhyChooseUsBlock"

import Order from "./Home/Order";
import Articles from "./Home/Articles";
import {
    getCounters,
    getCovers
} from '../services/index.service';
import SERVER_PATH from '../constants/SERVER_PATH';

function App() {
    const counters = useService(getCounters, {})
    const covers = useService(getCovers, [])

    useEffect(() => {
        document.title = 'Главная';
    }, []);

    return (
        <main>
            <HeroSection />
            {/* это старая главная секция */}
            {/* <section className="slider">
                <div className="container">
                    <div className="slider__content">
                        <h2>
                            test
                            Бизнес площадка по ремонту цифровой техники Apple
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
            <WhyChooseUsBlock/>

            {/* <Depature /> */}
            <Order />
            <Articles />
        </main>
    );
}

export default App;
