import React from 'react';
import {Link} from "react-router-dom";
import HeroSectionSwiper from "./components/HeroSectionSwiper/HeroSectionSwiper";
import HeroSectionCounters from "./components/HeroSectionCounters/HeroSectionCounters";
import HeroSectionSearchBar from "./components/HeroSectionSearchBar/HeroSectionSearchBar";
import styles from './HeroSection.module.scss';
import { useLanguage } from '../../../context/LanguageContext';

interface Props {
  title?: string;
}

const HeroSection: React.FC<Props> = ({title}) => {
  const { t } = useLanguage();

  return (
    <div className={styles.heroSection}>
      <div className={`${styles.heroSection_block} appContainer`}>
        <div className={styles.heroSection_block_content}>
          <h1 className={styles.heroSection_block_content_title}>
          {title ? title : t("Business platform for repairing Apple and other digital devices")}
    
          </h1>
          {/*Вынесла в отдельный компонент, что бы сократить код*/}
          <HeroSectionSearchBar/>
          <h4 className={styles.heroSection_block_content_subtitle}>{t("Original spare parts")}</h4>
          <h4 className={styles.heroSection_block_content_subtitle}>{t("Reasonable prices")}</h4>
          <h4 className={styles.heroSection_block_content_subtitle}>{t("Departure")}</h4>
          {/*Вынесла в отдельный компонет счетчики, что бы сократить код*/}
          <HeroSectionCounters />
          <Link
            to="/register"
            className={styles.heroSection_block_content_button}
          >
           {t("Become a member")}
          </Link>
        </div>
        <div className={styles.heroSection_block_swiper}>
          {/*Вынесла в отдельный компонет swiper, что бы сократить код*/}
          <HeroSectionSwiper/>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;