import WhyChooseUsBlockCard from "./components/WhyChooseUsBlockCard/WhyChooseUsBlockCard";
import WhyChooseUsBlockSwiper from "./components/WhyChooseUsBlockSwiper/WhyChooseUsBlockSwiper";
import mastersImage from '../../../img/home/whyChooseUsBlock/masters.svg';
import qualityImage from '../../../img/home/whyChooseUsBlock/quality.svg';
import priceImage from '../../../img/home/whyChooseUsBlock/price.svg';
import clockImage from '../../../img/home/whyChooseUsBlock/clock.svg';
import styles from './WhyChooseUsBlock.module.scss';

// Создала директорию features в ней HomePage для главной старницы, что бы ориентироваться
// в features  мы создаем страницы и внутри блоки которые относятся к этой странице
// в компонеты мы создаем для переиспользуемые части кода

const WhyChooseUsBlock = () => {

  // Добавила то, что было в удаленном файле Depature
  // useEffect(() => {
  //   Aos.init({
  //     duration : 1000
  //   });
  //   Aos.refresh();
  // }, []);

  return (
    <div className={`${styles.whyChooseUsBlock} ${styles.appContainer}`}>
      <h2 className={styles.whyChooseUsBlock_title}>Почему <span>Repair</span><span>Wizards</span>,
        а не другие сайты с мастерами?
      </h2>
        <div className={styles.whyChooseUsBlock_cards}>
          {/*Вынесла в отдельный компонент что бы сократить код и переиспользовать карточки в свайпере мобильной версии*/}
          <WhyChooseUsBlockCard
            img={mastersImage}
            title="Лучшие специалисты"
            text="
              Найдите надежных профессионалов, изучив их портфолио и ознакомившись с отзывами,
              размещенными в их профилях.
            "
          />

          <WhyChooseUsBlockCard
            img={qualityImage}
            title="Качество"
            text="
              Наши мастера имеют 10+ лет опыта работы в области ремонта.
              Вы можете быть совершенно уверены, что ваше устройство в надежных руках.
            "
          />

          <WhyChooseUsBlockCard
            img={priceImage}
            title="Цены"
            text="
              Наши цены ниже среднерыночных, несмотря на то, что качество работы
              на самом высшем уровне и используются только оригинальные зап. части.
            "
          />

          <WhyChooseUsBlockCard
            img={clockImage}
            title="Сроки работы"
            text="
              Все мастера пунктуальны и ответственны. Называют срок работы с запасом
              и выполняют работу почти всегда раньше обещанного срока.
           "
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