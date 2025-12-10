import { Link } from "react-router-dom";
import React, {useEffect} from 'react';

import styles from './RegistrationPickPage.module.scss';
import { useLanguage } from '../../../state/language';
import registrationDefaultContractorImg from '../../../img/users/registrationPick/registration-contractor.svg';
import registrationDefaultUserImg from '../../../img/users/registrationPick/registration-user.svg';

const RegistrationPickPage = () => {
  const text = useLanguage();

  useEffect(() => {
    document.title = text('Registration selection');
  }, [text]);

  return (
    <div className={`${styles.registrationPickPage} appContainer`}>
      <h1 className={styles.registrationPickPage_title}>{text('Registration selection')}</h1>
      <div className={styles.registrationPickPage_block}>
        <Link to="/register/client" className={styles.registrationPickCard}>
          <img style={{width: "134px", height: "113px"}} src={registrationDefaultUserImg} alt="" />
          <p>{text("User registration")}</p>
          <p>{text("Registration type for users (clients only)")}</p>
        </Link>
        <Link to="/register/contractor" className={styles.registrationPickCard}>
          <img style={{width: "134px", height: "113px"}} src={registrationDefaultContractorImg} alt="" />
          <p>{text("Service and contractor registration")}</p>
        </Link>
      </div>
    </div>
  );
};

export default RegistrationPickPage;
