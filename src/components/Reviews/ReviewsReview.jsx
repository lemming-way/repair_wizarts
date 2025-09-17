import { Rating } from 'react-simple-star-rating'
import formatDate from '../../utilities/formatDate'
import styles from './Reviews.module.css'
import SERVER_PATH from '../../constants/SERVER_PATH'

const ReviewsReview = (props) => {
    const {
        sender,
        rating,
        message,
        created_at
    } = props

    return (
        <div className={styles.review}>
            <div className={styles.reviewHeader}>
                <img
                    alt="client"
                    src={SERVER_PATH + "/files/user.png"}
                    className={styles.reviewHeaderImage}
                />
                <div className={styles.reviewHeaderInfo}>
                    <h3 className={styles.reviewHeaderTitle}>{sender}</h3>
                    <span className={styles.reviewHeaderDate}>
                        {formatDate(created_at)}
                    </span>
                </div>
            </div>
            <div className={styles.reviewStars}>
                <Rating
                    initialValue={rating}
                    readonly
                    size="20"
                />
                <span className={styles.reviewStarsCount}>{rating}</span>
            </div>
            <div className={styles.reviewMessage}>
                <span className={styles.reviewMessageLabel}>Комментарий</span>
                <p>{message}</p>
            </div>
        </div>
    )
}

export default ReviewsReview
