import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import {Navigation } from "swiper";
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import WhyChooseUsBlockCard from "../WhyChooseUsBlockCard/WhyChooseUsBlockCard";
import mastersImage from '../../../../../img/home/whyChooseUsBlock/masters.svg';
import qualityImage from '../../../../../img/home/whyChooseUsBlock/quality.svg';
import priceImage from '../../../../../img/home/whyChooseUsBlock/price.svg';
import clockImage from "../../../../../img/home/whyChooseUsBlock/clock.svg";
import './WhyChooseUsBlockSwiper.scss';
import { useLanguage } from '../../../../../context/LanguageContext';

const WhyChooseUsBlockSwiper = () => {
  const { t } = useLanguage();

  return (
      <Swiper
        pagination={{
          type: 'fraction',
        }}
        navigation={true}
        modules={[Navigation]}
        className="mySwiper whyChooseUsBlockSwiperSlider"
        style={{
          "--swiper-navigation-size": "20px",
          paddingBottom: "80px"
        } as any}
      >
        <SwiperSlide className="whyChooseUsBlockSwiperSlider_item">
          <WhyChooseUsBlockCard
            img={mastersImage}
            title={t("On-site service")}
            text={t("Time is money. By ordering screen replacement or iPhone repair from us, you can save 3-4 hours. The technician will come to your home or office, repair the device on site, or take it and return it after repair.")}
          />
        </SwiperSlide>
        <SwiperSlide className="whyChooseUsBlockSwiperSlider_item">
          <WhyChooseUsBlockCard
            img={qualityImage}
            title={t("Quality")}
            text={t("Our technicians have over 10 years of experience in iPhone repair and screen replacement. With us, you can be sure that your phone is in reliable and experienced hands.")}
          />
        </SwiperSlide>
        <SwiperSlide className="whyChooseUsBlockSwiperSlider_item">
          <WhyChooseUsBlockCard
            img={priceImage}
            title={t("Prices")}
            text={t("Our prices are below average, even though the quality is top level. We use only original parts. We love what we do, work hard, and this allows us to offer the best conditions on the market.")}
          />
        </SwiperSlide>
        <SwiperSlide className="whyChooseUsBlockSwiperSlider_item">
          <WhyChooseUsBlockCard
            img={clockImage}
            title={t("Work deadlines")}
            text={t("We are punctual and responsible. We always overestimate the time and usually complete the work earlier. Only in unforeseen situations do we deliver exactly on time.")}
          />
        </SwiperSlide>
      </Swiper>
  );
};

export default WhyChooseUsBlockSwiper;