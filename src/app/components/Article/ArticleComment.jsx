import styles from "./Article.module.css"
import dislikeImage from "../../img/dislike.png"
import likeImage from "../../img/like.png"
// todo: Добавить реальный вызов API для лайков/дизлайков комментариев
// import {
//     likeArticleComment,
//     dislikeArticleComment
// } from "../../services/article.service"
import { useLanguage } from '../../state/language'
import formatDate from "../../utilities/formatDate"

const ArticleComment = (props) => {
    const {
        id,
        sender,
        text: commentText,
        likes,
        created_at,
        isAnswer
    } = props

    const text = useLanguage()
    // todo: Заменить на реальный вызов likeArticleComment(id)
    const onLike = () => Promise.resolve().then(() => console.log(`Liked comment ${id}`))
    // todo: Заменить на реальный вызов dislikeArticleComment(id)
    const onDislike = () => Promise.resolve().then(() => console.log(`Disliked comment ${id}`))

    return (
        <div className={`${styles.comment} ${isAnswer? styles.isAnswer : ""}`}>
            <div className={styles.commentUser}>
                <img
                    className={styles.commentUserAvatar}
                    // src={SERVER_PATH + sender.avatar}
                    src="/img/img-kiril.png"
                    alt="user avatar"
                />
                <div className={styles.commentUserInfo}>
                    <div className={styles.commentUserName}>{sender.name} {sender.lastname}
                    {isAnswer? 
                        <div>
                            <img src="/img/icons/answer.png" alt="" style={{marginRight: "10px"}} />
                            <span style={{color: "grey"}}>Логин</span>
                        </div> 
                        : null}
                    </div>
                    <div className={styles.commentUserDate}>{formatDate(created_at)}</div>
                </div>
            </div>
            <div className={styles.commentContent}>
                {commentText}
            </div>
            <div className={styles.commentLikes}>
                <span className={styles.answer}>{text('Reply')}</span>
                <button
                    className={styles.commentThumb}
                    onClick={onLike}
                >
                    <img src={likeImage} alt="like" />
                </button>
                <button
                    className={styles.commentThumb}
                    onClick={onDislike}
                >
                    <img src={dislikeImage} alt="dislike" />
                </button>
                <span className={styles.commentCount}>{likes}</span>
            </div>
        </div>
    )
}

export default ArticleComment
