import WhyChooseUsBlockCard from "./components/WhyChooseUsBlockCard/WhyChooseUsBlockCard";
import styles from './WhyChooseUsBlock.module.scss';
import { useLanguage } from '../../../context/LanguageContext';
import clockImage from '../../../img/home/whyChooseUsBlock/clock.svg';
import mastersImage from '../../../img/home/whyChooseUsBlock/masters.svg';
import priceImage from '../../../img/home/whyChooseUsBlock/price.svg';
import qualityImage from '../../../img/home/whyChooseUsBlock/quality.svg';

// Создала директорию features в ней HomePage для главной старницы, что бы ориентироваться
// в features  мы создаем страницы и внутри блоки которые относятся к этой странице
// в компонеты мы создаем для переиспользуемые части кода

const WhyChooseUsBlock = () => {
  const { t } = useLanguage();

  // Добавила то, что было в удаленном файле Depature
  // useEffect(() => {
  //   Aos.init({
  //     duration : 1000
  //   });
  //   Aos.refresh();
  // }, []);

  return (
    <div className={`${styles.whyChooseUsBlock} ${styles.appContainer}`}>
      <h2 className={styles.whyChooseUsBlock_title}> {t("Why RepairWizards and not other master sites?")}
      </h2>
        <div className={styles.whyChooseUsBlock_cards}>
          {/*Вынесла в отдельный компонент что бы сократить код и переиспользовать карточки в свайпере мобильной версии*/}
          <WhyChooseUsBlockCard
            img={mastersImage}
            title={t("Top specialists")}
          text={t("Find reliable professionals by viewing their portfolios and reading the reviews posted in their profiles.")}
          />

          <WhyChooseUsBlockCard
            img={qualityImage}
            title={t("Quality")}
          text={t("Our craftsmen have over 10 years of experience in repair. You can be sure your device is in good hands.")}
   
          />

          <WhyChooseUsBlockCard
            img={priceImage}
            title={t("Prices")}
          text={t("Our prices are below average, even though the work quality is top-notch and only original spare parts are used.")}

          />

          <WhyChooseUsBlockCard
            img={clockImage}
            title={t("Work deadlines")}
          text={t("All masters are punctual and responsible. They overestimate the work time just in case but almost always finish earlier.")}

          />
        </div>
      {/*Вынесла свайпер в отдельный компонет что бы сократить код*/}
      {/* <div className={styles.whyChooseUsBlock_swiper}>
        <WhyChooseUsBlockSwiper/>
      </div> */}
    </div>
  );
};

export default WhyChooseUsBlock;