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

const WhyChooseUsBlockSwiper = () => {
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
            title="Выезд"
            text="
            Время - деньги. Заказав переклейку или ремонт iphone у нас
            Вы можете сэкономить 3-4 часа времени. Мастер приедет
            и произведет ремонт у вас дома или в офисе или заберет
            у вас телефон, потом доставит отремонтированный.
          "
          />
        </SwiperSlide>
        <SwiperSlide className="whyChooseUsBlockSwiperSlider_item">
          <WhyChooseUsBlockCard
            img={qualityImage}
            title="Качество"
            text="
            Наши мастера имеют 10+ лет опыта работы в области переклейки
            и ремонта Iphone. Работая с нами, Вы можете быть совершенно уверены в том, что ваш
            телефон в надежных и опытных руках.
          "
          />
        </SwiperSlide>
        <SwiperSlide className="whyChooseUsBlockSwiperSlider_item">
          <WhyChooseUsBlockCard
            img={priceImage}
            title="Цены"
            text="
            Наши цены ниже среднерыночных, несмотря на то, что качество работы яна самом высшем
            уровне. Несмотря на то, что мы используем только оригинальные зап. части. Мы любим
            свою работу, работаем много и это позволяет предлагать лучшие
            на рынке условия.
          "
          />
        </SwiperSlide>
        <SwiperSlide className="whyChooseUsBlockSwiperSlider_item">
          <WhyChooseUsBlockCard
            img={clockImage}
            title="Сроки работы"
            text="
            Мы пунктуальны и ответственны. Называем срок работы с запасом
            и выполняем работу почти всегда раньше обещанного срока,
            а ровно в срок сдаем тогда, когда происходят непредвиденные обстоятельства.
          "
          />
        </SwiperSlide>
      </Swiper>
  );
};

export default WhyChooseUsBlockSwiper;