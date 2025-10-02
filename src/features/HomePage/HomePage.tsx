import React, {useEffect} from 'react';

import HeroSection from "./HeroSection/HeroSection";
import WhyChooseUsBlock from "./WhyChooseUsBlock/WhyChooseUsBlock";
import Articles from "../../components/Home/Articles";
import Order from "../../components/Home/Order";
// import Loader from "../../components/Loader/Loader";
import { useLanguage } from '../../context/LanguageContext';

const HomePage = () => {
  // Добавила все что было в старом Home, если вдруг сломается

  // const counters = useService(getCounters, {})
  // const covers = useService(getCovers, [])
  const { t } = useLanguage();

  useEffect(() => {
    document.title = t("Home");
  }, [t]);


  return (
    <main>
      {/*Заменила Depature на WhyChooseUsBlock для оптимизации и ориентировки по стилям*/}
      {/*Заменила вверхний закомментированый блок на HeroSection */}
      {/*Удалила закомментированый блок */}

      {/*Добавила лоадер, что бы при загрузке страницы пользователь понимал, что идет загрузка*/}
      {/*<Loader />*/}
      <HeroSection/>
      <WhyChooseUsBlock/>
      <Order/>
      <Articles/>
    </main>
  );
};

export default HomePage;