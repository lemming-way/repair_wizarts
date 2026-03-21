import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

import styles from "./Article.module.css"
import ArticleComment from "./ArticleComment"
import dislikeImage from '../../img/dislike.png'
import likeImage from '../../img/like.png'
// todo: Добавить реальные вызовы API для комментариев и лайков/дизлайков статьи
// import {
//     getArticleComments,
//     createArticleComment,
//     likeArticle,
//     dislikeArticle
// } from "../../services/article.service"
import { useLanguage } from '../../state/language'

const mockCommentsData = [
    {
        id: 1,
        sender: { name: "Иван", lastname: "Петров" },
        text: "Отличная статья, очень полезно!",
        likes: 15,
        created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        isAnswer: false
    },
    {
        id: 2,
        sender: { name: "Мария", lastname: "Сидорова" },
        text: "Спасибо за информацию, давно искала нечто подобное.",
        likes: 8,
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        isAnswer: false
    },
    {
        id: 3,
        sender: { name: "Алексей", lastname: "Козлов" },
        text: "Есть ли еще статьи на эту тему?",
        likes: 2,
        created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        isAnswer: false
    }
];

const ArticleComments = (props) => {
    const {
        articleId,
        likes
    } = props

    const text = useLanguage()
    const navigate = useNavigate()

    const [comments, setComments] = useState([])
    const [comment, setComment] = useState("")

    // todo: Заменить на реальный вызов likeArticle(articleId)
    const onLike = (e) => Promise.resolve().then(() => console.log(`Liked article ${articleId}`))
    // todo: Заменить на реальный вызов dislikeArticle(articleId)
    const onDislike = (e) => Promise.resolve().then(() => console.log(`Disliked article ${articleId}`))

    useEffect(() => {
        // todo: Заменить на реальный вызов getArticleComments(articleId)
        Promise.resolve(mockCommentsData)
            .then(setComments)
    }, [articleId])

    const onSubmit = (e) => {
        e.preventDefault()

        // todo: Заменить на реальный вызов createArticleComment(articleId, { text: comment })
        return Promise.resolve()
            .then(() => {
                // Добавление нового комментария в фиктивные данные
                const newComment = {
                    id: comments.length + 1,
                    sender: { name: "Тестовый", lastname: "Пользователь" },
                    text: comment,
                    likes: 0,
                    created_at: new Date().toISOString(),
                    isAnswer: false
                };
                setComments(prevComments => [...prevComments, newComment]);
                setComment("")
            })
            .catch((err) => {
                if (err?.status === 401) { // Используем err?.status для безопасного доступа
                    navigate("/register/client")
                } else {
                    console.error("Ошибка при создании комментария (фиктивная):", err);
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
                    placeholder={text('Comment the article')}
                    onChange={(e) => setComment(e.target.value)}
                />
                <button
                    className={styles.commentsSubmit}
                    type="submit"
                >
                    {text('Submit')}
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
