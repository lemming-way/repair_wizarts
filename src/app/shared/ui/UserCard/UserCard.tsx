import { MouseEventHandler } from 'react';
import { Link } from 'react-router-dom';
import { Rating } from 'react-simple-star-rating';

import { useLanguage } from 'app/state/language';
import { UserProfile, UserRole, BusinessModel } from 'app/state/user';
import { UserAvatar } from './UserAvatar';

import styles from './UserCard.module.css';

type UserCardProps = {
  user?: UserProfile;
  onLearnMoreClick?: MouseEventHandler<HTMLButtonElement>;
};

export function UserCard({ user, onLearnMoreClick, ...otherProps }: UserCardProps) {
  const text = useLanguage();

  if (!user) return null;

  const isContractor = user.role === UserRole.Contractor;

  return (
    <div className={styles.info} {...otherProps}>
      <div className={styles.info__row1}>
        <UserAvatar user={user} />
        <div className={styles.info__about}>
          <p>{user.fullname}</p>
          {isContractor &&
            <>
              <p>{text(user.businessModel)}</p>
              <div>
                <Rating
                  size={18}
                  readonly
                  initialValue={4.2/* user.rating  todo: Добавить загрузку рейтинга */}
                  allowFraction
                  fillColor="#FFC107"
                  emptyColor="#E4E5E9"
                />
              </div>
            <div className={styles.info_row_links}>
              <Link to={`/client/feedback/${user.id}`}>
                {11/* user.reviews  todo: Добавить загрузку отзывов*/} {text('reviews received')}
              </Link>
              {!!onLearnMoreClick &&
                <button
                  type="button"
                  className={styles.row_link}
                  onClick={onLearnMoreClick}
                >
                  {text('Learn more')}
                </button>
              }
            </div>
            </>
          }
        </div>
      </div>

      {isContractor &&
        <>
          <p>
            <span className={styles.info__text_about_light}>
              {text('Address')}
            </span>
            {user.address}
          </p>
          <p>
            <span className={styles.info__text_about_light}>
              {text('Organization name')}
            </span>
            {(user.businessModel === BusinessModel.ServiceCenter && user.organizationName) || text('No organization')}
          </p>
          <p>
            <span className={styles.info__text_about_light}>
              {text('Experience')}
            </span>
            {user.experience} {text('year(s)')}
          </p>
          <p>
            <span className={styles.info__text_about_light}>
              {text('On the platform')}
            </span>
            {text('since')} {user.registrationDate.getFullYear()}
          </p>
          <p>
            <span className={styles.info__text_about_light}>
              {text('Status')}
            </span>
            {text(user.isOnline ? 'Online' : 'Offline')}
          </p>
          <p>
            <span className={styles.info__text_about_light}>
              {text('Orders completed')}
            </span>
            {22/* user.ordersCompleted  todo: Добавить реальную статистику */}
          </p>
          <p>
            <span className={styles.info__text_about_light}>
              {text('Orders delivered successfully')}
            </span>
            {18/* user.successRate  todo: Добавить реальную статистику */}
          </p>
          <p>
            <span className={styles.info__text_about_light}>
              {text('Repeat orders')}
            </span>
            {2/* user.repeatOrders  todo: Добавить реальную статистику */}
          </p>
        </>
      }
    </div>
  );
}
