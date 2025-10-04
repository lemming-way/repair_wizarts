import { useState } from 'react'
import { useSelector } from 'react-redux'
import { Rating } from 'react-simple-star-rating'
import { Popup } from 'reactjs-popup'

import styles from './Reviews.module.css'
import { createReview } from '../../services/reviews.service'
import { selectUser } from '../../slices/user.slice'
import { useLanguage } from '../../state/language'

const ReviewsForm = (props) => {
    const text = useLanguage()
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
                    <h3 className={styles.formModalTitle}>{text('Your review has been sent for moderation')}</h3>
                    <button
                        className={styles.formModalButton}
                        onClick={closeModal}
                    >
                        {text('Close')}
                    </button>
                </div>
            </Popup>
            <h3 className={styles.formTitle}>{text('Rating and comments')}</h3>
            <Rating
                onClick={onRatingChange}
                initialValue={rating}
                size="32"
            />
            <textarea
                className={styles.formInput}
                value={message}
                onChange={onMessageChange}
                placeholder={text('Enter a review without insults or profanity')}
            />
            <button
                className={styles.formSubmit}
                onClick={()=>setModalOpen(true)}
                type="submit"
            >
                {text('Submit')}
            </button>
        </form>
    )
}

export default ReviewsForm
