import {Swiper, SwiperSlide} from "swiper/react";
import { Link } from "react-router-dom";
import { useService } from "../../hooks/useService";
import defaultImage from "../../img/article.png"
import formatDate from "../../utilities/formatDate";
import likeImage from "../../img/like.png"
import viewImage from "../../img/view.png"

import {Navigation} from "swiper";
import '../../scss/swiper.css'
import "swiper/css";
import "swiper/css/navigation";
import { getArticles } from '../../services/article.service';
import SERVER_PATH from "../../constants/SERVER_PATH";


function Articles(){
    const articles = useService(getArticles, [])

    const filterText = (v) => v.replace(/<[^>]*>/g, '');

    const getImage = (path) =>
        path ? SERVER_PATH + path : defaultImage

    return (
        <section className="blog">
            <div className="container ircontainer">
                <h1>Статьи</h1>
                <div className="blog__card__list">
                    <Swiper
                        slidesPerView={4}
                        spaceBetween={30}
                        navigation={true}
                        modules={[Navigation]}
                        className="mySwiper"
                        breakpoints={{
                            0: {
                                slidesPerView: 2
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
                        {articles.data.map((v) => (
                            <SwiperSlide className="swiper-slier" key={v.id}>
                                <Link to={"/articles/" + v.id}>
                                    <div className="blog__card">
                                        <img
                                            className="blog-card__picture"
                                            src={getImage(v.cover_image)}
                                            alt=""
                                        />
                                        <div className="blog__card__content">
                                            <h4 className="blog-card__title">{v.title}</h4>
                                            <p className="blog-card__description">{filterText(v.text)}</p>
                                            <span className="blog-card__date">{formatDate(v.created_at)}</span>
                                            <div className="blog-card-stats">
                                                <div className="blog-card-stats__item">
                                                    <img
                                                        src={likeImage}
                                                        className="blog-card-stats__picture"
                                                    />
                                                    <span className="blog-card-stats__count">{v.likes}</span>
                                                </div>
                                                <div className="blog-card-stats__item">
                                                    <img
                                                        src={viewImage}
                                                        className="blog-card-stats__picture blog-card-stats__view-picture"
                                                    />
                                                    <span className="blog-card-stats__count">{v.views}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </div>
            </div>
        </section>
    )
}


export default Articles;