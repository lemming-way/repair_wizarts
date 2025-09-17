import React from 'react';
import {Link} from "react-router-dom";
import styles from './RegistrationPickCard.module.scss';

interface Props {
  link: string;
  img: string;
  title: string;
  subtitle?: string;
}

const RegistrationPickCard: React.FC<Props> = ({link, img, title, subtitle}) => {
  return (
      <Link to={link} className={styles.registrationPickCard}>
        <img style={{width: "134px", height: "113px"}} src={img} alt="" />
        <p>{title}</p>
        <p>{subtitle}</p>
      </Link>
  );
};

export default RegistrationPickCard;