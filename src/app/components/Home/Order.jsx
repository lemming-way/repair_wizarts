//~ import { useService } from "../../hooks/useService";

import { Link } from "react-router-dom"
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper";

import '../../scss/swiper.css'
import "swiper/css";
import "swiper/css/navigation";
import { Rating } from "react-simple-star-rating";

//~ import { getReviews } from "../../services/reviews.service";

// todo: Компонент называется Order, но показывает отзывы - нужно исправить
function Order() {
    //~ const reviews = useService(getReviews, [])
    // todo: Заглушка. Нужно добавить получение реальных отзывов с сервера
    const reviews = {data: [
        {
            id: 1234,
            sender: "Иван Иванович",
            rating: 5,
            message: "Здесь будет отзыв"
        },
        {
            id: 8764,
            sender: "Яков Петрович",
            rating: 4,
            message: "Зашёл проверить — всё грузится. Думаю, ну где подвох? А подвоха нет. Даже странно. Работает как часы. Вернусь, когда бэкенд допилят — тогда и поворчу, если что. Но пока — твёрдая пятёрка."
        }
    ]};

    return (
        <section className="order">
            <div className="container ircontainer">
                <h1>Отзывы</h1>
                <div className="order__card__list">
                    {reviews.error ? (
                        <div style={{ textAlign: "center", width: "100%" }}>
                            Произошла ошибка при загрузке отзывов
                        </div>
                    ) : (
                        <Swiper
                            slidesPerView={4}
                            spaceBetween={30}
                            navigation={true}
                            modules={[Navigation]}
                            className="mySwiper"
                            breakpoints={{
                                0: {
                                    slidesPerView: 1
                                },
                                775: {
                                    slidesPerView: 2
                                },
                                1099: {
                                    slidesPerView: 3
                                },
                                1585: {
                                    slidesPerView: 4
                                },
                            }}
                        >
                            {reviews.data.map((v) => (
                                <SwiperSlide className="swiper-slier order__card" key={v.id}>
                                    <div className="order__card">
                                        <div className="order__card__content">
                                            <img style={{width: '103px'}} src="/img/profile__image.png" alt="" />
                                            <div className="order__card__title">
                                                <h3>{v.sender}</h3>
                                                <div className="mark__stars">
                                                    <Rating
                                                        initialValue={v.rating}
                                                        size="24"
                                                        readonly
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <p>{v.message}</p>
                                    </div>
                                </SwiperSlide>
                            ))}
                        </Swiper>
                    )}
                </div>
                <Link to="/reviews">Все отзывы</Link>
            </div>
        </section>
    )
}


export default Order;
