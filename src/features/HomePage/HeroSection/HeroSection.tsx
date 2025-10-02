import React from 'react';
import {Link} from "react-router-dom";

import HeroSectionCounters from "./components/HeroSectionCounters/HeroSectionCounters";
import HeroSectionSearchBar from "./components/HeroSectionSearchBar/HeroSectionSearchBar";
import HeroSectionSwiper from "./components/HeroSectionSwiper/HeroSectionSwiper";
import styles from './HeroSection.module.scss';
import { useLanguage } from '../../../state/language';

interface Props {
  title?: string;
}

const HeroSection: React.FC<Props> = ({title}) => {
  const text = useLanguage();

  return (
    <div className={styles.heroSection}>
      <div className={`${styles.heroSection_block} appContainer`}>
        <div className={styles.heroSection_block_content}>
          <h1 className={styles.heroSection_block_content_title}>
          {title ? title : text("Business platform for repairing Apple and other digital devices")}
    
          </h1>
          {/*Вынесла в отдельный компонент, что бы сократить код*/}
          <HeroSectionSearchBar/>
          <h4 className={styles.heroSection_block_content_subtitle}>{text("Original spare parts")}</h4>
          <h4 className={styles.heroSection_block_content_subtitle}>{text("Reasonable prices")}</h4>
          <h4 className={styles.heroSection_block_content_subtitle}>{text("Departure")}</h4>
          {/*Вынесла в отдельный компонет счетчики, что бы сократить код*/}
          <HeroSectionCounters />
          <Link
            to="/register"
            className={styles.heroSection_block_content_button}
          >
           {text("Become a member")}
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
