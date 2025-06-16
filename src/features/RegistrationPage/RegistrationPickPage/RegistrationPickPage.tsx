import React, {useEffect} from 'react';
import registrationDefaultUserImg from '../../../img/users/registrationPick/registration-user.svg';
import registrationDefaultMasterImg from '../../../img/users/registrationPick/registration-master.svg';
import RegistrationPickCard from "./components/RegistrationPickCard/RegistrationPickCard";
import RegistrationPickSwiper from "./components/RegistrationPickSwiper/RegistrationPickSwiper";
import styles from './RegistrationPickPage.module.scss';
import { useLanguage } from '../../../context/LanguageContext';  // импортируем контекст перевода

const RegistrationPickPage = () => {
  const { t } = useLanguage(); // получаем функцию t для перевода

  useEffect(() => {
    document.title = t('Registration selection');
  }, []);

  return (
    <div className={`${styles.registrationPickPage} appContainer`}>
      <h1 className={styles.registrationPickPage_title}>{t('Registration selection')}</h1>
      <div className={styles.registrationPickPage_block}>
        {/*Вынесла в отдельный компонет т.к. будет переиспользован в свайпере*/}
        {/*Скачала дефолтные картинки в формате и svg*/}
        <RegistrationPickCard
          link="/register/client"
          img={registrationDefaultUserImg}
          title={t("User registration")}
          subtitle={t("Registration type for users (clients only)")}
        />
        <RegistrationPickCard
          link="/register/master"
          img={registrationDefaultMasterImg}
          title={t("Service and master registration")}
        />
      </div>

      <div className={styles.registrationPickPage_swiper}>
        {/*Вынесла в отдельный компонет что бы разделить логику и для сокращения кода и улучшения читаемости кода*/}
        <RegistrationPickSwiper />
      </div>
    </div>
  );
};

export default RegistrationPickPage;