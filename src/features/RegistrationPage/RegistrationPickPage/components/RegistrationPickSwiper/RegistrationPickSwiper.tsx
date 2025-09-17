import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import {Navigation } from "swiper";
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import RegistrationPickCard from "../RegistrationPickCard/RegistrationPickCard";
import registrationDefaultUserImg from "../../../../../img/users/registrationPick/registration-user.svg";
import registrationDefaultMasterImg from "../../../../../img/users/registrationPick/registration-master.svg";
import './RegistrationPickSwiper.scss';

const RegistrationPickSwiper = () => {
  return (
    <Swiper
      pagination={{
        type: 'fraction',
      }}
      navigation={true}
      modules={[Navigation]}
      className="mySwiper pickSlider"
      style={{
        "--swiper-navigation-size": "20px",
      } as any}
    >
      <SwiperSlide className="pickSlider_item">
        <RegistrationPickCard
          link="/register/client"
          img={registrationDefaultUserImg}
          title="Регистрация пользователя"
          subtitle="Тип регистрации для пользователей (только клиентам)"
        />
      </SwiperSlide>

      <SwiperSlide className="pickSlider_item">
        <RegistrationPickCard
          link="/register/master"
          img={registrationDefaultMasterImg}
          title="Регистрация сервисов и мастеров"
        />
      </SwiperSlide>
    </Swiper>
  );
};

export default RegistrationPickSwiper;