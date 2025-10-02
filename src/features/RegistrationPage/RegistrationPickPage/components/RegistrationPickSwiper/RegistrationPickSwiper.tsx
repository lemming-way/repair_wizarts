import React from 'react';
import {Navigation } from "swiper";
import { Swiper, SwiperSlide } from 'swiper/react';

import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import { useLanguage } from '../../../../../state/language';
import registrationDefaultMasterImg from "../../../../../img/users/registrationPick/registration-master.svg";
import registrationDefaultUserImg from "../../../../../img/users/registrationPick/registration-user.svg";
import RegistrationPickCard from "../RegistrationPickCard/RegistrationPickCard";
import './RegistrationPickSwiper.scss';

const RegistrationPickSwiper = () => {
  const text = useLanguage(); // получаем функцию t

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
          title={text("User registration")}
          subtitle={text("Registration type for users (clients only)")}
        />
      </SwiperSlide>

      <SwiperSlide className="pickSlider_item">
        <RegistrationPickCard
          link="/register/master"
          img={registrationDefaultMasterImg}
          title={text("Service and master registration")}
        />
      </SwiperSlide>
    </Swiper>
  );
};

export default RegistrationPickSwiper;
