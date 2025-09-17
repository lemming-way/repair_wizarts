import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
    getArticleComments,
    createArticleComment,
    likeArticle,
    dislikeArticle
} from "../../services/article.service"
import { useService } from "../../hooks/useService"
import ArticleComment from "./ArticleComment"
import likeImage from '../../img/like.png'
import dislikeImage from '../../img/dislike.png'
import styles from "./Article.module.css"

const ArticleComments = (props) => {
    const {
        articleId,
        likes
    } = props

    const navigate = useNavigate()

    // для тестов
    const [comments, setComments] = useState([])
    
    const [comment, setComment] = useState("")

    const onLike = (e) => likeArticle(articleId)
    const onDislike = (e) => dislikeArticle(articleId)

    useEffect(() => {
        getArticleComments(articleId)
            .then(setComments)
    }, [articleId])

    const onSubmit = (e) => {
        e.preventDefault()

        return createArticleComment(articleId, { text: comment })
            .then(() => {
                getArticleComments(articleId)
                .then(setComments)
                setComment("")
            })
            .catch((err) => {
                if (err.status === 401) {
                    navigate("/register/client")
                }
            })
    }

    return (
        <div className={styles.comments}>
            <div className={styles.commentsLikes}>
                <span className={styles.commentsLabel}>Оценка статьи:</span>
                <span className={styles.commentsCount}>{likes}</span>
                <button
                    className={styles.commentsThumb}
                    onClick={onLike}
                >
                    <img
                        src={likeImage}
                        alt="like"
                    />
                </button>
                <span className={styles.count_like}>5</span>
                <button
                    className={styles.commentsThumb}
                    onClick={onDislike}
                >
                    <img
                        src={dislikeImage}
                        alt="dislike"
                    />
                </button>
                <span className={styles.count_dislike}>-2</span>
            </div>
            <form
                className={styles.commentsForm}
                onSubmit={onSubmit}
            >
                <textarea
                    className={styles.commentsText}
                    value={comment}
                    placeholder="Написать комментарий к статье"
                    onChange={(e) => setComment(e.target.value)}
                />
                <button
                    className={styles.commentsSubmit}
                    type="submit"
                >
                    Отправить
                </button>
            </form>
            <ul className={styles.commentsList}>
                {comments.map((v) => (
                    <li className={styles.commentsListItem} key={v.id}>
                        <ArticleComment
                            id={v.id}
                            {...v}
                        />
                    </li>
                ))}
                {/* <ArticleComment id={comments[0].id} {...comments[0]} isAnswer={true} /> */}
            </ul>
        </div>
    )
}

export default ArticleComments
