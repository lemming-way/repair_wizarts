import { useState } from 'react'
import { useSelector } from 'react-redux'
import { Popup } from 'reactjs-popup'
import { Rating } from 'react-simple-star-rating'
import { selectUser } from '../../slices/user.slice'
import { createReview } from '../../services/reviews.service'
import styles from './Reviews.module.css'

const ReviewsForm = (props) => {
    const user = useSelector(selectUser)

    const [modalOpen, setModalOpen] = useState(false)
    const openModal = () => setModalOpen(true)
    const closeModal = () => setModalOpen(false)

    const [rating, setRating] = useState(0)
    const onRatingChange = (value) => setRating(value)
    const [message, setMessage] = useState("")
    const onMessageChange = (e) => setMessage(e.target.value)

    const onSubmit = (e) => {
        e.preventDefault()

        return createReview({
            rating,
            message,
            sender: `${user.name} ${user.lastname}`
        }).then(() => openModal())
    }

    return (
        <form className={styles.form} onSubmit={onSubmit}>
            <Popup open={modalOpen} onClose={closeModal}>
                <div className={styles.formModal}>
                    <h3 className={styles.formModalTitle}>Ваш отзыв отправлен на модерацию</h3>
                    <button
                        className={styles.formModalButton}
                        onClick={closeModal}
                    >
                        Закрыть
                    </button>
                </div>
            </Popup>
            <h3 className={styles.formTitle}>Оценка и комментарий</h3>
            <Rating
                onClick={onRatingChange}
                initialValue={rating}
                size="32"
            />
            <textarea
                className={styles.formInput}
                value={message}
                onChange={onMessageChange}
                placeholder="Введите отзыв без оскорблений и нецензурной лексики"
            />
            <button
                className={styles.formSubmit}
                onClick={()=>setModalOpen(true)}
                type="submit"
            >
                Отправить
            </button>
        </form>
    )
}

export default ReviewsForm
