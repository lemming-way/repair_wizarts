import { useLanguage } from 'app/state/language';
import { BusinessModel } from 'app/state/user';
import styles from './Map.module.css';

export function ContractorDetails({ contractor }) {
  const text = useLanguage();
  const businessModelText = contractor.businessModel === BusinessModel.ServiceCenter
    ? text('Service center')
    : text('Independent technician');
  
  return (
    <div className={styles.balloon}>
        <div className={styles.balloonHeader}>
            <div className={styles.balloonHeaderPicture}>
                <img
                  src={contractor.avatar || '/user_avatar.png'}
                  alt={contractor.fullname}
                  className={styles.balloonHeaderPictureImg} />
            </div>
            <div className={styles.balloonHeaderInfo}>
                <h3 className={styles.balloonHeaderName}>
                    {contractor.fullname}
                </h3>
                <p className={styles.balloonHeaderType}>{businessModelText}</p>
                {/* todo: добавить рейтинг мастера
                <div className={styles.balloonHeaderRate}>
                    {contractor.rating}
                </div>
                */}
            </div>
        </div>
        <div className={styles.balloonBody}>
            <p className={styles.balloonBodyAddress}>{contractor.address}</p>
            <div className={styles.balloonBodyBottom}>
                <div className={styles.balloonBodyInfo}>
                    <div className={styles.ballonBodyInfoTitle}>
                        На сайте:
                    </div>
                    <div className={styles.ballonBodyInfoContent}>
                        с 2023 года
                    </div>
                    {/* todo: зачем-то второй раз рейтинг. может, что-нибудь другое?
                    <div className={styles.ballonBodyInfoTitle}>
                        Оценка:
                    </div>
                    <div className={styles.ballonBodyInfoContent}>
                        {contractor.rating}/5
                    </div>
                    */}
                    <div className={styles.ballonBodyInfoTitle}>
                        Имя организации:
                    </div>
                    <div className={styles.ballonBodyInfoContent}>
                        {contractor.organizationName}
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
}
