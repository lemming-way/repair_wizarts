import React from 'react';
import {Swiper, SwiperSlide} from "swiper/react";
import {Navigation, Pagination} from "swiper";
import "swiper/css/navigation";
import 'swiper/css/pagination';
import "swiper/css";
import heroSectionImg from '../../../../../img/home/heroSection/hero-image.svg'
// import SERVER_PATH from "../../../../../constants/SERVER_PATH";
// import {useService} from "../../../../../hooks/useService";
// import {getCovers} from "../../../../../services/index.service";
import './HeroSectionSwiper.scss';

const HeroSectionSwiper = () => {
  // const covers = useService(getCovers, []);

  return (
      <Swiper
        navigation={true}
        modules={[Navigation, Pagination]}
        pagination={true}
        className="mySwiperHome heroSectionSwiper"
        style={{
          "--swiper-navigation-size": "20px",
        } as any}
      >
        {/*На данный момент сервер не работает, поэтому закомментировала данные из сервера*/}

        {/*{covers.data.map((v) => (*/}
        {/*  <SwiperSlide className={styles.heroSectionSwiper_slide} key={v.id}>*/}
        {/*    <img*/}
        {/*      className={styles.heroSectionSwiper_slide_img}*/}
        {/*      src={SERVER_PATH + v.image}*/}
        {/*      alt=""*/}
        {/*    />*/}
        {/*  </SwiperSlide>*/}
        {/*))}*/}

        {/*Когда появится доступ к серверу верхнюю закомментированную часть нужно раскомментировать, */}
        {/*а нижний код закомментировать или удалить*/}

        <SwiperSlide className="heroSectionSwiper_slide">
          <img className="heroSectionSwiper_slide_img" src={heroSectionImg} alt="" />
        </SwiperSlide>
        <SwiperSlide className="heroSectionSwiper_slide">
          <img className="heroSectionSwiper_slide_img" src={heroSectionImg} alt="" />
        </SwiperSlide>
        <SwiperSlide className="heroSectionSwiper_slide">
          <img className="heroSectionSwiper_slide_img" src={heroSectionImg} alt="" />
        </SwiperSlide>
      </Swiper>
  );
};

export default HeroSectionSwiper;