//~ import { useService } from "../../hooks/useService";

import { Link } from "react-router-dom"
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper";

import '../../styles/legacy/swiper.css'
import "swiper/css";
import "swiper/css/navigation";
import { Rating } from "react-simple-star-rating";
import styles from '../../styles/home/HomeSections.module.scss';

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
        },
        {
            id: 8765,
            sender: "Елена Смирнова",
            rating: 5,
            message: "Быстро нашла подходящего исполнителя. Всё сделали аккуратно, в согласованный срок и без дополнительных расходов."
        },
        {
            id: 8766,
            sender: "Алексей Волков",
            rating: 5,
            message: "Удобная площадка и понятное оформление заказа. Исполнитель быстро ответил и качественно выполнил работу."
        }
    ]};

    return (
        <section className={`order ${styles.section} ${styles.reviewsSection}`}>
            <div className="container ircontainer">
                <h1 className={styles.title}>Отзывы</h1>
                <div className="order__card__list">
                    {reviews.error ? (
                        <div style={{ textAlign: "center", width: "100%" }}>
                            Произошла ошибка при загрузке отзывов
                        </div>
                    ) : (
                        <Swiper
                            slidesPerView={3}
                            spaceBetween={30}
                            navigation={true}
                            modules={[Navigation]}
                            className={`mySwiper ${styles.slider} ${styles.reviewSlider}`}
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
                            }}
                        >
                            {reviews.data.map((v) => (
                                <SwiperSlide className="swiper-slier" key={v.id}>
                                    <div className={`order__card ${styles.reviewCard}`}>
                                        <div className="order__card__content">
                                            <img className={styles.avatar} src="/img/user_avatar.png" alt="" />
                                            <div className="order__card__title">
                                                <h3 className={styles.reviewName}>{v.sender}</h3>
                                                <div className="mark__stars">
                                                    <Rating
                                                        initialValue={v.rating}
                                                        size="24"
                                                        readonly
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <p className={styles.reviewText}>{v.message}</p>
                                    </div>
                                </SwiperSlide>
                            ))}
                        </Swiper>
                    )}
                </div>
                <div className={styles.footer}>
                    <Link className={styles.allButton} to="/reviews">Все отзывы</Link>
                </div>
            </div>
        </section>
    )
}


export default Order;
