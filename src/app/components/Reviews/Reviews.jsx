import styles from './Reviews.module.css'
import ReviewsForm from './ReviewsForm'
import ReviewsReview from './ReviewsReview'
//~ import { useService } from '../../hooks/useService'
//~ import { getReviews } from '../../services/reviews.service'

const Reviews = (props) => {
    //~ const reviews = useService(getReviews, [])
    // todo: Заглушка. Нужно добавить получение реальных отзывов с сервера
    const reviews = {data: [
        {
            id: 1234,
            sender: "Иван Иванович",
            rating: 5,
            message: "Здесь будет отзыв",
            created_at: "2024-11-03"
        },
        {
            id: 8764,
            sender: "Яков Петрович",
            rating: 4,
            message: "Зашёл проверить — всё грузится. Думаю, ну где подвох? А подвоха нет. Даже странно. Работает как часы. Вернусь, когда бэкенд допилят — тогда и поворчу, если что. Но пока — твёрдая пятёрка.",
            created_at: "2025-07-16"
        }
    ]};


    return (
        <div className={styles.container}>
            <ReviewsForm />
            <div className={styles.reviews}>
                {/* {reviews.data.map((v) => ( */}
                {reviews.data.map((v) => (
                    <ReviewsReview {...v} key={v.id} />
                ))}
            </div>
        </div>
    )
}

export default Reviews
